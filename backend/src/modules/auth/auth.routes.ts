import { Router } from 'express';

import { authenticate } from '@/middleware/auth.middleware';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { validate } from '@/middleware/validate.middleware';
import { googleAuthSchema, loginSchema, registerSchema } from '@/validators/auth.validator';

import { AuthController } from './auth.controller';

const router = Router();

// Apply auth rate limiter to sensitive authentication routes
router.post('/register', authRateLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/google', authRateLimiter, validate(googleAuthSchema), AuthController.googleLogin);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', authenticate, AuthController.me);

export const authRouter = router;
