import { logger } from '@/utils/logger';

export interface NotificationJobPayload {
  jobId: string;
  companyName: string;
}

export async function addJobToNotificationQueue(
  payload: NotificationJobPayload
) {
  try {
    logger.info(`Triggering background notification for ${payload.jobId} from ${payload.companyName}`);
    
    // Dynamic import to avoid circular dependencies
    const { processNotificationJob } = await import('../workers/notification.worker');
    
    // Execute asynchronously (fire-and-forget)
    processNotificationJob(payload.jobId, payload.companyName).catch((err) => {
      logger.error('Background notification job failed:', err);
    });
  } catch (error: any) {
    logger.error('Failed to trigger background notification:', error.message);
  }
}
