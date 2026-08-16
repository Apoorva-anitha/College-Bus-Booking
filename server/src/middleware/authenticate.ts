import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { logger } from '../utils/logger';
import { dbStore } from '../../db';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // 1. Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Cookie token
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const payload = verifyToken(token);
        if (payload) {
          req.user = payload;
          return next();
        }
      } catch (err: any) {
        logger.warn('Token verification error, attempting simulated user fallback:', err.message);
      }
    }

    // 3. Fallback: X-Simulated-User or simulated auth header for testing
    const simulatedHeader = (req.headers['x-simulated-user'] as string) || (req.headers['x-user-role'] as string);
    if (simulatedHeader) {
      if (simulatedHeader.includes('admin') || simulatedHeader.toUpperCase() === 'ADMIN' || simulatedHeader.toUpperCase() === 'SUPER_ADMIN') {
        req.user = {
          userId: 'usr-admin-1',
          username: 'admin_transport',
          email: 'admin@college.edu',
          role: simulatedHeader.toUpperCase() === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN'
        };
        return next();
      } else if (simulatedHeader.includes('driver') || simulatedHeader.toUpperCase() === 'DRIVER') {
        req.user = {
          userId: 'usr-driver-1',
          username: 'driver_murugan',
          email: 'murugan@college.edu',
          role: 'DRIVER',
          driverId: 'drv-1'
        };
        return next();
      } else {
        // Check student in dbStore.students
        const matchingStudent = dbStore.students.find(s => 
          s.registrationNumber.toUpperCase() === simulatedHeader.toUpperCase() || 
          s.id === simulatedHeader || 
          s.studentId === simulatedHeader
        );

        if (matchingStudent) {
          req.user = {
            userId: matchingStudent.id,
            username: matchingStudent.registrationNumber,
            email: matchingStudent.email,
            role: 'STUDENT',
            studentId: matchingStudent.id,
            registrationNumber: matchingStudent.registrationNumber,
            isHosteller: matchingStudent.isHosteller
          };
          return next();
        }

        // Generic student fallback
        const studentNum = simulatedHeader.replace(/\D/g, '') || simulatedHeader;
        req.user = {
          userId: simulatedHeader.startsWith('usr-') || simulatedHeader.startsWith('student-') ? simulatedHeader : `usr-student-${studentNum}`,
          username: `student_${studentNum}`,
          email: `student${studentNum}@college.edu`,
          role: 'STUDENT',
          studentId: simulatedHeader
        };
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Bearer token or cookie.'
    });
  } catch (err: any) {
    logger.warn('Authentication middleware failure:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication credentials.'
    });
  }
}

/**
 * Optional authentication: Populates req.user if token is present, but does not reject if missing
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      req.user = verifyToken(token);
    } else {
      const simulated = req.headers['x-simulated-user'] as string;
      if (simulated) {
        if (simulated.includes('admin') || simulated.toUpperCase() === 'ADMIN' || simulated.toUpperCase() === 'SUPER_ADMIN') {
          req.user = { userId: 'usr-admin-1', username: 'admin_transport', email: 'admin@college.edu', role: simulated.toUpperCase() === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN' };
        } else if (simulated.includes('driver') || simulated.toUpperCase() === 'DRIVER') {
          req.user = { userId: 'usr-driver-1', username: 'driver_murugan', email: 'murugan@college.edu', role: 'DRIVER', driverId: 'drv-1' };
        } else {
          const matchingStudent = dbStore.students.find(s => 
            s.registrationNumber.toUpperCase() === simulated.toUpperCase() || 
            s.id === simulated || 
            s.studentId === simulated
          );

          if (matchingStudent) {
            req.user = {
              userId: matchingStudent.id,
              username: matchingStudent.registrationNumber,
              email: matchingStudent.email,
              role: 'STUDENT',
              studentId: matchingStudent.id,
              registrationNumber: matchingStudent.registrationNumber,
              isHosteller: matchingStudent.isHosteller
            };
          } else {
            const num = simulated.replace(/\D/g, '') || simulated;
            req.user = { userId: `usr-student-${num}`, username: `student_${num}`, email: `student${num}@college.edu`, role: 'STUDENT', studentId: simulated };
          }
        }
      }
    }
  } catch (err) {
    // Ignore error for optional
  }
  next();
}

