import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../server';
import { User } from '../../models/User.model';
import { Job } from '../../models/Job.model';
import { Alert } from '../../models/Alert.model';
import { Notification } from '../../models/Notification.model';
import { generateAccessToken } from '../../utils/jwt';
import { matchAlertsForJob } from '../alerts/alerts.matcher';

vi.mock('bullmq', () => ({ Queue: vi.fn(), Worker: vi.fn() }));
vi.mock('ioredis', () => {
  class RedisMock {
    on = vi.fn();
    quit = vi.fn();
    status = 'ready';
  }
  return { default: RedisMock, Redis: RedisMock };
});
vi.mock('typesense', () => ({ default: { Client: vi.fn() }, Client: vi.fn() }));
vi.mock('@/services/channels/email.service', () => ({ emailService: { sendEmail: vi.fn() } }));
vi.mock('@/services/channels/telegram.service', () => ({ telegramService: { sendMessage: vi.fn() } }));
vi.mock('@/services/channels/discord.service', () => ({ discordService: { sendWebhook: vi.fn() } }));

describe('Notifications API Tests', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
    await Alert.deleteMany({});
    await Notification.deleteMany({});

    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });
    userId = user._id as mongoose.Types.ObjectId;
    token = generateAccessToken({ userId: userId.toString(), email: user.email, role: user.role });
  });

  describe('Alerts Matcher Logic', () => {
    it('should match jobs correctly based on alert criteria', async () => {
      await Alert.create({
        userId,
        company: 'Google',
        jobCategory: 'internship',
        channels: ['email'],
        isActive: true,
      });

      const matchedJob = await Job.create({
        jobId: 'match-1',
        jobTitle: 'Software Engineer Intern',
        companyName: 'Google',
        companyId: new mongoose.Types.ObjectId(),
        companyLogoUrl: 'http://example.com/logo.png',
        industry: 'Technology',
        location: 'Mountain View, CA',
        country: 'US',
        workModel: 'onsite',
        department: 'Engineering',
        jobCategory: 'internship',
        applyUrl: 'http://example.com/apply',
        description: 'Great internship.',
        descriptionSnippet: 'Great internship.',
        sourcePlatform: 'greenhouse',
        aiClassification: 'internship',
        aiConfidence: 0.9,
        classificationReason: 'clear',
        isExpired: false,
        lastSeen: new Date(),
      });

      const unmatchedJob = await Job.create({
        jobId: 'unmatch-1',
        jobTitle: 'Software Engineer',
        companyName: 'Facebook',
        companyId: new mongoose.Types.ObjectId(),
        companyLogoUrl: 'http://example.com/logo.png',
        industry: 'Technology',
        location: 'Menlo Park, CA',
        country: 'US',
        workModel: 'onsite',
        department: 'Engineering',
        jobCategory: 'entry_level',
        applyUrl: 'http://example.com/apply',
        description: 'Great job.',
        descriptionSnippet: 'Great job.',
        sourcePlatform: 'greenhouse',
        aiClassification: 'entry_level',
        aiConfidence: 0.9,
        classificationReason: 'clear',
        isExpired: false,
        lastSeen: new Date(),
      });

      const matchedResults = await matchAlertsForJob(matchedJob);
      expect(matchedResults.length).toBe(1);
      expect(matchedResults[0].user._id.toString()).toBe(userId.toString());
      expect(matchedResults[0].channels).toContain('email');

      const unmatchedResults = await matchAlertsForJob(unmatchedJob);
      expect(unmatchedResults.length).toBe(0);
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should fetch user notifications', async () => {
      await Notification.create({
        userId,
        channel: 'email',
        status: 'sent',
      });

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('sent');
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const notification = await Notification.create({
        userId,
        channel: 'email',
        status: 'sent',
      });

      expect(notification.isRead).toBe(false);

      const res = await request(app)
        .patch(`/api/v1/notifications/${notification._id}/read`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
    });
  });
});
