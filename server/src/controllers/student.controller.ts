import { Request, Response } from 'express';
import { dbStore } from '../../db';
import { bookingService } from '../services/booking.service';

export async function getSlots(req: Request, res: Response) {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const slots = dbStore.slots.map(s => {
    const decision = dbStore.recalculateDailyDemand(date, s.id);
    return {
      ...s,
      dailyDemand: decision.totalBookings,
      dailyStatus: decision.status,
      decisionReason: decision.reason
    };
  });
  res.json({ slots });
}

export async function getAreas(_req: Request, res: Response) {
  res.json({ areas: dbStore.areas });
}

export async function getStops(req: Request, res: Response) {
  const areaId = req.query.areaId as string;
  let stops = dbStore.stops;
  if (areaId) {
    stops = stops.filter(s => s.areaId === areaId);
  }
  res.json({ stops });
}

export async function getStudentBookings(req: Request, res: Response) {
  const user = req.user!;
  const bookings = await bookingService.getBookingsForUser(user.userId, user.role);
  res.json({ bookings });
}

export async function createStudentBooking(req: Request, res: Response) {
  // CRITICAL: Determine student identity strictly from authenticated JWT context, not req.body
  const user = req.user!;
  const { date, departureSlotId, slotId, busStopId, stopId } = req.body;

  const targetSlotId = departureSlotId || slotId;
  const targetStopId = busStopId || stopId;

  if (!date || !targetSlotId || !targetStopId) {
    return res.status(400).json({ success: false, error: 'date, departureSlotId, and busStopId are mandatory' });
  }

  const result = await bookingService.createBooking(user.userId, date, targetSlotId, targetStopId);
  if (!result.success) {
    if (result.code === 'HOSTELLER_NOT_ELIGIBLE') {
      return res.status(403).json({
        success: false,
        code: 'HOSTELLER_NOT_ELIGIBLE',
        error: result.error,
        message: result.error
      });
    }
    if (result.code === 'STUDENT_INACTIVE') {
      return res.status(403).json({
        success: false,
        code: 'STUDENT_INACTIVE',
        error: result.error,
        message: result.error
      });
    }
    return res.status(409).json({ success: false, error: result.error, message: result.error });
  }

  res.status(201).json({ success: true, booking: result.booking });
}

export async function cancelStudentBooking(req: Request, res: Response) {
  const user = req.user!;
  const bookingId = req.params.id;
  const isAdmin = user.role === 'ADMIN' || user.role === 'DISPATCHER';

  const result = await bookingService.cancelBooking(user.userId, bookingId, isAdmin);
  if (!result.success) {
    return res.status(403).json({ success: false, error: result.error });
  }

  res.json({ success: true, message: 'Booking cancelled successfully' });
}
