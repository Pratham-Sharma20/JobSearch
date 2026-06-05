import { notificationsQueue } from '@/config/bullmq';
import { logger } from '@/utils/logger';

export interface NotificationJobPayload {
  jobId: string;
  companyName: string;
}

export const addJobToNotificationQueue = async (
  payload: NotificationJobPayload
): Promise<void> => {
  try {
    await notificationsQueue.add('sendNotifications', payload, {
      jobId: `notify-${payload.companyName}-${payload.jobId}`,
    });
    logger.debug(`Added job ${payload.jobId} to notifications queue`);
  } catch (error) {
    logger.error(`Failed to add job ${payload.jobId} to notifications queue:`, error);
  }
};
