import { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '@/middleware/errorHandler';
import { User } from '@/models/User.model';
import { JwtPayload, verifyAccessToken } from '@/utils/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware that verifies JWT Access Tokens.
 * If validation succeeds, the decoded payload is attached to req.user.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('No token provided'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);

    // Ensure the user still exists in the database and is active/not deleted
    const user = await User.findById(decoded.userId).lean();
    if (!user || !user.isActive || user.isDeleted) {
      next(new UnauthorizedError('User not found or account is inactive'));
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
