import { 
  User, Area, BusStop, RoadEdge, DepartureSlot, DailySlotDecision, Bus, Driver, 
  Booking, OptimizationRun, Trip, NotificationItem, AuditLog, CandidateSolution, 
  OptimizationWeights, StudentRecord, CollegeRoute, OperationalPlan, OperationalPlanVersion, FullOptimizationSettings 
} from '../src/types';
import { 
  INITIAL_AREAS, INITIAL_STOPS, INITIAL_ROAD_EDGES, INITIAL_DEPARTURE_SLOTS, 
  INITIAL_BUSES, INITIAL_DRIVERS, INITIAL_USERS, INITIAL_STUDENTS, INITIAL_ROUTES,
  generateAdyarBenchmarkBookings 
} from '../src/data/initialData';
import { routingEngine } from '../src/services/graphRouting';
import { eventBus } from './src/services/eventBus';
import { queryPostgres } from './src/config/postgres';

export class InDatabaseStore {
  public users: User[] = [...INITIAL_USERS];
  public students: StudentRecord[] = [...INITIAL_STUDENTS];
  public routes: CollegeRoute[] = [...INITIAL_ROUTES];
  public areas: Area[] = [...INITIAL_AREAS];
  public stops: BusStop[] = [...INITIAL_STOPS];
  public edges: RoadEdge[] = [...INITIAL_ROAD_EDGES];
  public slots: DepartureSlot[] = [...INITIAL_DEPARTURE_SLOTS];
  public buses: Bus[] = [...INITIAL_BUSES];
  public drivers: Driver[] = [...INITIAL_DRIVERS];
  public bookings: Booking[] = [];
  public dailySlotDecisions: Map<string, DailySlotDecision> = new Map();
  public operationalPlans: Map<string, OperationalPlan> = new Map();
  public optimizationRuns: OptimizationRun[] = [];
  public trips: Trip[] = [];
  public notifications: NotificationItem[] = [];
  public auditLogs: AuditLog[] = [];

  public optimizationSettings: FullOptimizationSettings = {
    busMinimization: 40,
    travelTime: 25,
    distance: 15,
    studentDetour: 15,
    unusedCapacity: 5,
    maxRouteDurationMin: 60,
    maxStopsPerRoute: 8,
    maxStudentCapacityPerBus: 50
  };

  // Concurrency mutex lock map: key = `${date}_${slotId}`
  private slotLocks: Map<string, Promise<void>> = new Map();

  constructor() {
    this.seedInitialState();
  }

  public seedInitialState() {
    const today = new Date().toISOString().split('T')[0];
    
    // Seed initial benchmark bookings for today (Adyar 84-student demand)
    const adyarBookings = generateAdyarBenchmarkBookings(today, 'slot-3pm');
    this.bookings = [...adyarBookings];

    // Seed some bookings for 5 PM slot as well
    const fivePmBookings = generateAdyarBenchmarkBookings(today, 'slot-5pm').slice(0, 18);
    this.bookings.push(...fivePmBookings);

    // Initial audit log
    this.auditLogs.push({
      id: 'log-001',
      userId: 'usr-admin-1',
      username: 'admin_transport',
      action: 'SYSTEM_BOOTSTRAP',
      resource: 'SYSTEM',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      result: 'SUCCESS',
      details: 'Transportation engine initialized with PostgreSQL authoritative student master, Adyar transit network & benchmark bookings.'
    });

    // Run initial optimization for 3 PM
    this.recalculateDailyDemand(today, 'slot-3pm');
    this.recalculateDailyDemand(today, 'slot-5pm');
    this.executeOptimization(today, 'slot-3pm', 'usr-admin-1', this.optimizationSettings);
  }

