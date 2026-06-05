import crypto from 'crypto';

import { NextFunction, Request, Response } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Middleware that assigns a unique request ID to each incoming request.
 * It uses the 'X-Request-Id' header if present, otherwise generates a new UUIDv4.
 * The ID is attached to `req.id` and sent back in the `X-Request-Id` response header.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  const idStr = Array.isArray(reqId) ? reqId[0] : reqId;

  req.id = idStr;
  res.setHeader('X-Request-Id', idStr);
  next();
};
