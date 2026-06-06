import { logger } from '@/utils/logger';

export interface ClassificationJobPayload {
  jobId: string;
  companyName: string;
}

export async function addJobToClassificationQueue(
  payload: ClassificationJobPayload
) {
  try {
    logger.info(`Triggering background classification for ${payload.jobId} from ${payload.companyName}`);
    
    // Dynamic import to avoid circular dependencies
    const { processClassificationJob } = await import('../workers/classification.worker');
    
    // Execute asynchronously (fire-and-forget)
    processClassificationJob(payload.jobId, payload.companyName).catch((err) => {
      logger.error('Background classification job failed:', err);
    });
  } catch (error: any) {
    logger.error('Failed to trigger background classification:', error.message);
  }
}
