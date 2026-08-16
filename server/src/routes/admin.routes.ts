import { Router } from 'express';
import { 
  getAdminDashboard, getAdminDemand, overrideSlotDemand, getBuses, createBus, updateBus, 
  getDrivers, createDriver, updateDriver, runOptimization, approveOptimization, getOptimizationHistory, 
  getSchedules, getAuditLogs, getStudents, getStudentById, createStudent, updateStudent, 
  resetStudentPassword, toggleStudentStatus, importStudents, exportStudents, getRoutes, 
  createRoute, updateRoute, deleteRoute, getOperationalPlan, lockOperationalPlan, 
  getOptimizationSettings, updateOptimizationSettings, getAllBookingsAdmin, cancelBookingAdmin,
  getDatabaseHealth, testDatabaseConnection, reconnectDatabase
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, BusSchema, DriverSchema, SlotOverrideSchema } from '../middleware/validate';

const router = Router();

// Enforce authentication & admin authorization
router.use(authenticate);
router.use(authorize('ADMIN', 'DISPATCHER', 'SUPER_ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/demand', getAdminDemand);
router.post('/slots/override', validateBody(SlotOverrideSchema), overrideSlotDemand);

// Student Master Registry
router.get('/students', getStudents);
router.post('/students', createStudent);
router.post('/students/import', importStudents);
router.get('/students/export', exportStudents);
router.get('/students/:id', getStudentById);
router.put('/students/:id', updateStudent);
router.post('/students/:id/reset-password', resetStudentPassword);
router.post('/students/:id/toggle-status', toggleStudentStatus);

// Fleet & Drivers
router.get('/buses', getBuses);
router.post('/buses', validateBody(BusSchema), createBus);
router.put('/buses/:id', updateBus);
router.get('/drivers', getDrivers);
router.post('/drivers', createDriver);
router.put('/drivers/:id', updateDriver);

// Routes
router.get('/routes', getRoutes);
router.post('/routes', createRoute);
router.put('/routes/:id', updateRoute);
router.delete('/routes/:id', deleteRoute);

// Operational Plans
router.get('/plans', getOperationalPlan);
router.post('/plans/lock', lockOperationalPlan);

// Optimization Engine & Settings
router.get('/optimization-settings', getOptimizationSettings);
router.put('/optimization-settings', updateOptimizationSettings);
router.post('/optimization/run', runOptimization);
router.post('/optimization/:id/approve', approveOptimization);
router.get('/optimization/history', getOptimizationHistory);

// Schedule, Bookings & Audit
router.get('/bookings', getAllBookingsAdmin);
router.post('/bookings/:id/cancel', cancelBookingAdmin);
router.get('/schedules', getSchedules);
router.get('/audit-logs', getAuditLogs);
router.get('/db-health', getDatabaseHealth);
router.post('/db-test', testDatabaseConnection);
router.post('/db-connect', reconnectDatabase);

export default router;

