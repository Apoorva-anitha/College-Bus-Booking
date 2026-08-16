import { Request, Response } from 'express';
import { dbStore } from '../../db';
import { auditService } from '../services/audit.service';
import { hashPassword } from '../utils/password';
import { StudentRecord, CollegeRoute, OperationalPlanVersion } from '../../../src/types';

export async function getAdminDashboard(req: Request, res: Response) {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const decision3pm = dbStore.recalculateDailyDemand(date, 'slot-3pm');
  const decision5pm = dbStore.recalculateDailyDemand(date, 'slot-5pm');

  const confirmedToday = dbStore.bookings.filter(b => b.date === date && b.status === 'CONFIRMED');
  const cancelledToday = dbStore.bookings.filter(b => b.date === date && b.status === 'CANCELLED');

  res.json({
    date,
    decisions: {
      'slot-3pm': decision3pm,
      'slot-5pm': decision5pm
    },
    stats: {
      totalConfirmed: confirmedToday.length,
      totalCancelled: cancelledToday.length,
      totalStudents: dbStore.students.length,
      dayScholars: dbStore.students.filter(s => !s.isHosteller).length,
      hostellers: dbStore.students.filter(s => s.isHosteller).length,
      availableBuses: dbStore.buses.filter(b => b.status === 'AVAILABLE').length,
      totalBuses: dbStore.buses.length,
      availableDrivers: dbStore.drivers.filter(d => d.isAvailable && d.status === 'ACTIVE').length,
      totalDrivers: dbStore.drivers.length,
      activeTrips: dbStore.trips.filter(t => t.date === date && t.status !== 'COMPLETED').length
    },
    recentRuns: dbStore.optimizationRuns.slice(0, 5)
  });
}

// -------------------------------------------------------------
// STUDENT MANAGEMENT
// -------------------------------------------------------------

export async function getStudents(req: Request, res: Response) {
  let list = [...dbStore.students];
  const q = (req.query.q as string || '').toLowerCase().trim();
  const isHostellerQuery = req.query.isHosteller as string;
  const activeQuery = req.query.active as string;
  const deptQuery = req.query.department as string;
  const yearQuery = req.query.year as string;

  if (q) {
    list = list.filter(s => 
      s.registrationNumber.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  }

  if (isHostellerQuery !== undefined && isHostellerQuery !== '') {
    const isH = isHostellerQuery === 'true';
    list = list.filter(s => s.isHosteller === isH);
  }

  if (activeQuery !== undefined && activeQuery !== '') {
    const isAct = activeQuery === 'true';
    list = list.filter(s => s.active === isAct);
  }

  if (deptQuery) {
    list = list.filter(s => s.department === deptQuery);
  }

  if (yearQuery) {
    list = list.filter(s => s.year === parseInt(yearQuery, 10));
  }

  // Safe records without passwordHash
  const safeList = list.map(s => {
    const { passwordHash, ...safe } = s;
    return safe;
  });

  res.json({
    total: safeList.length,
    students: safeList
  });
}

export async function getStudentById(req: Request, res: Response) {
  const student = dbStore.students.find(s => s.id === req.params.id || s.registrationNumber === req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student record not found' });
  }

  const { passwordHash, ...safe } = student;
  const studentBookings = dbStore.bookings.filter(b => b.studentId === student.id || b.studentRegNo === student.registrationNumber);

  res.json({
    student: safe,
    bookings: studentBookings
  });
}

export async function createStudent(req: Request, res: Response) {
  const { registrationNumber, name, email, department, year, section, isHosteller, hostelName, phone, initialPassword, active } = req.body;

  if (!registrationNumber || !name || !email) {
    return res.status(400).json({ success: false, error: 'Registration number, name, and email are required' });
  }

  const existing = dbStore.students.find(s => s.registrationNumber.toUpperCase() === registrationNumber.toUpperCase().trim());
  if (existing) {
    return res.status(409).json({ success: false, error: `Student with registration number ${registrationNumber} already exists.` });
  }

  const pwd = initialPassword || 'password';
  const hashed = await hashPassword(pwd);

  const newStudent: StudentRecord = {
    id: `stu-${Date.now()}`,
    studentId: `stu-${Date.now()}`,
    registrationNumber: registrationNumber.toUpperCase().trim(),
    name: name.trim(),
    email: email.trim(),
    department: department || 'Computer Science & Engineering',
    year: year ? parseInt(year, 10) : 1,
    section: section || 'A',
    isHosteller: !!isHosteller,
    hostelName: isHosteller ? (hostelName || 'Hostel') : undefined,
    phone: phone || '',
    active: active !== false,
    passwordHash: hashed,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbStore.students.push(newStudent);

  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: 'CREATE_STUDENT',
    resource: 'STUDENTS',
    resourceId: newStudent.id,
    result: 'SUCCESS',
    details: `Created student ${newStudent.registrationNumber} (${newStudent.name}), Status: ${newStudent.isHosteller ? 'HOSTELLER' : 'DAY_SCHOLAR'}`
  });

  const { passwordHash, ...safe } = newStudent;
  res.status(201).json({ success: true, student: safe });
}

