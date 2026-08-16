import { Router } from 'express';
import { getDriverTrips, updateTripStatus, checkInPassenger } from '../controllers/driver.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, TripStatusUpdateSchema, PassengerCheckInSchema } from '../middleware/validate';

const router = Router();

router.use(authenticate);
router.use(authorize('DRIVER', 'ADMIN', 'DISPATCHER'));

router.get('/trips', getDriverTrips);
router.post('/trips/:id/status', validateBody(TripStatusUpdateSchema), updateTripStatus);
router.post('/trips/:id/checkin', validateBody(PassengerCheckInSchema), checkInPassenger);

export default router;
