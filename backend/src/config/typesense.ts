import Typesense from 'typesense';

import { logger } from '@/utils/logger';

import { env } from './env';

export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: env.TYPESENSE_HOST,
      port: env.TYPESENSE_PORT,
      protocol: env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
  retryIntervalSeconds: 0.1,
  healthcheckIntervalSeconds: 60,
  numRetries: 3,
});

// ────────────────────────────────────────────────
// Schema definitions
// ────────────────────────────────────────────────

export const JOB_COLLECTION_NAME = 'jobs';

export const jobCollectionSchema = {
  name: JOB_COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'title', type: 'string' as const, infix: true },
    { name: 'company', type: 'string' as const, facet: true },
    { name: 'location', type: 'string' as const, facet: true },
    { name: 'jobType', type: 'string' as const, facet: true },
    { name: 'salary', type: 'string' as const, optional: true },
    { name: 'salaryMin', type: 'int32' as const, optional: true, facet: true },
    { name: 'salaryMax', type: 'int32' as const, optional: true, facet: true },
    { name: 'description', type: 'string' as const },
    { name: 'skills', type: 'string[]' as const, facet: true },
    { name: 'category', type: 'string' as const, facet: true },
    { name: 'experienceLevel', type: 'string' as const, facet: true },
    { name: 'remote', type: 'bool' as const, facet: true },
    { name: 'postedAt', type: 'int64' as const },
    { name: 'source', type: 'string' as const, facet: true },
    { name: 'isActive', type: 'bool' as const },
  ],
  default_sorting_field: 'postedAt',
};

export async function initTypesenseCollections(): Promise<void> {
  try {
    await typesenseClient.collections(JOB_COLLECTION_NAME).retrieve();
    logger.info('✅ Typesense collection already exists');
  } catch {
    // Collection doesn't exist, create it
    await typesenseClient.collections().create(jobCollectionSchema);
    logger.info('✅ Typesense collection created');
  }
}
