import { Router } from 'express';
import { getSlots, getAreas, getStops, getStudentBookings, createStudentBooking, cancelStudentBooking } from '../controllers/student.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, CreateBookingSchema } from '../middleware/validate';

const router = Router();

// Public / Authenticated discovery
router.get('/slots', getSlots);
router.get('/areas', getAreas);
router.get('/stops', getStops);

// Protected student booking endpoints (Strict IDOR & token identity check)
router.get('/bookings', authenticate, getStudentBookings);
router.post('/bookings', authenticate, authorize('STUDENT', 'ADMIN', 'DISPATCHER'), createStudentBooking);
router.delete('/bookings/:id', authenticate, cancelStudentBooking);

export default router;
