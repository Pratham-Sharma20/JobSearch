import mongoose from 'mongoose';

import { env } from '@/config/env';
import { logger } from '@/utils/logger';

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;
let retryCount = 0;

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  // Set up event listeners
  mongoose.connection.on('connected', () => {
    logger.info('✅ MongoDB Atlas connected successfully');
    retryCount = 0; // reset retry count on successful connection
  });

  mongoose.connection.on('error', (err) => {
    logger.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB connection disconnected');
  });

  // Connection function with retry logic
  const attemptConnection = async () => {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
      });
    } catch (error) {
      retryCount++;
      logger.error(`MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}):`, error);

      if (retryCount < MAX_RETRIES) {
        logger.info(`Retrying connection in ${RETRY_INTERVAL_MS / 1000}s...`);
        setTimeout(attemptConnection, RETRY_INTERVAL_MS);
      } else {
        logger.error('❌ Max MongoDB connection retries reached.');
        // In test environments, throw instead of killing the process
        if (env.NODE_ENV === 'test') {
          throw new Error('Max MongoDB connection retries reached');
        }
        process.exit(1);
      }
    }
  };

  await attemptConnection();
}

// Graceful shutdown handling
export async function closeDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed gracefully');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
    }
  }
}


