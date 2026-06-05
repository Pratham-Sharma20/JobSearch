import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../server';
import { Job } from '../../models/Job.model';
import { Company } from '../../models/Company.model';
import { User } from '../../models/User.model';
import { SavedJob } from '../../models/SavedJob.model';
import { generateAccessToken } from '../../utils/jwt';

vi.mock('bullmq', () => ({ Queue: vi.fn(), Worker: vi.fn() }));
vi.mock('ioredis', () => ({ default: vi.fn() }));
vi.mock('typesense', () => ({ default: { Client: vi.fn() }, Client: vi.fn() }));

describe('Saved Jobs API Tests', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let userId: mongoose.Types.ObjectId;
  let jobId: string;

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
    await Job.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});
    await SavedJob.deleteMany({});

    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });
    userId = user._id as mongoose.Types.ObjectId;
    token = generateAccessToken({ userId: userId.toString(), email: user.email, role: user.role });

    const company = await Company.create({
      name: 'Google',
      domain: 'google.com',
      logoUrl: 'http://logo.com',
      careerUrl: 'http://career.com',
      earlyCareerUrl: 'http://early.com',
      industry: 'tech',
      atsPlatform: 'custom',
      scrapeStrategy: 'static',
      activeJobCount: 1,
    });

    const job = await Job.create({
      jobId: 'GGL-123',
      jobTitle: 'Software Engineer Intern',
      companyName: 'Google',
      companyId: company._id,
      companyLogoUrl: 'http://logo.com',
      industry: 'tech',
      location: 'Mountain View, CA',
      country: 'USA',
      workModel: 'onsite',
      department: 'Engineering',
      jobCategory: 'internship',
      applyUrl: 'http://apply.com',
      description: 'Full description',
      descriptionSnippet: 'Snippet',
      sourcePlatform: 'google',
      aiClassification: 'internship',
      aiConfidence: 0.9,
      classificationReason: 'testing',
      isExpired: false,
    });
    jobId = job._id.toString();
  });

  describe('POST /api/v1/jobs/:id/save', () => {
    it('should save a job successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${jobId}/save`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Job saved successfully');
    });

    it('should prevent duplicate saves', async () => {
      await SavedJob.create({ userId, jobId });

      const res = await request(app)
        .post(`/api/v1/jobs/${jobId}/save`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(409); // Conflict error
    });

    it('should return 404 if job does not exist', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/v1/jobs/${randomId}/save`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/jobs/:id/save', () => {
    it('should remove a saved job', async () => {
      await SavedJob.create({ userId, jobId });

      const res = await request(app)
        .delete(`/api/v1/jobs/${jobId}/save`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Job removed from saved list');
    });
  });

  describe('GET /api/v1/users/saved-jobs', () => {
    it('should get all saved jobs populated with job details', async () => {
      await SavedJob.create({ userId, jobId });

      const res = await request(app)
        .get(`/api/v1/users/saved-jobs`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.savedJobs.length).toBe(1);
      expect(res.body.savedJobs[0].jobId.jobTitle).toBe('Software Engineer Intern');
    });
  });
});