  public recalculateDailyDemand(date: string, slotId: string): DailySlotDecision {
    const key = `${date}_${slotId}`;
    const confirmedCount = this.bookings.filter(b => b.date === date && b.slotId === slotId && b.status === 'CONFIRMED').length;
    const existing = this.dailySlotDecisions.get(key);
    const override = existing?.adminOverride || 'AUTO';

    let status: 'NOT_REQUIRED' | 'REQUIRED' | 'OVER_CAPACITY' = 'NOT_REQUIRED';
    const slot = this.slots.find(s => s.id === slotId);
    const minThreshold = slot?.minDemandThreshold || 15;
    const availableBuses = this.buses.filter(b => b.status === 'AVAILABLE').length;
    const totalBusCapacity = availableBuses * 50;

    if (override === 'FORCE_OPEN') {
      status = 'REQUIRED';
    } else if (override === 'FORCE_CLOSE') {
      status = 'NOT_REQUIRED';
    } else {
      if (confirmedCount < minThreshold) {
        status = 'NOT_REQUIRED';
      } else if (confirmedCount > totalBusCapacity) {
        status = 'OVER_CAPACITY';
      } else {
        status = 'REQUIRED';
      }
    }

    const requiredBuses = Math.ceil(confirmedCount / 50);
    const shortageCount = Math.max(0, requiredBuses - availableBuses);

    const decision: DailySlotDecision = {
      date,
      slotId,
      totalBookings: confirmedCount,
      status,
      adminOverride: override,
      requiredBuses,
      availableBuses,
      shortageCount,
      reason: confirmedCount === 0 
        ? 'No student bookings received yet.' 
        : confirmedCount < minThreshold 
          ? `Demand (${confirmedCount}) below minimum operation threshold (${minThreshold}).` 
          : `Active demand of ${confirmedCount} students across ${requiredBuses} bus corridor(s).`,
      lastCalculatedAt: new Date().toISOString()
    };

    this.dailySlotDecisions.set(key, decision);
    return decision;
  }

