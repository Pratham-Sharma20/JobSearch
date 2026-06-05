import rateLimit from 'express-rate-limit';

import { env } from '@/config/env';
import { sendError } from '@/utils/response';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 'Too many requests. Please try again later.', 429);
  },
  skip: (req) => req.ip === '127.0.0.1' && env.NODE_ENV === 'development',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many auth attempts. Please try again in 15 minutes.',
  handler: (_req, res) => {
    sendError(res, 'Too many authentication attempts. Please try again in 15 minutes.', 429);
  },
});

export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 'Too many search requests. Please slow down.', 429);
  },
});
