import { classificationQueue } from '@/config/bullmq';
import { logger } from '@/utils/logger';

export interface ClassificationJobPayload {
  jobId: string;
  companyName: string;
}

export async function addJobToClassificationQueue(
  payload: ClassificationJobPayload
) {
  try {
    await classificationQueue.add('classifyJob', payload, {
      jobId: `${payload.jobId}-${payload.companyName}`,
      removeOnComplete: true,
      removeOnFail: false,
    });
    logger.info(
      `Added job ${payload.jobId} from ${payload.companyName} to classification queue`
    );
  } catch (error: any) {
    logger.error('Failed to add job to classification queue:', error.message);
  }
}
