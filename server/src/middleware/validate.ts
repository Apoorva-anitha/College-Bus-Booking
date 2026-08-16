import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = (result.error as any).issues || (result.error as any).errors || [];
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : '',
          message: e.message
        }))
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = (result.error as any).issues || (result.error as any).errors || [];
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : '',
          message: e.message
        }))
      });
    }
    req.query = result.data as any;
    next();
  };
}

// Common Schemas
export const LoginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required')
});

export const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['STUDENT', 'DRIVER', 'ADMIN']).default('STUDENT'),
  phone: z.string().optional(),
  registerNumber: z.string().optional(),
  department: z.string().optional(),
  academicYear: z.string().optional(),
  defaultAreaId: z.string().optional()
});

export const CreateBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  departureSlotId: z.string().min(1, 'Departure slot is required'),
  busStopId: z.string().min(1, 'Bus stop is required')
});

export const CancelBookingSchema = z.object({
  reason: z.string().optional()
});

export const SlotOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  departureSlotId: z.string().min(1, 'Departure slot is required'),
  override: z.enum(['AUTO', 'FORCE_OPEN', 'FORCE_CLOSE'])
});

export const BusSchema = z.object({
  busNumber: z.string().min(1, 'Bus number is required'),
  registrationPlate: z.string().min(1, 'Registration plate is required'),
  capacity: z.number().int().min(1).max(100),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'MAINTENANCE', 'OUT_OF_SERVICE', 'INACTIVE']).default('AVAILABLE'),
  isElectric: z.boolean().default(false)
});

export const DriverSchema = z.object({
  fullName: z.string().min(1, 'Driver name is required'),
  phone: z.string().min(5, 'Phone is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be YYYY-MM-DD'),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'ON_DUTY', 'ON_LEAVE', 'SUSPENDED']).default('AVAILABLE'),
  preferredCorridor: z.string().optional()
});

export const OptimizationRunSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  departureSlotId: z.string().optional(),
  weights: z.object({
    busMinimization: z.number().min(0).max(100).default(40),
    travelTime: z.number().min(0).max(100).default(25),
    distance: z.number().min(0).max(100).default(15),
    studentDetour: z.number().min(0).max(100).default(15),
    unusedCapacity: z.number().min(0).max(100).default(5)
  }).optional()
});

export const TripStatusUpdateSchema = z.object({
  status: z.enum(['SCHEDULED', 'BOARDING', 'IN_TRANSIT', 'COMPLETED', 'DELAYED', 'CANCELLED']),
  delayMinutes: z.number().int().min(0).optional(),
  delayReason: z.string().optional()
});

export const PassengerCheckInSchema = z.object({
  studentId: z.string().min(1, 'Student ID or Register Number is required')
});
