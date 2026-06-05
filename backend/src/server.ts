import mongoose from 'mongoose';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from '@/config/env';
import { connectRedis, redisClient } from '@/config/redis';
import { initTypesenseCollections } from '@/config/typesense';
import { connectDB, closeDB } from '@/database/connectDB';
import { initIndexes } from '@/database/indexes';
import { authorizeAdmin } from '@/middleware/admin.middleware';
import { authenticate } from '@/middleware/auth.middleware';
import { errorHandler } from '@/middleware/errorHandler';
import { NotFoundError } from '@/middleware/errorHandler';
import { globalRateLimiter } from '@/middleware/rateLimiter';
import { requestIdMiddleware } from '@/middleware/requestId.middleware';
import { authRouter } from '@/modules/auth/auth.routes';
import { userRouter } from '@/modules/user/user.routes';
import { jobsRouter } from '@/modules/jobs/jobs.routes';
import { companiesRouter } from '@/modules/companies/companies.routes';
import { alertsRouter } from '@/modules/alerts/alerts.routes';
import { notificationRouter } from '@/modules/notifications/notification.routes';
import scraperRouter from '@/modules/scraper/scraper.routes';
import { initializeScheduler } from '@/scrapers/scheduler';
import { logger } from '@/utils/logger';

const app: Express = express();

// ────────────────────────────────────────────────
// Global Middlewares
// ────────────────────────────────────────────────

// Trust first proxy hop — required for correct req.ip behind Nginx/Cloudflare
app.set('trust proxy', 1);

// Generate unique request ID for tracing
app.use(requestIdMiddleware);

// Security HTTP headers
app.use(helmet());

// CORS configuration matching FRONTEND_URL
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Gzip compression
app.use(compression());

// Body parsers with size limits to prevent large-payload DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parser for reading refresh tokens
app.use(cookieParser());

// Request logging
if (env.NODE_ENV !== 'test') {
  if (env.NODE_ENV === 'production') {
    app.use(morgan('{"request_id":":req[X-Request-Id]", "method":":method", "url":":url", "status":":status", "time":":response-time ms"}'));
  } else {
    app.use(morgan('dev'));
  }
}

// Global rate limiting
app.use(globalRateLimiter);

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────

// Health Check
app.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = redisClient?.status === 'ready' ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: dbStatus === 'connected' && redisStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      mongodb: dbStatus,
      redis: redisStatus
    }
  });
});

const API_PREFIX = '/api/v1';

// Auth Routes
app.use(`${API_PREFIX}/auth`, authRouter);

// User Profile Routes
app.use(`${API_PREFIX}/users`, userRouter);

// Jobs Routes
app.use(`${API_PREFIX}/jobs`, jobsRouter);

// Companies Routes
app.use(`${API_PREFIX}/companies`, companiesRouter);

// Alerts Routes
app.use(`${API_PREFIX}/alerts`, alertsRouter);

// Notification Routes
app.use(`${API_PREFIX}/notifications`, notificationRouter);

// Scraper Routes
app.use(`/api/scrape`, scraperRouter);


// Mount test routes during testing
if (env.NODE_ENV === 'test') {
  app.get(`${API_PREFIX}/test-admin-only`, authenticate, authorizeAdmin, (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Welcome Admin!' });
  });
}

// 404 handler for unknown routes
app.use((_req: Request, _res: Response, next) => {
  next(new NotFoundError('Route'));
});

// Global Error Handler
app.use(errorHandler);

// ────────────────────────────────────────────────
// Server Initialization
// ────────────────────────────────────────────────

const PORT = env.PORT || 3000;
let server: any;

async function startServer(): Promise<void> {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Synchronize database indexes
    await initIndexes();

    // 3. Initialize Redis connection gracefully (defensive check)
    try {
      await connectRedis();
      logger.info('✅ Redis connection initialized successfully');
    } catch (err: any) {
      logger.warn(`⚠️  Failed to connect to Redis: ${err.message}`);
    }

    // 4. Initialize Typesense collections gracefully (defensive check)
    try {
      await initTypesenseCollections();
      logger.info('✅ Typesense collection verified successfully');
    } catch (err: any) {
      logger.warn(`⚠️  Failed to initialize Typesense: ${err.message}`);
    }

    // 5. Start listening
    if (env.NODE_ENV !== 'test') {
      initializeScheduler();
      server = app.listen(PORT, () => {
        logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
      });
      
      // Graceful shutdown handling
      const gracefulShutdown = async (signal: string) => {
        logger.warn(`Received ${signal}. Starting graceful shutdown...`);
        if (server) {
          server.close(() => {
            logger.info('HTTP server closed.');
          });
        }
        await closeDB();
        if (redisClient) {
          await redisClient.quit();
          logger.info('Redis connection closed.');
        }
        process.exit(0);
      };

      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    }
  } catch (error) {
    logger.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
}

// Start only if this file is run directly (not imported as a module in tests)
if (require.main === module) {
  startServer();
}

export { app, startServer };
