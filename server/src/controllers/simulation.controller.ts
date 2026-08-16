import { Request, Response } from 'express';
import { dbStore } from '../../db';
import { auditService } from '../services/audit.service';

export async function runConcurrencyTest(req: Request, res: Response) {
  const { totalThreads = 30, testSlot = 'slot-3pm', stopId = 'stop-adyar-signal' } = req.body;
  const testDate = new Date().toISOString().split('T')[0];

  // Artificially restrict bus capacity to exactly 1 seat to test race condition
  const originalBuses = [...dbStore.buses];
  const testBus = { ...dbStore.buses[0], capacity: 1, status: 'AVAILABLE' as const };
  dbStore.buses = [testBus];

  // Clear existing bookings for this date/slot
  dbStore.bookings = dbStore.bookings.filter(b => !(b.date === testDate && b.slotId === testSlot));

  const results: { studentIndex: number; success: boolean; error?: string; timestamp: number }[] = [];

  // Launch simultaneous async booking requests
  const promises = Array.from({ length: totalThreads }).map(async (_, idx) => {
    const studentId = `test-student-${idx + 1}`;
    let student = dbStore.users.find(u => u.id === studentId);
    if (!student) {
      student = {
        id: studentId,
        username: `test_${idx + 1}`,
        email: `test${idx + 1}@college.edu`,
        role: 'STUDENT',
        name: `Concurrent Candidate #${idx + 1}`,
        studentProfile: {
          studentId: `s-${idx + 1}`,
          registrationNumber: `23RACE${idx + 1}`,
          department: 'CSE',
          year: 3,
          areaId: 'area-adyar',
          preferredStopId: stopId,
          isHosteller: false,
          busPassNumber: `BP-RACE-${idx + 1}`
        }
      };
      dbStore.users.push(student);
    }

    const bookingRes = await dbStore.createBookingAtomic(studentId, testDate, testSlot, stopId);
    results.push({
      studentIndex: idx + 1,
      success: bookingRes.success,
      error: bookingRes.error,
      timestamp: Date.now()
    });
  });

  await Promise.all(promises);

  // Restore original buses
  dbStore.buses = originalBuses;

  const successCount = results.filter(r => r.success).length;
  const rejectedCount = results.filter(r => !r.success).length;

  await auditService.logEvent({
    userId: req.user?.userId || 'system',
    username: req.user?.username || 'system',
    action: 'CONCURRENCY_TEST_EXECUTION',
    resource: 'SIMULATION',
    result: 'SUCCESS',
    details: `Ran race condition test with ${totalThreads} concurrent threads on 1 seat: ${successCount} won, ${rejectedCount} rejected safely.`
  });

  res.json({
    testType: 'Atomic Mutex Concurrency & Pessimistic Lock Verification',
    totalAttempts: totalThreads,
    availableSeatCapacity: 1,
    successfulBookings: successCount,
    rejectedBookings: rejectedCount,
    isConcurrencyProtected: successCount === 1 && rejectedCount === totalThreads - 1,
    logs: results.sort((a, b) => a.timestamp - b.timestamp)
  });
}

export async function seedAdyarBenchmark(_req: Request, res: Response) {
  dbStore.seedInitialState();
  res.json({
    success: true,
    message: 'Seeded Section 10 Adyar 84-student demand dataset + 5 PM evening slots.',
    totalBookings: dbStore.bookings.length
  });
}