export async function updateStudent(req: Request, res: Response) {
  const student = dbStore.students.find(s => s.id === req.params.id || s.registrationNumber === req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student record not found' });
  }

  const { name, email, department, year, section, isHosteller, hostelName, phone, active } = req.body;
  const oldHosteller = student.isHosteller;

  if (name !== undefined) student.name = name;
  if (email !== undefined) student.email = email;
  if (department !== undefined) student.department = department;
  if (year !== undefined) student.year = parseInt(year, 10);
  if (section !== undefined) student.section = section;
  if (isHosteller !== undefined) {
    student.isHosteller = !!isHosteller;
    student.hostelName = isHosteller ? (hostelName || student.hostelName || 'Hostel') : undefined;
  }
  if (phone !== undefined) student.phone = phone;
  if (active !== undefined) student.active = !!active;
  student.updatedAt = new Date().toISOString();

  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: 'UPDATE_STUDENT',
    resource: 'STUDENTS',
    resourceId: student.id,
    result: 'SUCCESS',
    details: `Updated student ${student.registrationNumber}. Hosteller: ${oldHosteller} -> ${student.isHosteller}`
  });

  const { passwordHash, ...safe } = student;
  res.json({ success: true, student: safe });
}

export async function resetStudentPassword(req: Request, res: Response) {
  const student = dbStore.students.find(s => s.id === req.params.id || s.registrationNumber === req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student record not found' });
  }

  const newPassword = req.body.password || 'password123';
  student.passwordHash = await hashPassword(newPassword);
  student.updatedAt = new Date().toISOString();

  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: 'RESET_PASSWORD',
    resource: 'STUDENTS',
    resourceId: student.id,
    result: 'SUCCESS',
    details: `Reset password for student ${student.registrationNumber}`
  });

  res.json({ success: true, message: 'Password reset successfully' });
}

export async function toggleStudentStatus(req: Request, res: Response) {
  const student = dbStore.students.find(s => s.id === req.params.id || s.registrationNumber === req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student record not found' });
  }

  student.active = !student.active;
  student.updatedAt = new Date().toISOString();

  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: student.active ? 'ACTIVATE_STUDENT' : 'DEACTIVATE_STUDENT',
    resource: 'STUDENTS',
    resourceId: student.id,
    result: 'SUCCESS',
    details: `Toggled active status of ${student.registrationNumber} to ${student.active}`
  });

  const { passwordHash, ...safe } = student;
  res.json({ success: true, student: safe });
}

