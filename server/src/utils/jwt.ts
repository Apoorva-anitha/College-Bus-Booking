import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UserRole } from '../../../src/types';

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  studentId?: string;
  registrationNumber?: string;
  isHosteller?: boolean;
  driverId?: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
}
