import { Request, Response } from 'express';

import { UnauthorizedError } from '@/middleware/errorHandler';
import { User } from '@/models/User.model';
import { AuditService } from '@/modules/audit/audit.service';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from '@/utils/cookies';
import { verifyRefreshToken } from '@/utils/jwt';
import { sendCreated, sendSuccess } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';

import { AuthService } from './auth.service';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  public static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;
    const user = await AuthService.register(name, email, password);

    // Fire-and-forget audit log — must not block the response
    AuditService.log({
      userId: user.id,
      email: user.email,
      action: 'Register',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { provider: 'local' },
    }).catch(() => {});

    sendCreated(res, user, 'User registered successfully');
  });

  /**
   * POST /api/auth/login
   */
  public static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);

    if (refreshToken) {
      setRefreshTokenCookie(res, refreshToken);
    }

    AuditService.log({
      userId: user.id,
      email: user.email,
      action: 'Login',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    }).catch(() => {});

    sendSuccess(res, { user, accessToken }, 'Logged in successfully');
  });

  /**
   * POST /api/auth/google
   */
  public static googleLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.googleLogin(credential);

    if (refreshToken) {
      setRefreshTokenCookie(res, refreshToken);
    }

    AuditService.log({
      userId: user.id,
      email: user.email,
      action: 'Google Login',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    }).catch(() => {});

    sendSuccess(res, { user, accessToken }, 'Logged in via Google successfully');
  });

  /**
   * POST /api/auth/refresh
   */
  public static refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Refresh token is expected in HTTP-only cookie
    const token = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedError('Refresh token is missing');
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const { accessToken } = await AuthService.refresh(payload.userId);

    AuditService.log({
      userId: payload.userId,
      action: 'Refresh Token',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    }).catch(() => {});

    sendSuccess(res, { accessToken }, 'Access token refreshed successfully');
  });

  /**
   * POST /api/auth/logout
   */
  public static logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    let userId: string | undefined;

    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        userId = payload.userId;
      } catch {
        // Ignore token parsing errors during logout
      }
    }

    clearRefreshTokenCookie(res);

    if (userId) {
      AuditService.log({
        userId,
        action: 'Logout',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(() => {});
    }

    sendSuccess(res, null, 'Logged out successfully');
  });

  /**
   * GET /api/auth/me
   */
  public static me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    sendSuccess(res, AuthService.mapUserToResponse(user), 'Current user retrieved successfully');
  });
}
