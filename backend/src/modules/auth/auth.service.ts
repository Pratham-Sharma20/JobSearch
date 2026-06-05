import { OAuth2Client } from 'google-auth-library';

import { env } from '@/config/env';
import { ConflictError, UnauthorizedError, ValidationError } from '@/middleware/errorHandler';
import { User } from '@/models/User.model';
import { IUserDocument } from '@/types/user.types';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';
import { comparePassword, hashPassword } from '@/utils/password';

import { AuthResponse, UserResponse } from './auth.types';

export class AuthService {
  private static googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

  /**
   * Helper to verify a Google OAuth ID token.
   * Exposed as a static method to facilitate easy stubbing/mocking in tests.
   */
  public static async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (error) {
      throw new ValidationError('Invalid Google token');
    }
  }

  /**
   * Registers a new user.
   */
  public static async register(
    name: string,
    email: string,
    password: string
  ): Promise<UserResponse> {
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      passwordHash: hashedPassword,
      provider: 'local',
      role: 'user',
      isActive: true,
    });

    await user.save();

    return this.mapUserToResponse(user);
  }

  /**
   * Performs standard local email/password login.
   */
  public static async login(email: string, password: string): Promise<AuthResponse> {
    // Explicitly select passwordHash since it has select: false in schema
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || user.isDeleted || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.provider !== 'local') {
      throw new UnauthorizedError(`Please log in using your registered provider: ${user.provider}`);
    }

    const isMatch = await comparePassword(password, user.passwordHash || '');
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const userResp = this.mapUserToResponse(user);
    const accessToken = generateAccessToken({
      userId: userResp.id,
      email: userResp.email,
      role: userResp.role,
    });
    const refreshToken = generateRefreshToken({
      userId: userResp.id,
    });

    return {
      user: userResp,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Performs Google OAuth verification and user lookup/creation.
   */
  public static async googleLogin(credential: string): Promise<AuthResponse> {
    const payload = await this.verifyGoogleToken(credential);
    if (!payload || !payload.email) {
      throw new UnauthorizedError('Invalid Google credential payload');
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (user) {
      if (user.isDeleted) {
        throw new UnauthorizedError('User account is deleted');
      }
      if (!user.isActive) {
        throw new UnauthorizedError('User account is inactive');
      }

      // SECURITY: Prevent account takeover — do NOT silently switch a local
      // account to Google. The user must log in via their original provider.
      if (user.provider !== 'google') {
        throw new ConflictError(
          'An account with this email already exists. Please log in with your email and password.'
        );
      }

      user.lastLoginAt = new Date();
      await user.save();
    } else {
      // Create new user via Google
      user = new User({
        name: payload.name || payload.email.split('@')[0],
        email,
        provider: 'google',
        profileImage: payload.picture,
        role: 'user',
        isActive: true,
      });
      await user.save();
    }

    const userResp = this.mapUserToResponse(user);
    const accessToken = generateAccessToken({
      userId: userResp.id,
      email: userResp.email,
      role: userResp.role,
    });
    const refreshToken = generateRefreshToken({
      userId: userResp.id,
    });

    return {
      user: userResp,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refreshes JWT tokens.
   */
  public static async refresh(userId: string): Promise<{ accessToken: string }> {
    const user = await User.findById(userId).lean();
    if (!user || user.isDeleted || !user.isActive) {
      throw new UnauthorizedError('User not found or account is inactive');
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }

  /**
   * Formats database user documents into user responses.
   */
  public static mapUserToResponse(
    user: Pick<IUserDocument, '_id' | 'name' | 'email' | 'role' | 'profileImage' | 'telegramChatId' | 'discordWebhookUrl'>
  ): UserResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      telegramChatId: user.telegramChatId,
      discordWebhookUrl: user.discordWebhookUrl,
    };
  }
}
