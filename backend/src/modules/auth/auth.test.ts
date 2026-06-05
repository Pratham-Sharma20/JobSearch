import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { authorizeAdmin } from '../../middleware/admin.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { ValidationError } from '../../middleware/errorHandler';
import { AuditLog } from '../../models/AuditLog.model';
import { User } from '../../models/User.model';
// Import the app and dependencies
import { app } from '../../server';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { hashPassword } from '../../utils/password';

import { AuthService } from './auth.service';

// ────────────────────────────────────────────────
// Mocks for External Infrastructure
// ────────────────────────────────────────────────

vi.mock('bullmq', () => {
  return {
    Queue: vi.fn().mockImplementation(() => {
      return {
        add: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
      };
    }),
    Worker: vi.fn().mockImplementation(() => {
      return {
        on: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        on: vi.fn(),
        connect: vi.fn().mockResolvedValue(undefined),
        quit: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

vi.mock('typesense', () => {
  const Client = function (this: any) {
    this.collections = vi.fn().mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({}),
    });
  };
  return {
    default: { Client },
    Client,
  };
});

// Spy on Google OAuth token verification
const googleTokenSpy = vi
  .spyOn(AuthService, 'verifyGoogleToken')
  .mockImplementation(async (token) => {
    if (token === 'valid_google_token') {
      return {
        email: 'googleuser@example.com',
        name: 'Google User',
        picture: 'http://example.com/pic.jpg',
        email_verified: true,
      } as any;
    }
    throw new ValidationError('Invalid Google token');
  });

describe('Phase 3 - Authentication & Authorization Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Spin up in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Disconnect mongoose if already connected, then connect to memory server
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database state between tests
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    vi.clearAllMocks();
  });

  // ────────────────────────────────────────────────
  // User Registration Tests
  // ────────────────────────────────────────────────
  describe('POST /api/v1/auth/register', () => {
    const registerUrl = '/api/v1/auth/register';

    it('should successfully register a new user with valid inputs', async () => {
      const res = await request(app).post(registerUrl).send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John Doe');
      expect(res.body.data.email).toBe('john@example.com');
      expect(res.body.data.role).toBe('user');
      expect(res.body.data.passwordHash).toBeUndefined();

      // Check DB entry
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeTruthy();
      expect(user?.name).toBe('John Doe');

      // Verify Audit log
      const audit = await AuditLog.findOne({ action: 'Register', email: 'john@example.com' });
      expect(audit).toBeTruthy();
    });

    it('should fail registration if email is duplicate', async () => {
      // Pre-create user
      await User.create({
        name: 'Existing',
        email: 'john@example.com',
        passwordHash: 'dummy_hash',
      });

      const res = await request(app).post(registerUrl).send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should fail if inputs fail Zod validations', async () => {
      // Weak password, short name
      const res = await request(app).post(registerUrl).send({
        name: 'J',
        email: 'not-an-email',
        password: 'weak',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  // ────────────────────────────────────────────────
  // User Login Tests
  // ────────────────────────────────────────────────
  describe('POST /api/v1/auth/login', () => {
    const loginUrl = '/api/v1/auth/login';

    beforeEach(async () => {
      // Create a user for login tests
      const passwordHash = await hashPassword('Password123!');
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        passwordHash,
        provider: 'local',
        role: 'user',
        isActive: true,
      });
    });

    it('should successfully log in and return access token in body and refresh token in cookie', async () => {
      const res = await request(app).post(loginUrl).send({
        email: 'login@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');

      // Cookie checks
      const cookies = (res.headers['set-cookie'] as unknown as string[]) || [];
      expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
      expect(cookies.some((c: string) => c.includes('HttpOnly'))).toBe(true);
      expect(cookies.some((c: string) => c.includes('SameSite=Strict'))).toBe(true);

      // Verify Audit log
      const audit = await AuditLog.findOne({ action: 'Login', email: 'login@example.com' });
      expect(audit).toBeTruthy();
    });

    it('should fail login on incorrect password', async () => {
      const res = await request(app).post(loginUrl).send({
        email: 'login@example.com',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should fail login if provider is Google but local authentication is used', async () => {
      await User.create({
        name: 'Google User',
        email: 'google_only@example.com',
        provider: 'google',
        role: 'user',
        isActive: true,
      });

      const res = await request(app).post(loginUrl).send({
        email: 'google_only@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('registered provider: google');
    });
  });

  // ────────────────────────────────────────────────
  // Google OAuth Login Tests
  // ────────────────────────────────────────────────
  describe('POST /api/v1/auth/google', () => {
    const googleUrl = '/api/v1/auth/google';

    it('should create a new user and log in if user does not exist', async () => {
      const res = await request(app).post(googleUrl).send({ credential: 'valid_google_token' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('googleuser@example.com');
      expect(res.body.data.user.name).toBe('Google User');
      expect(res.body.data.accessToken).toBeDefined();

      const user = await User.findOne({ email: 'googleuser@example.com' });
      expect(user).toBeTruthy();
      expect(user?.provider).toBe('google');

      const audit = await AuditLog.findOne({
        action: 'Google Login',
        email: 'googleuser@example.com',
      });
      expect(audit).toBeTruthy();
    });

    it('should reject google login if a local account with the same email already exists (prevent account takeover)', async () => {
      // Pre-create local user
      await User.create({
        name: 'Local John',
        email: 'googleuser@example.com',
        passwordHash: 'dummy_hash',
        provider: 'local',
      });

      const res = await request(app).post(googleUrl).send({ credential: 'valid_google_token' });

      // Should reject with 409 Conflict — not silently overwrite
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');

      // Verify the provider was NOT changed
      const user = await User.findOne({ email: 'googleuser@example.com' });
      expect(user?.provider).toBe('local'); // Must remain local
    });

    it('should fail google login on invalid google token', async () => {
      const res = await request(app).post(googleUrl).send({ credential: 'invalid_google_token' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ────────────────────────────────────────────────
  // Token Refresh Tests
  // ────────────────────────────────────────────────
  describe('POST /api/v1/auth/refresh', () => {
    const refreshUrl = '/api/v1/auth/refresh';

    it('should issue a new access token when a valid refresh token cookie is present', async () => {
      const user = await User.create({
        name: 'Refresh John',
        email: 'refresh@example.com',
        role: 'user',
      });

      const refreshToken = generateRefreshToken({ userId: user._id.toString() });

      const res = await request(app)
        .post(refreshUrl)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();

      // Check Audit Log
      const audit = await AuditLog.findOne({ action: 'Refresh Token', userId: user._id });
      expect(audit).toBeTruthy();
    });

    it('should fail to refresh if refresh token is missing', async () => {
      const res = await request(app).post(refreshUrl).send();

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Refresh token is missing');
    });

    it('should fail if refresh token is invalid', async () => {
      const res = await request(app)
        .post(refreshUrl)
        .set('Cookie', ['refreshToken=invalid_token'])
        .send();

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ────────────────────────────────────────────────
  // Logout Tests
  // ────────────────────────────────────────────────
  describe('POST /api/v1/auth/logout', () => {
    const logoutUrl = '/api/v1/auth/logout';

    it('should clear the cookie on logout', async () => {
      const user = await User.create({
        name: 'Logout John',
        email: 'logout@example.com',
      });
      const refreshToken = generateRefreshToken({ userId: user._id.toString() });

      const res = await request(app)
        .post(logoutUrl)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .send();

      expect(res.status).toBe(200);

      const cookies = (res.headers['set-cookie'] as unknown as string[]) || [];
      // Max age should be clear (expires in the past)
      expect(
        cookies.some(
          (c: string) =>
            c.includes('Max-Age=0') || c.includes('expires=') || c.startsWith('refreshToken=;')
        )
      ).toBe(true);

      // Verify Audit log
      const audit = await AuditLog.findOne({ action: 'Logout', userId: user._id });
      expect(audit).toBeTruthy();
    });
  });

  // ────────────────────────────────────────────────
  // Protected Routes Verification Tests
  // ────────────────────────────────────────────────
  describe('GET /api/v1/auth/me', () => {
    const meUrl = '/api/v1/auth/me';

    it('should retrieve user details if authorized with a valid access token', async () => {
      const user = await User.create({
        name: 'Authorized John',
        email: 'auth_john@example.com',
        role: 'user',
      });

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const res = await request(app).get(meUrl).set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('auth_john@example.com');
      expect(res.body.data.name).toBe('Authorized John');
    });

    it('should reject route access if token is missing or malformed', async () => {
      const resMissing = await request(app).get(meUrl);
      expect(resMissing.status).toBe(401);

      const resMalformed = await request(app)
        .get(meUrl)
        .set('Authorization', 'Bearer invalid_access_token');
      expect(resMalformed.status).toBe(401);
    });
  });

  // ────────────────────────────────────────────────
  // Admin Authorization Tests
  // ────────────────────────────────────────────────
  describe('Admin Middleware Route Protection', () => {
    it('should allow access to admin-only endpoints for users with admin role', async () => {
      const adminUser = await User.create({
        name: 'Admin Boss',
        email: 'admin@example.com',
        role: 'admin',
      });

      const token = generateAccessToken({
        userId: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
      });

      const res = await request(app)
        .get('/api/v1/test-admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Welcome Admin!');
    });

    it('should reject access to admin-only endpoints for non-admin users', async () => {
      const regularUser = await User.create({
        name: 'Regular Joe',
        email: 'regular@example.com',
        role: 'user',
      });

      const token = generateAccessToken({
        userId: regularUser._id.toString(),
        email: regularUser.email,
        role: regularUser.role,
      });

      const res = await request(app)
        .get('/api/v1/test-admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ────────────────────────────────────────────────
  // User Profile Route Tests
  // ────────────────────────────────────────────────
  describe('User Profile API - GET and PUT /api/v1/users/profile', () => {
    let regularUser: any;
    let token: string;

    beforeEach(async () => {
      regularUser = await User.create({
        name: 'Profile Owner',
        email: 'profile_owner@example.com',
        role: 'user',
        telegramChatId: '@old_telegram',
      });

      token = generateAccessToken({
        userId: regularUser._id.toString(),
        email: regularUser.email,
        role: regularUser.role,
      });
    });

    it('should retrieve current user profile details via GET', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('profile_owner@example.com');
      expect(res.body.data.telegramChatId).toBe('@old_telegram');
    });

    it('should successfully update editable profile fields via PUT', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          profileImage: 'http://example.com/new_pic.jpg',
          telegramChatId: '@new_telegram',
          discordWebhookUrl: 'https://discord.com/api/webhooks/valid_webhook',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.telegramChatId).toBe('@new_telegram');
      expect(res.body.data.discordWebhookUrl).toBe(
        'https://discord.com/api/webhooks/valid_webhook'
      );

      // Verify db changes
      const user = await User.findById(regularUser._id);
      expect(user?.name).toBe('Updated Name');
      expect(user?.telegramChatId).toBe('@new_telegram');

      // Verify audit trail
      const audit = await AuditLog.findOne({ action: 'Profile Update', userId: regularUser._id });
      expect(audit).toBeTruthy();
    });

    it('should ignore/block attempts to edit non-editable fields (email, role, provider)', async () => {
      // Sending email/role changes in PUT request body
      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'malicious@example.com',
          role: 'admin',
          provider: 'google',
        });

      // The validation doesn't let these through or they are ignored by the controller since they are not editable
      expect(res.status).toBe(200);

      const user = await User.findById(regularUser._id);
      expect(user?.email).toBe('profile_owner@example.com'); // unchanged
      expect(user?.role).toBe('user'); // unchanged
      expect(user?.provider).toBe('local'); // unchanged
    });
  });
});