export async function importStudents(req: Request, res: Response) {
  const { csvData } = req.body;
  if (!csvData) {
    return res.status(400).json({ success: false, error: 'csvData is required' });
  }

  const lines = csvData.trim().split('\n');
  if (lines.length < 2) {
    return res.status(400).json({ success: false, error: 'CSV file must contain a header and at least one row' });
  }

  const header = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
  const regIdx = header.indexOf('registrationnumber');
  const nameIdx = header.indexOf('name');
  const emailIdx = header.indexOf('email');
  const deptIdx = header.indexOf('department');
  const yearIdx = header.indexOf('year');
  const secIdx = header.indexOf('section');
  const hostellerIdx = header.indexOf('ishosteller');
  const hostelNameIdx = header.indexOf('hostelname');
  const activeIdx = header.indexOf('active');

  let importedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  const defaultPwdHash = await hashPassword('password');

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((val: string) => val.trim());
    if (row.length < 3 || !row[regIdx]) continue;

    const regNo = row[regIdx].toUpperCase();
    const existing = dbStore.students.find(s => s.registrationNumber.toUpperCase() === regNo);

    const isHosteller = hostellerIdx !== -1 && (row[hostellerIdx].toLowerCase() === 'true' || row[hostellerIdx] === '1');
    const isActive = activeIdx === -1 || (row[activeIdx].toLowerCase() === 'true' || row[activeIdx] === '1');

    if (existing) {
      existing.name = row[nameIdx] || existing.name;
      existing.email = row[emailIdx] || existing.email;
      existing.department = deptIdx !== -1 && row[deptIdx] ? row[deptIdx] : existing.department;
      existing.year = yearIdx !== -1 && row[yearIdx] ? parseInt(row[yearIdx], 10) : existing.year;
      existing.section = secIdx !== -1 && row[secIdx] ? row[secIdx] : existing.section;
      existing.isHosteller = isHosteller;
      existing.hostelName = isHosteller ? (hostelNameIdx !== -1 ? row[hostelNameIdx] : 'Hostel') : undefined;
      existing.active = isActive;
      existing.updatedAt = new Date().toISOString();
      skippedCount++;
    } else {
      const newRec: StudentRecord = {
        id: `stu-${Date.now()}-${i}`,
        studentId: `stu-${Date.now()}-${i}`,
        registrationNumber: regNo,
        name: row[nameIdx] || `Student ${regNo}`,
        email: row[emailIdx] || `${regNo.toLowerCase()}@college.edu`,
        department: deptIdx !== -1 && row[deptIdx] ? row[deptIdx] : 'Computer Science & Engineering',
        year: yearIdx !== -1 && row[yearIdx] ? parseInt(row[yearIdx], 10) : 1,
        section: secIdx !== -1 && row[secIdx] ? row[secIdx] : 'A',
        isHosteller,
        hostelName: isHosteller ? (hostelNameIdx !== -1 ? row[hostelNameIdx] : 'Hostel') : undefined,
        active: isActive,
        passwordHash: defaultPwdHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbStore.students.push(newRec);
      importedCount++;
    }
  }

  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: 'IMPORT_STUDENTS',
    resource: 'STUDENTS',
    result: 'SUCCESS',
    details: `Imported ${importedCount} new students, updated ${skippedCount} existing students.`
  });

  res.json({
    success: true,
    importedCount,
    skippedCount,
    totalRecords: dbStore.students.length,
    errors
  });
}

export async function exportStudents(_req: Request, res: Response) {
  const header = 'registrationNumber,name,email,department,year,section,isHosteller,hostelName,phone,active,createdAt';
  const rows = dbStore.students.map(s => 
    `"${s.registrationNumber}","${s.name}","${s.email}","${s.department}",${s.year},"${s.section}",${s.isHosteller},"${s.hostelName || ''}","${s.phone || ''}",${s.active},"${s.createdAt}"`
  );
  const csv = [header, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="students_master.csv"');
  res.send(csv);
}

// -------------------------------------------------------------
// ROUTE MANAGEMENT
// -------------------------------------------------------------

export async function getRoutes(_req: Request, res: Response) {
  res.json({ routes: dbStore.routes });
}

export async function createRoute(req: Request, res: Response) {
  const { name, routeCode, direction, corridor, stopIds, estimatedDistanceKm, estimatedDurationMin, maxAllowedDurationMin, assignedBusId, assignedDriverId } = req.body;

  const newRoute: CollegeRoute = {
    id: `route-${Date.now()}`,
    routeCode: routeCode || `R-${dbStore.routes.length + 1}`,
    name: name || `New Route ${dbStore.routes.length + 1}`,
    direction: direction || 'OUTBOUND',
    corridor: corridor || 'Chennai Central',
    stopIds: stopIds || ['stop-college'],
    estimatedDistanceKm: estimatedDistanceKm || 20,
    estimatedDurationMin: estimatedDurationMin || 45,
    maxAllowedDurationMin: maxAllowedDurationMin || 60,
    active: true,
    assignedBusId,
    assignedDriverId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbStore.routes.push(newRoute);

  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: 'CREATE_ROUTE',
    resource: 'ROUTES',
    resourceId: newRoute.id,
    result: 'SUCCESS',
    details: `Created route ${newRoute.routeCode}: ${newRoute.name}`
  });

  res.status(201).json({ success: true, route: newRoute });
}

