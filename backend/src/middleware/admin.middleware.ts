import { NextFunction, Request, Response } from 'express';

import { ForbiddenError, UnauthorizedError } from '@/middleware/errorHandler';

/**
 * Authorization middleware that allows access only to users with the 'admin' role.
 */
export function authorizeAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }

  if (req.user.role !== 'admin') {
    next(new ForbiddenError('Admin access required'));
    return;
  }

  next();
}
