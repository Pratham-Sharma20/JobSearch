import jwt from 'jsonwebtoken';

import { env } from '@/config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates a signed Access JWT token.
 * @param payload The token payload data.
 * @returns The signed JWT string.
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Generates a signed Refresh JWT token.
 * @param payload The token payload data (typically containing userId).
 * @returns The signed JWT string.
 */
export function generateRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifies and decodes an Access JWT token.
 * @param token The JWT string to verify.
 * @returns The decoded payload.
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

/**
 * Verifies and decodes a Refresh JWT token.
 * @param token The JWT string to verify.
 * @returns The decoded payload.
 */
export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
}
