import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../server';
import { Job } from '../../models/Job.model';
import { Company } from '../../models/Company.model';

vi.mock('bullmq', () => ({ Queue: vi.fn(), Worker: vi.fn() }));
vi.mock('ioredis', () => ({ default: vi.fn() }));
vi.mock('typesense', () => ({ default: { Client: vi.fn() }, Client: vi.fn() }));

describe('Companies API Tests', () => {
  let mongoServer: MongoMemoryServer;

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

    await Job.create({
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
  });

  describe('GET /api/v1/companies', () => {
    it('should fetch all companies', async () => {
      const res = await request(app).get('/api/v1/companies');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Google');
    });
  });

  describe('GET /api/v1/companies/:name/jobs', () => {
    it('should fetch jobs for a specific company', async () => {
      const res = await request(app).get('/api/v1/companies/google/jobs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.jobs.length).toBe(1);
    });

    it('should return 404 if company does not exist', async () => {
      const res = await request(app).get('/api/v1/companies/not-exists/jobs');
      expect(res.status).toBe(404);
    });
  });
});
