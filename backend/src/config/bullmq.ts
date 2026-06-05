import { Queue, QueueOptions } from 'bullmq';

import { getRedisClient } from './redis';

const defaultQueueOptions: Partial<QueueOptions> = {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // 1 hour
      count: 100,
    },
    removeOnFail: {
      age: 24 * 3600, // 24 hours
    },
  },
};

function createQueue(name: string, options?: Partial<QueueOptions>): Queue {
  return new Queue(name, {
    connection: getRedisClient() as any,
    ...defaultQueueOptions,
    ...options,
  });
}

// ────────────────────────────────────────────────
// Queue instances
// ────────────────────────────────────────────────

export const QUEUE_NAMES = {
  JOB_SCRAPER: 'job-scraper',
  JOB_INDEXER: 'job-indexer',
  NOTIFICATIONS: 'notifications',
  ALERTS: 'alerts',
  EMAIL: 'email',
  CLASSIFICATION: 'classificationQueue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const jobScraperQueue = createQueue(QUEUE_NAMES.JOB_SCRAPER);
export const jobIndexerQueue = createQueue(QUEUE_NAMES.JOB_INDEXER);
export const notificationsQueue = createQueue(QUEUE_NAMES.NOTIFICATIONS, {
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
  },
});
export const alertsQueue = createQueue(QUEUE_NAMES.ALERTS);
export const emailQueue = createQueue(QUEUE_NAMES.EMAIL);
export const classificationQueue = createQueue(QUEUE_NAMES.CLASSIFICATION, {
  defaultJobOptions: {
    attempts: 5, // more attempts for AI rate limits
    backoff: { type: 'exponential', delay: 3000 },
  },
});

export const allQueues = [
  jobScraperQueue,
  jobIndexerQueue,
  notificationsQueue,
  alertsQueue,
  emailQueue,
  classificationQueue,
];