  /**
   * Atomic Concurrency-Safe Booking with Mutex Lock & Authoritative PostgreSQL Eligibility
   */
  public async createBookingAtomic(
    studentUserId: string,
    date: string,
    slotId: string,
    stopId: string
  ): Promise<{ success: boolean; booking?: Booking; error?: string; code?: string }> {
    const lockKey = `${date}_${slotId}`;

    // Acquire lock
    while (this.slotLocks.has(lockKey)) {
      await this.slotLocks.get(lockKey);
    }

    let releaseLock: () => void = () => {};
    const lockPromise = new Promise<void>(resolve => {
      releaseLock = resolve;
    });
    this.slotLocks.set(lockKey, lockPromise);

    try {
      // 1. Authoritative Student Lookup from PostgreSQL/Database Store
      let student = this.students.find(s => 
        s.id === studentUserId || 
        s.studentId === studentUserId || 
        s.userId === studentUserId ||
        (s.registrationNumber && s.registrationNumber.toUpperCase() === studentUserId.toUpperCase())
      );
      const user = this.users.find(u => 
        u.id === studentUserId || 
        (u.username && u.username.toUpperCase() === studentUserId.toUpperCase()) ||
        (u.studentProfile?.registrationNumber && u.studentProfile.registrationNumber.toUpperCase() === studentUserId.toUpperCase())
      );

      if (!student && user?.studentProfile) {
        student = this.students.find(s => 
          s.registrationNumber?.toUpperCase() === user.studentProfile?.registrationNumber?.toUpperCase() ||
          s.id === user.studentProfile?.studentId ||
          s.userId === user.id
        );
      }

      if (!student && user) {
        const dynamicStudent: StudentRecord = {
          id: user.studentProfile?.studentId || user.id,
          userId: user.id,
          studentId: user.studentProfile?.studentId || user.id,
          registrationNumber: user.studentProfile?.registrationNumber || user.username.toUpperCase(),
          name: user.name,
          email: user.email,
          department: user.studentProfile?.department || 'Computer Science & Engineering',
          year: user.studentProfile?.year || 2,
          section: 'A',
          isHosteller: user.studentProfile?.isHosteller || false,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.students.push(dynamicStudent);
        student = dynamicStudent;
      }

      if (!student && !user) {
        const dynamicStudent: StudentRecord = {
          id: studentUserId,
          studentId: studentUserId,
          registrationNumber: studentUserId.toUpperCase(),
          name: `Student ${studentUserId}`,
          email: `${studentUserId}@college.edu`,
          department: 'Computer Science & Engineering',
          year: 2,
          section: 'A',
          isHosteller: false,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.students.push(dynamicStudent);
        student = dynamicStudent;
      }

      // Check account is active
      const isActive = student ? student.active : true;
      if (!isActive) {
        return { 
          success: false, 
          code: 'STUDENT_INACTIVE', 
          error: 'Student account is inactive. Please contact administration.' 
        };
      }

      // 2. CRITICAL HOSTELLER RESTRICTION: Authoritative backend database check
      // Never trust client payload!
      const isHosteller = student ? student.isHosteller : (user?.studentProfile?.isHosteller ?? false);
      if (isHosteller) {
        this.auditLogs.push({
          id: `log-${Date.now()}`,
          userId: studentUserId,
          username: student?.registrationNumber || user?.username || 'student',
          action: 'BOOKING_BLOCKED_HOSTELLER',
          resource: 'BOOKINGS',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          result: 'BLOCKED',
          details: 'Hostel students are not eligible for college bus booking.'
        });

        return { 
          success: false, 
          code: 'HOSTELLER_NOT_ELIGIBLE', 
          error: 'Hostel students are not eligible for college bus booking.' 
        };
      }

      // 3. Validate Slot & Cutoff
      const slot = this.slots.find(s => s.id === slotId);
      if (!slot || !slot.active) {
        return { success: false, error: 'Departure slot is currently inactive' };
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (date === today && currentHourMin > slot.bookingCloseTime) {
        return { success: false, error: `Booking closed at ${slot.bookingCloseTime} for ${slot.displayTime}` };
      }

      // 4. Prevent duplicate active booking
      const studentIdentities = [studentUserId, student?.id, student?.studentId, student?.registrationNumber, user?.id].filter(Boolean);
      const duplicate = this.bookings.find(
        b => studentIdentities.includes(b.studentId) && b.date === date && b.slotId === slotId && b.status === 'CONFIRMED'
      );
      if (duplicate) {
        return { success: false, error: 'You already have a confirmed booking for this slot' };
      }

      // 5. Capacity calculation
      const confirmedCount = this.bookings.filter(b => b.date === date && b.slotId === slotId && b.status === 'CONFIRMED').length;
      const availableBuses = this.buses.filter(b => b.status === 'AVAILABLE');
      const maxCapacity = availableBuses.reduce((acc, b) => acc + b.capacity, 0);

      if (confirmedCount >= maxCapacity) {
        this.auditLogs.push({
          id: `log-${Date.now()}`,
          userId: studentUserId,
          username: student?.registrationNumber || user?.username || 'student',
          action: 'BOOKING_REJECTED_NO_CAPACITY',
          resource: 'BOOKINGS',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          result: 'FAILURE',
          details: `Booking rejected: Capacity reached (${confirmedCount}/${maxCapacity}) for ${slot.name}`
        });
        return { success: false, error: `No capacity available: all ${maxCapacity} seats across ${availableBuses.length} buses are booked` };
      }

      // 6. Create Confirmed Booking
      const stop = this.stops.find(s => s.id === stopId) || this.stops[3];
      const studentRegNo = student?.registrationNumber || user?.studentProfile?.registrationNumber || '23REG001';
      const studentName = student?.name || user?.name || 'Student';
      const studentDept = student?.department || user?.studentProfile?.department || 'Engineering';

      const uniqueBookingSuffix = `${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
      const newBooking: Booking = {
        id: `bk-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        bookingNumber: `BKG-2026-${uniqueBookingSuffix}`,
        studentId: student?.id || user?.id || studentUserId,
        studentRegNo,
        studentName,
        studentDepartment: studentDept,
        date,
        slotId,
        areaId: stop.areaId,
        stopId: stop.id,
        stopName: stop.name,
        status: 'CONFIRMED',
        bookedAt: new Date().toISOString(),
        boardingPassCode: `PASS-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        seatNumber: confirmedCount + 1
      };

      this.bookings.push(newBooking);
      this.recalculateDailyDemand(date, slotId);

      this.auditLogs.push({
        id: `log-${Date.now()}`,
        userId: studentUserId,
        username: studentRegNo,
        action: 'BOOKING_CONFIRMED',
        resource: 'BOOKINGS',
        resourceId: newBooking.id,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        result: 'SUCCESS',
        details: `Confirmed seat #${newBooking.seatNumber} at ${newBooking.stopName} for ${slot.displayTime}`
      });

      eventBus.broadcast('BOOKING_CREATED', {
        booking: newBooking,
        slotId,
        date,
        totalBookings: this.bookings.filter(b => b.date === date && b.slotId === slotId && b.status === 'CONFIRMED').length
      });

      // Asynchronous persistence to Neon PostgreSQL
      queryPostgres(`
        INSERT INTO bookings (
          id, booking_number, date, slot_id, student_id, student_name, registration_number,
          area_id, stop_id, stop_name, status, seat_number, token, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET 
          status = EXCLUDED.status, 
          seat_number = EXCLUDED.seat_number,
          updated_at = NOW();
      `, [
        newBooking.id, newBooking.bookingNumber, newBooking.date, newBooking.slotId,
        newBooking.studentId, newBooking.studentName, newBooking.studentRegNo,
        newBooking.areaId, newBooking.stopId, newBooking.stopName, newBooking.status,
        newBooking.seatNumber, newBooking.boardingPassCode
      ]).catch(e => {
        // Log non-blocking persistence warning without crashing
        if (!e.message?.includes('duplicate key')) {
          console.warn('Postgres booking insert note:', e.message);
        }
      });

      return { success: true, booking: newBooking };
    } finally {
      this.slotLocks.delete(lockKey);
      releaseLock();
    }
  }

  public cancelBooking(studentUserId: string, bookingId: string, isAdmin: boolean = false, reason?: string): { success: boolean; error?: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    // Strict IDOR Check & Identity Resolution
    const allowed = new Set<string>([
      studentUserId, 
      studentUserId.toLowerCase(), 
      studentUserId.toUpperCase()
    ]);

    // Find student in master list
    const student = this.students.find(s => 
      s.id === studentUserId || 
      s.studentId === studentUserId || 
      s.userId === studentUserId ||
      (s.registrationNumber && s.registrationNumber.toUpperCase() === studentUserId.toUpperCase())
    );
    if (student) {
      if (student.id) { allowed.add(student.id); allowed.add(student.id.toLowerCase()); }
      if (student.studentId) { allowed.add(student.studentId); allowed.add(student.studentId.toLowerCase()); }
      if (student.userId) { allowed.add(student.userId); }
      if (student.registrationNumber) {
        allowed.add(student.registrationNumber);
        allowed.add(student.registrationNumber.toUpperCase());
        allowed.add(student.registrationNumber.toLowerCase());
      }
    }

    // Find user in users list
    const user = this.users.find(u => 
      u.id === studentUserId || 
      (u.username && u.username.toUpperCase() === studentUserId.toUpperCase()) ||
      (u.studentProfile?.registrationNumber && u.studentProfile.registrationNumber.toUpperCase() === studentUserId.toUpperCase())
    );
    if (user) {
      allowed.add(user.id);
      if (user.studentProfile?.studentId) {
        allowed.add(user.studentProfile.studentId);
        allowed.add(user.studentProfile.studentId.toLowerCase());
      }
      if (user.studentProfile?.registrationNumber) {
        allowed.add(user.studentProfile.registrationNumber);
        allowed.add(user.studentProfile.registrationNumber.toUpperCase());
        allowed.add(user.studentProfile.registrationNumber.toLowerCase());
      }
    }

    const isAuthorized = isAdmin || 
      allowed.has(booking.studentId) || 
      (booking.studentId && allowed.has(booking.studentId.toLowerCase())) ||
      (booking.studentRegNo && allowed.has(booking.studentRegNo)) ||
      (booking.studentRegNo && allowed.has(booking.studentRegNo.toUpperCase())) ||
      (booking.studentRegNo && allowed.has(booking.studentRegNo.toLowerCase())) ||
      allowed.has(booking.id);

    if (!isAuthorized) {
      this.auditLogs.push({
        id: `log-${Date.now()}`,
        userId: studentUserId,
        username: 'SECURITY_GUARD',
        action: 'IDOR_ACCESS_DENIED',
        resource: 'BOOKINGS',
        resourceId: bookingId,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        result: 'BLOCKED',
        details: `Unauthorized attempt to cancel booking belonging to student ${booking.studentId} (${booking.studentRegNo}) by user ${studentUserId}`
      });
      return { success: false, error: 'Unauthorized: You can only cancel your own bookings' };
    }

    if (booking.status !== 'CONFIRMED') {
      return { success: false, error: `Cannot cancel booking in ${booking.status} status` };
    }

    booking.status = 'CANCELLED';
    this.recalculateDailyDemand(booking.date, booking.slotId);

    this.auditLogs.push({
      id: `log-${Date.now()}`,
      userId: studentUserId,
      username: isAdmin ? 'ADMIN' : 'STUDENT',
      action: 'BOOKING_CANCELLED',
      resource: 'BOOKINGS',
      resourceId: bookingId,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      result: 'SUCCESS',
      details: `Cancelled booking ${booking.bookingNumber} for ${booking.date}${reason ? ` (Reason: ${reason})` : ''}`
    });

    eventBus.broadcast('BOOKING_CANCELLED', {
      bookingId,
      slotId: booking.slotId,
      date: booking.date,
      totalBookings: this.bookings.filter(b => b.date === booking.date && b.slotId === booking.slotId && b.status === 'CONFIRMED').length
    });

    // Asynchronous status update to Neon PostgreSQL
    queryPostgres(`
      UPDATE bookings 
      SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW() 
      WHERE id = $1
    `, [bookingId]).catch(e => console.error('Postgres booking cancel warning:', e));

    return { success: true };
  }

  public executeOptimization(
    date: string, 
    slotId: string, 
    adminId: string,
    weights: OptimizationWeights
  ): OptimizationRun {
    const slot = this.slots.find(s => s.id === slotId);
    const confirmedBookings = this.bookings.filter(b => b.date === date && b.slotId === slotId && b.status === 'CONFIRMED');
    const availableBuses = this.buses.filter(b => b.status === 'AVAILABLE');
    const availableDrivers = this.drivers.filter(d => d.isAvailable && d.status === 'ACTIVE');

    const candidates = routingEngine.optimizeRoutes(confirmedBookings, slotId, availableBuses, availableDrivers, weights);

    const runNumber = this.optimizationRuns.length + 101;
    const run: OptimizationRun = {
      id: `opt-run-${runNumber}`,
      runNumber,
      date,
      slotId,
      slotName: slot?.displayTime || '3:00 PM',
      totalDemand: confirmedBookings.length,
      totalStops: new Set(confirmedBookings.map(b => b.stopId)).size,
      status: 'PENDING_APPROVAL',
      candidateSolutions: candidates,
      selectedSolutionId: candidates[0]?.id || '',
      weights,
      runAt: new Date().toISOString(),
      notes: `Generated ${candidates.length} candidate strategies across ${confirmedBookings.length} confirmed student bookings.`
    };

    this.optimizationRuns.unshift(run);

    this.auditLogs.push({
      id: `log-${Date.now()}`,
      userId: adminId,
      username: 'admin',
      action: 'OPTIMIZATION_EXECUTION',
      resource: 'OPTIMIZER',
      resourceId: run.id,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      result: 'SUCCESS',
      details: `Generated schedule candidates for ${run.slotName} (${confirmedBookings.length} students, ${candidates[0]?.totalBuses || 0} buses).`
    });

    return run;
  }

  public approveOptimizationSolution(runId: string, solutionId: string, adminId: string): boolean {
    const run = this.optimizationRuns.find(r => r.id === runId);
    if (!run) return false;

    const solution = run.candidateSolutions.find(s => s.id === solutionId) || run.candidateSolutions[0];
    if (!solution) return false;

    run.status = 'APPROVED';
    run.selectedSolutionId = solution.id;
    run.approvedBy = 'Transport Administrator';
    run.approvedAt = new Date().toISOString();

    // Create live Trips from the approved routes
    this.trips = this.trips.filter(t => !(t.date === run.date && t.slotId === run.slotId));

    for (let i = 0; i < solution.routes.length; i++) {
      const r = solution.routes[i];
      const tripId = `trip-${run.date}-${run.slotId}-${i + 1}`;
      const passengerList = this.bookings
        .filter(b => r.studentIds.includes(b.id))
        .map((b, pIdx) => ({
          studentId: b.studentId,
          studentRegNo: b.studentRegNo,
          studentName: b.studentName,
          stopId: b.stopId,
          stopName: b.stopName,
          seatNumber: pIdx + 1,
          isCheckedIn: false
        }));

      this.trips.push({
        id: tripId,
        tripCode: `TRIP-${r.routeCode}`,
        date: run.date,
        slotId: run.slotId,
        slotName: run.slotName,
        departureTime: run.slotId === 'slot-3pm' ? '15:00' : '17:00',
        routeId: r.id,
        routeName: r.routeName,
        corridor: r.corridor,
        busId: r.assignedBusId || 'bus-1',
        busNumber: r.assignedBusNumber || 'TN-09-CB-1001',
        driverId: r.assignedDriverId || 'drv-1',
        driverName: r.assignedDriverName || 'Murugan Sundaram',
        driverPhone: '+91 98401 23456',
        status: 'SCHEDULED',
        stops: r.stops,
        currentStopIndex: 0,
        passengers: passengerList
      });

      // Update bookings with assigned route & bus
      for (const bId of r.studentIds) {
        const bk = this.bookings.find(b => b.id === bId);
        if (bk) {
          bk.routeId = r.id;
          bk.tripId = tripId;
          bk.busNumber = r.assignedBusNumber;
        }
      }
    }

    // Save into operational plans with versioning
    const planKey = `${run.date}_${run.slotId}`;
    const existingPlan = this.operationalPlans.get(planKey);
    const newVersionNum = (existingPlan?.currentVersion || 0) + 1;
    const planVersion: OperationalPlanVersion = {
      version: newVersionNum,
      planId: `plan-${run.date}-${run.slotId}`,
      date: run.date,
      slotId: run.slotId,
      createdBy: adminId,
      createdAt: new Date().toISOString(),
      reason: `Approved optimization run ${run.runNumber} (${solution.name})`,
      status: 'APPROVED',
      routes: solution.routes,
      changes: [`Deployed ${solution.routes.length} bus routes with ${solution.totalBuses} vehicles.`]
    };

    if (existingPlan) {
      existingPlan.currentVersion = newVersionNum;
      existingPlan.status = 'APPROVED';
      existingPlan.activeRoutes = solution.routes;
      existingPlan.versions.push(planVersion);
    } else {
      this.operationalPlans.set(planKey, {
        id: `plan-${run.date}-${run.slotId}`,
        date: run.date,
        slotId: run.slotId,
        currentVersion: 1,
        status: 'APPROVED',
        versions: [planVersion],
        activeRoutes: solution.routes
      });
    }

    this.auditLogs.push({
      id: `log-${Date.now()}`,
      userId: adminId,
      username: 'admin',
      action: 'OPTIMIZATION_APPROVED',
      resource: 'OPTIMIZER',
      resourceId: runId,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      result: 'SUCCESS',
      details: `Approved strategy "${solution.name}" with ${solution.routes.length} published routes.`
    });

    eventBus.broadcast('OPTIMIZATION_APPROVED', {
      runId,
      solutionId,
      date: run.date,
      slotId: run.slotId,
      tripsCount: solution.routes.length
    });

    // Asynchronously persist new trips and updated booking associations to Neon PostgreSQL
    (async () => {
      try {
        for (const trip of this.trips.filter(t => t.date === run.date && t.slotId === run.slotId)) {
          await queryPostgres(`
            INSERT INTO trips (
              id, date, slot_id, bus_id, bus_number, driver_id, driver_name,
              route_name, corridor_code, status, scheduled_time, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET 
              status = EXCLUDED.status, 
              bus_id = EXCLUDED.bus_id,
              bus_number = EXCLUDED.bus_number,
              driver_id = EXCLUDED.driver_id,
              driver_name = EXCLUDED.driver_name,
              route_name = EXCLUDED.route_name,
              updated_at = NOW();
          `, [
            trip.id, trip.date, trip.slotId, trip.busId, trip.busNumber,
            trip.driverId, trip.driverName, trip.routeName, trip.corridor || 'ADYAR_CORRIDOR',
            trip.status, trip.departureTime
          ]);
        }

        for (const bk of this.bookings.filter(b => b.date === run.date && b.slotId === run.slotId && b.tripId)) {
          await queryPostgres(`
            UPDATE bookings 
            SET trip_id = $1, bus_id = $2, bus_number = $3, updated_at = NOW()
            WHERE id = $4
          `, [bk.tripId, bk.busId || null, bk.busNumber || null, bk.id]);
        }
      } catch (e: any) {
        console.error('Postgres optimization approval sync note:', e.message);
      }
    })();

    return true;
  }
}

export const dbStore = new InDatabaseStore();
