import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { dbStore } from '../../db';

const app = createApp();

describe('Optimization Engine Multi-Corridor Strategy Tests', () => {
  const testDate = new Date().toISOString().split('T')[0];
  const testSlot = 'slot-3pm';

  it('should run multi-strategy route optimization and return candidate solutions', async () => {
    // Seed benchmark bookings for the slot
    dbStore.seedInitialState();

    const res = await request(app)
      .post('/api/admin/optimization/run')
      .set('X-Simulated-User', 'admin_transport')
      .send({
        date: testDate,
        departureSlotId: testSlot,
        weights: {
          busMinimization: 40,
          travelTime: 25,
          distance: 15,
          studentDetour: 15,
          unusedCapacity: 5
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.run).toBeDefined();
    expect(res.body.run.candidateSolutions).toBeInstanceOf(Array);
    expect(res.body.run.candidateSolutions.length).toBeGreaterThanOrEqual(1);

    const bestSolution = res.body.run.candidateSolutions[0];
    expect(bestSolution.score).toBeGreaterThan(0);
    expect(bestSolution.routes).toBeInstanceOf(Array);
  });

  it('should approve an optimization candidate and publish scheduled trips', async () => {
    const run = dbStore.executeOptimization(testDate, testSlot, 'usr-admin-1', {
      busMinimization: 40,
      travelTime: 25,
      distance: 15,
      studentDetour: 15,
      unusedCapacity: 5
    });

    const solutionId = run.candidateSolutions[0].id;

    const res = await request(app)
      .post(`/api/admin/optimization/${run.id}/approve`)
      .set('X-Simulated-User', 'admin_transport')
      .send({ solutionId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const tripsRes = await request(app)
      .get(`/api/admin/schedules?date=${testDate}`)
      .set('X-Simulated-User', 'admin_transport');

    expect(tripsRes.status).toBe(200);
    expect(tripsRes.body.trips.length).toBeGreaterThanOrEqual(1);
  });
});
