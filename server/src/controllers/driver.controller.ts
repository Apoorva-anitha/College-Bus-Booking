import { Request, Response } from 'express';
import { dbStore } from '../../db';
import { eventBus } from '../services/eventBus';
import { queryPostgres } from '../config/postgres';

export async function getDriverTrips(req: Request, res: Response) {
  const user = req.user!;
  const driverId = user.driverId || 'drv-1';
  const trips = dbStore.trips.filter(t => t.driverId === driverId || user.role === 'ADMIN' || user.role === 'DISPATCHER');
  res.json({ trips });
}

export async function updateTripStatus(req: Request, res: Response) {
  const trip = dbStore.trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const { status, delayMinutes, delayReason } = req.body;
  
  trip.status = status;
  if (delayMinutes !== undefined) trip.delayMinutes = delayMinutes;
  if (delayReason) trip.delayReason = delayReason;
  if (status === 'IN_TRANSIT' && !trip.startedAt) trip.startedAt = new Date().toISOString();
  if (status === 'COMPLETED') trip.completedAt = new Date().toISOString();

  // If status is in transit, also set bus status
  const bus = dbStore.buses.find(b => b.id === trip.busId);
  if (bus) {
    bus.status = status === 'IN_TRANSIT' ? 'IN_TRANSIT' : status === 'COMPLETED' ? 'AVAILABLE' : 'ASSIGNED';
  }

  eventBus.broadcast('TRIP_STATUS_UPDATED', {
    tripId: trip.id,
    busId: trip.busId,
    status: trip.status,
    delayMinutes: trip.delayMinutes,
    delayReason: trip.delayReason,
    startedAt: trip.startedAt,
    completedAt: trip.completedAt
  });

  if (delayMinutes && delayMinutes > 0) {
    eventBus.broadcast('DELAY_ALERT', {
      tripId: trip.id,
      routeName: trip.routeName,
      busNumber: trip.busNumber,
      delayMinutes: trip.delayMinutes,
      delayReason: trip.delayReason || 'Traffic congestion on corridor'
    });
  }

  // Neon PostgreSQL sync
  queryPostgres(`
    UPDATE trips 
    SET status = $1, delay_minutes = $2, delay_reason = $3, 
        started_at = CASE WHEN $4::timestamptz IS NOT NULL THEN $4::timestamptz ELSE started_at END,
        completed_at = CASE WHEN $5::timestamptz IS NOT NULL THEN $5::timestamptz ELSE completed_at END
    WHERE id = $6
  `, [trip.status, trip.delayMinutes || 0, trip.delayReason || '', trip.startedAt || null, trip.completedAt || null, trip.id])
  .catch(e => console.error('Postgres trip update warning:', e));

  res.json({ trip });
}

export async function checkInPassenger(req: Request, res: Response) {
  const trip = dbStore.trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const { studentId } = req.body;
  
  const passenger = trip.passengers.find(p => p.studentId === studentId || p.studentRegNo === studentId);
  if (!passenger) return res.status(404).json({ error: 'Passenger not in manifest' });
  
  passenger.isCheckedIn = !passenger.isCheckedIn;
  passenger.checkedInAt = passenger.isCheckedIn ? new Date().toISOString() : undefined;

  // Also update corresponding student booking status if boarded
  const bk = dbStore.bookings.find(b => b.studentId === passenger.studentId && b.tripId === trip.id);
  if (bk) {
    bk.status = passenger.isCheckedIn ? 'BOARDED' : 'CONFIRMED';
  }

  eventBus.broadcast('PASSENGER_CHECKED_IN', {
    tripId: trip.id,
    studentId: passenger.studentId,
    studentRegNo: passenger.studentRegNo,
    isCheckedIn: passenger.isCheckedIn,
    checkedInAt: passenger.checkedInAt
  });

  // Neon PostgreSQL sync
  if (bk) {
    queryPostgres(`
      UPDATE bookings 
      SET status = $1, boarded_at = $2, updated_at = NOW() 
      WHERE id = $3
    `, [bk.status, passenger.checkedInAt ? new Date(passenger.checkedInAt) : null, bk.id])
    .catch(e => console.error('Postgres booking checkin update warning:', e));
  }

  res.json({ trip });
}