export async function updateRoute(req: Request, res: Response) {
  const route = dbStore.routes.find(r => r.id === req.params.id);
  if (!route) return res.status(404).json({ success: false, error: 'Route not found' });

  Object.assign(route, req.body);
  route.updatedAt = new Date().toISOString();

  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: 'UPDATE_ROUTE',
    resource: 'ROUTES',
    resourceId: route.id,
    result: 'SUCCESS',
    details: `Updated route ${route.routeCode}`
  });

  res.json({ success: true, route });
}

export async function deleteRoute(req: Request, res: Response) {
  const idx = dbStore.routes.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Route not found' });

  const [removed] = dbStore.routes.splice(idx, 1);
  res.json({ success: true, message: `Route ${removed.routeCode} deleted` });
}

// -------------------------------------------------------------
// OPERATIONAL PLAN & VERSIONING
// -------------------------------------------------------------

export async function getOperationalPlan(req: Request, res: Response) {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const slotId = (req.query.slotId as string) || 'slot-3pm';
  const planKey = `${date}_${slotId}`;

  const plan = dbStore.operationalPlans.get(planKey);
  const decision = dbStore.recalculateDailyDemand(date, slotId);
  const confirmedBookings = dbStore.bookings.filter(b => b.date === date && b.slotId === slotId && b.status === 'CONFIRMED');

  res.json({
    date,
    slotId,
    decision,
    demandCount: confirmedBookings.length,
    plan: plan || null
  });
}

export async function lockOperationalPlan(req: Request, res: Response) {
  const { date, slotId } = req.body;
  const planKey = `${date}_${slotId}`;
  const plan = dbStore.operationalPlans.get(planKey);
  if (!plan) return res.status(404).json({ success: false, error: 'Operational plan not found' });

  plan.status = 'LOCKED';
  plan.lockedBy = req.user?.username || 'admin';
  plan.lockedAt = new Date().toISOString();

  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: 'LOCK_PLAN',
    resource: 'SCHEDULES',
    resourceId: plan.id,
    result: 'SUCCESS',
    details: `Locked operational plan for ${date} (${slotId})`
  });

  res.json({ success: true, plan });
}

// -------------------------------------------------------------
// OPTIMIZATION SETTINGS
// -------------------------------------------------------------

export async function getOptimizationSettings(_req: Request, res: Response) {
  res.json({ settings: dbStore.optimizationSettings });
}

export async function updateOptimizationSettings(req: Request, res: Response) {
  Object.assign(dbStore.optimizationSettings, req.body);
  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: 'UPDATE_OPTIMIZATION_SETTINGS',
    resource: 'SETTINGS',
    result: 'SUCCESS',
    details: 'Updated algorithm optimization weights and constraints'
  });
  res.json({ success: true, settings: dbStore.optimizationSettings });
}

// -------------------------------------------------------------
// ALL BOOKINGS & CANCEL (ADMIN)
// -------------------------------------------------------------

export async function getAllBookingsAdmin(req: Request, res: Response) {
  const date = req.query.date as string;
  const slotId = req.query.slotId as string;
  const status = req.query.status as string;

  let list = dbStore.bookings;
  if (date) list = list.filter(b => b.date === date);
  if (slotId) list = list.filter(b => b.slotId === slotId);
  if (status) list = list.filter(b => b.status === status);

  res.json({ total: list.length, bookings: list });
}

export async function cancelBookingAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const { reason } = req.body;

  const result = dbStore.cancelBooking('admin', id, true, reason);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  res.json({ success: true, message: 'Booking cancelled by administrator' });
}

// -------------------------------------------------------------
// FLEET & DRIVER CONTROLLERS
// -------------------------------------------------------------

export async function getAdminDemand(req: Request, res: Response) {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  
  const stopDemand = dbStore.stops.map(stop => {
    const count3pm = dbStore.bookings.filter(b => b.date === date && b.slotId === 'slot-3pm' && b.stopId === stop.id && b.status === 'CONFIRMED').length;
    const count5pm = dbStore.bookings.filter(b => b.date === date && b.slotId === 'slot-5pm' && b.stopId === stop.id && b.status === 'CONFIRMED').length;
    return {
      stopId: stop.id,
      stopName: stop.name,
      areaId: stop.areaId,
      areaName: dbStore.areas.find(a => a.id === stop.areaId)?.name || stop.corridor,
      corridor: stop.corridor,
      count3pm,
      count5pm,
      totalDemand: count3pm + count5pm
    };
  });

  res.json({ date, stopDemand });
}

