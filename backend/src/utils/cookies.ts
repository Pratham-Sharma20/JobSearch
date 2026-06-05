import { Response } from 'express';

import { env } from '@/config/env';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

/**
 * Sets the refresh token cookie in the response.
 * @param res Express Response object.
 * @param token The refresh token string.
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });
}

/**
 * Clears the refresh token cookie in the response.
 * @param res Express Response object.
 */
export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}
