import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '@/utils/logger';
import { sendError } from '@/utils/response';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// ────────────────────────────────────────────────
// Global error handler middleware
// ────────────────────────────────────────────────

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    sendError(res, 'Validation failed', 422, message);
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Unhandled AppError:', { requestId: req.id, message: err.message, stack: err.stack });
    }
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError') {
    const mongoErr = err as Error & { code?: number };
    if (mongoErr.code === 11000) {
      sendError(res, 'Duplicate entry. Resource already exists.', 409);
      return;
    }
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, 'Invalid resource identifier', 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // Unhandled errors — don't leak details to client
  logger.error('Unhandled error:', { requestId: req.id, message: err.message, stack: err.stack, url: req.url });
  const isDev = process.env.NODE_ENV === 'development';
  sendError(res, 'Internal server error', 500, isDev ? `${err.message} (ReqID: ${req.id})` : `ReqID: ${req.id}`);
}
