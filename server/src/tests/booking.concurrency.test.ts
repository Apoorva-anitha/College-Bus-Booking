import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { dbStore } from '../../db';

const app = createApp();

describe('Booking Race Condition & Concurrency Control', () => {
  const testDate = '2026-09-01';
  const testSlot = 'slot-3pm';
  const testStop = 'stop-adyar-signal';

  beforeEach(() => {
    // Reset bookings and set available fleet to 1 bus with capacity 1
    dbStore.bookings = [];
    dbStore.buses = [{
      id: 'test-single-seat-bus',
      registrationNumber: 'TN-09-RACE-01',
      capacity: 1,
      type: 'STANDARD_50',
      status: 'AVAILABLE',
      fuelLevelPct: 100,
      lastMaintenanceDate: '2026-01-01',
      fitnessCertificateValidUntil: '2027-01-01'
    }];
  });

  it('should accept exactly 1 booking and reject all simultaneous concurrent race requests for the last remaining seat', async () => {
    const totalConcurrentThreads = 20;

    // Launch simultaneous asynchronous booking requests
    const promises = Array.from({ length: totalConcurrentThreads }).map(async (_, idx) => {
      const studentId = `student-race-${idx + 1}`;
      
      return request(app)
        .post('/api/student/bookings')
        .set('X-Simulated-User', studentId)
        .send({
          date: testDate,
          departureSlotId: testSlot,
          busStopId: testStop
        });
    });

    const responses = await Promise.all(promises);

    const successfulResponses = responses.filter(r => r.status === 201);
    const rejectedResponses = responses.filter(r => r.status === 409 || r.status === 400);

    expect(successfulResponses.length).toBe(1);
    expect(rejectedResponses.length).toBe(totalConcurrentThreads - 1);

    const winningBooking = successfulResponses[0].body.booking;
    expect(winningBooking).toBeDefined();
    expect(winningBooking.seatNumber).toBe(1);
    expect(winningBooking.status).toBe('CONFIRMED');
  });

  it('should prevent the same student from booking duplicate active seats for the same slot and date', async () => {
    const studentId = 'student-unique-1';

    // 1st booking attempt -> Success
    const firstRes = await request(app)
      .post('/api/student/bookings')
      .set('X-Simulated-User', studentId)
      .send({
        date: testDate,
        departureSlotId: testSlot,
        busStopId: testStop
      });

    expect(firstRes.status).toBe(201);

    // 2nd booking attempt for same student on same slot -> Conflict
    const secondRes = await request(app)
      .post('/api/student/bookings')
      .set('X-Simulated-User', studentId)
      .send({
        date: testDate,
        departureSlotId: testSlot,
        busStopId: testStop
      });

    expect(secondRes.status).toBe(409);
    expect(secondRes.body.error).toContain('already have a confirmed booking');
  });
});