export async function overrideSlotDemand(req: Request, res: Response) {
  const { date, slotId, departureSlotId, override } = req.body;
  const targetSlotId = departureSlotId || slotId;
  const key = `${date}_${targetSlotId}`;
  
  const existing = dbStore.dailySlotDecisions.get(key);
  if (existing) {
    existing.adminOverride = override;
  }
  const updated = dbStore.recalculateDailyDemand(date, targetSlotId);

  await auditService.logEvent({
    userId: req.user?.userId || 'admin',
    username: req.user?.username || 'admin',
    action: 'ADMIN_SLOT_OVERRIDE',
    resource: 'SLOTS',
    result: 'SUCCESS',
    details: `Admin set override to ${override} for ${targetSlotId} on ${date}`
  });

  res.json({ success: true, decision: updated });
}

export async function getBuses(_req: Request, res: Response) {
  res.json({ buses: dbStore.buses });
}

export async function createBus(req: Request, res: Response) {
  const newBus = {
    id: `bus-${Date.now()}`,
    ...req.body
  };
  dbStore.buses.push(newBus);
  res.status(201).json({ bus: newBus });
}

export async function updateBus(req: Request, res: Response) {
  const bus = dbStore.buses.find(b => b.id === req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  Object.assign(bus, req.body);
  res.json({ bus });
}

export async function getDrivers(_req: Request, res: Response) {
  res.json({ drivers: dbStore.drivers });
}

export async function createDriver(req: Request, res: Response) {
  const newDriver = {
    id: `drv-${Date.now()}`,
    ...req.body
  };
  dbStore.drivers.push(newDriver);
  res.status(201).json({ driver: newDriver });
}

export async function updateDriver(req: Request, res: Response) {
  const driver = dbStore.drivers.find(d => d.id === req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  Object.assign(driver, req.body);
  res.json({ driver });
}

export async function runOptimization(req: Request, res: Response) {
  const { date, slotId, departureSlotId, weights } = req.body;
  const user = req.user;
  const targetSlotId = departureSlotId || slotId || 'slot-3pm';
  const targetDate = date || new Date().toISOString().split('T')[0];

  const run = dbStore.executeOptimization(
    targetDate,
    targetSlotId,
    user?.userId || 'usr-admin-1',
    weights || dbStore.optimizationSettings
  );

  res.json({ run });
}

export async function approveOptimization(req: Request, res: Response) {
  const runId = req.params.id;
  const { solutionId } = req.body;
  const user = req.user;

  const ok = dbStore.approveOptimizationSolution(runId, solutionId, user?.userId || 'usr-admin-1');
  if (!ok) return res.status(404).json({ error: 'Optimization run or solution not found' });

  res.json({ success: true, message: 'Optimization solution approved and published to trips roster' });
}

export async function getOptimizationHistory(_req: Request, res: Response) {
  res.json({ runs: dbStore.optimizationRuns });
}

export async function getSchedules(req: Request, res: Response) {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const trips = dbStore.trips.filter(t => t.date === date);
  res.json({ trips });
}

export async function getAuditLogs(_req: Request, res: Response) {
  const logs = auditService.getRecentLogs();
  const dbLogs = dbStore.auditLogs.slice().reverse();
  res.json({ logs: logs.length > 0 ? logs : dbLogs });
}

export async function getDatabaseHealth(_req: Request, res: Response) {
  const { getPostgresStatus } = await import('../config/postgres');
  res.json(getPostgresStatus());
}

export async function testDatabaseConnection(req: Request, res: Response) {
  const { connectionString } = req.body;
  const { testConnection } = await import('../config/postgres');
  const result = await testConnection(connectionString);
  res.json(result);
}

export async function reconnectDatabase(req: Request, res: Response) {
  const { connectionString } = req.body;
  if (!connectionString) {
    return res.status(400).json({ error: 'Connection string is required' });
  }

  const { setDatabaseUrl, initializePostgresDatabase } = await import('../config/postgres');
  setDatabaseUrl(connectionString);
  const initResult = await initializePostgresDatabase();
  
  res.json(initResult);
}


