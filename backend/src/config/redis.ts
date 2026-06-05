import Redis from 'ioredis';

import { logger } from '@/utils/logger';

import { env } from './env';

export let redisClient: Redis | null = null;

function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
    reconnectOnError: (err) => {
      logger.error('Redis connection error:', err.message);
      return true;
    },
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
  });

  client.on('connect', () => logger.info('✅ Redis connected'));
  client.on('ready', () => logger.info('✅ Redis ready'));
  client.on('error', (err) => logger.error('Redis error:', err.message));
  client.on('close', () => logger.warn('⚠️  Redis connection closed'));
  client.on('reconnecting', () => logger.info('Redis reconnecting...'));

  return client;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (client.status === 'wait') {
    await client.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
}
