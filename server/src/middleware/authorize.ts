import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before authorization check'
      });
    }

    const userRole = req.user.role;
    const hasRole = allowedRoles.some(r => 
      r === userRole || 
      r === `ROLE_${userRole}`
    );

    if (!hasRole) {
      logger.warn(`Access forbidden for user ${req.user.username} (Role: ${userRole}). Required: [${allowedRoles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        error: `Access Denied: Required role(s): ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}
