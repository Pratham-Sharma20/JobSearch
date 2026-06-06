import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../server';
import { User } from '../../models/User.model';
import { Alert } from '../../models/Alert.model';
import { generateAccessToken } from '../../utils/jwt';

vi.mock('typesense', () => ({ default: { Client: vi.fn() }, Client: vi.fn() }));

describe('Alerts API Tests', () => {
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
    await Alert.deleteMany({});

    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });
    userId = user._id as mongoose.Types.ObjectId;
    token = generateAccessToken({ userId: userId.toString(), email: user.email, role: user.role });
  });

  describe('POST /api/v1/alerts', () => {
    it('should create an alert', async () => {
      const res = await request(app)
        .post('/api/v1/alerts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: 'Google',
          department: 'engineering',
          location: 'remote',
          jobCategory: 'internship',
          channels: ['email', 'telegram'],
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.alert.company).toBe('Google');
      expect(res.body.alert.channels).toContain('email');
    });

    it('should fail validation without channels', async () => {
      const res = await request(app)
        .post('/api/v1/alerts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: 'Google',
        });
      
      expect(res.status).toBe(422); // Zod validation
    });
  });

  describe('GET /api/v1/alerts', () => {
    it('should fetch user alerts', async () => {
      await Alert.create({
        userId,
        company: 'Google',
        channels: ['email'],
      });

      const res = await request(app)
        .get('/api/v1/alerts')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.alerts.length).toBe(1);
    });
  });

  describe('PUT /api/v1/alerts/:id', () => {
    it('should update an alert', async () => {
      const alert = await Alert.create({
        userId,
        company: 'Google',
        channels: ['email'],
      });

      const res = await request(app)
        .put(`/api/v1/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          channels: ['telegram'],
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.alert.channels).toContain('telegram');
      expect(res.body.alert.channels).not.toContain('email');
    });

    it('should return 404 for non-existent alert', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/alerts/${randomId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ channels: ['email'] });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/alerts/:id', () => {
    it('should delete an alert', async () => {
      const alert = await Alert.create({
        userId,
        company: 'Google',
        channels: ['email'],
      });

      const res = await request(app)
        .delete(`/api/v1/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Alert deleted successfully');

      const count = await Alert.countDocuments();
      expect(count).toBe(0);
    });
  });
});
