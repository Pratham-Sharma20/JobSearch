import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../server';
import { Job } from '../../models/Job.model';
import { Company } from '../../models/Company.model';

// Mocks to prevent Redis/BullMQ/Typesense from trying to connect
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({ add: vi.fn(), close: vi.fn().mockResolvedValue(undefined) })),
  Worker: vi.fn().mockImplementation(() => ({ on: vi.fn(), close: vi.fn().mockResolvedValue(undefined) })),
}));

vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: vi.fn(), connect: vi.fn().mockResolvedValue(undefined),
    quit: vi.fn().mockResolvedValue(undefined), disconnect: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('typesense', () => {
  const Client = function (this: any) {
    this.collections = vi.fn().mockReturnValue({ retrieve: vi.fn().mockResolvedValue({}), create: vi.fn().mockResolvedValue({}) });
  };
  return { default: { Client }, Client };
});

describe('Jobs API Tests', () => {
  let mongoServer: MongoMemoryServer;
  let companyId: mongoose.Types.ObjectId;
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
    companyId = company._id as mongoose.Types.ObjectId;

    const job = await Job.create({
      jobId: 'GGL-123',
      jobTitle: 'Software Engineer Intern',
      companyName: 'Google',
      companyId,
      companyLogoUrl: 'http://logo.com',
      industry: 'tech',
      location: 'Mountain View, CA',
      country: 'USA',
      workModel: 'onsite',
      department: 'Engineering',
      jobCategory: 'internship',
      applyUrl: 'http://apply.com',
      description: 'Full description here',
      descriptionSnippet: 'Snippet here',
      sourcePlatform: 'google_careers',
      aiClassification: 'internship',
      aiConfidence: 0.95,
      classificationReason: 'Title says intern',
      isExpired: false,
    });
    jobId = job._id.toString();

    // Expired job
    await Job.create({
      jobId: 'GGL-456',
      jobTitle: 'Expired Job',
      companyName: 'Google',
      companyId,
      companyLogoUrl: 'http://logo.com',
      industry: 'tech',
      location: 'Mountain View, CA',
      country: 'USA',
      workModel: 'onsite',
      department: 'Engineering',
      jobCategory: 'internship',
      applyUrl: 'http://apply.com',
      description: 'Expired description',
      descriptionSnippet: 'Expired snippet',
      sourcePlatform: 'google_careers',
      aiClassification: 'internship',
      aiConfidence: 0.95,
      classificationReason: 'Title says intern',
      isExpired: true,
    });
  });

  describe('GET /api/v1/jobs', () => {
    it('should fetch jobs and exclude expired ones', async () => {
      const res = await request(app).get('/api/v1/jobs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.jobs.length).toBe(1);
      expect(res.body.jobs[0].jobTitle).toBe('Software Engineer Intern');
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter jobs by keyword', async () => {
      const res = await request(app).get('/api/v1/jobs?keyword=Software');
      expect(res.status).toBe(200);
      expect(res.body.jobs.length).toBe(1);
      
      const res2 = await request(app).get('/api/v1/jobs?keyword=NotExists');
      expect(res2.status).toBe(200);
      expect(res2.body.jobs.length).toBe(0);
    });
  });

  describe('GET /api/v1/jobs/:id', () => {
    it('should fetch a single job by id', async () => {
      const res = await request(app).get(`/api/v1/jobs/${jobId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.job.jobTitle).toBe('Software Engineer Intern');
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app).get('/api/v1/jobs/invalid_id');
      expect(res.status).toBe(400); // Handled by global cast error
    });
    
    it('should return null job if not found, wait no we throw 404', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/jobs/${randomId}`);
      expect(res.status).toBe(404);
    });
  });
});
