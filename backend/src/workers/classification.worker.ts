import { Worker, Job as BullJob } from 'bullmq';

import { QUEUE_NAMES } from '@/config/bullmq';
import { getRedisClient } from '@/config/redis';
import { Job } from '@/models/Job.model';
import { classifierService } from '@/services/ai/classifier.service';
import { logger } from '@/utils/logger';

import { ClassificationJobPayload } from '../queues/classification.queue';

export const classificationWorker = new Worker<ClassificationJobPayload>(
  QUEUE_NAMES.CLASSIFICATION,
  async (job: BullJob<ClassificationJobPayload>) => {
    const { jobId, companyName } = job.data;
    logger.info(`Processing classification for ${companyName} - ${jobId}`);

    // 1. Fetch Job from MongoDB
    const dbJob = await Job.findOne({ jobId, companyName });
    if (!dbJob) {
      logger.warn(`Job not found in DB: ${jobId} - ${companyName}`);
      return;
    }

    if (!dbJob.description) {
      logger.warn(`Job ${jobId} has no description`);
      return;
    }

    // 2. Call AI Classifier
    const result = await classifierService.classifyJob(
      dbJob.jobTitle,
      dbJob.description
    );

    // 3. Update DB
    dbJob.aiClassification = result.classification;
    dbJob.aiConfidence = result.confidence;
    dbJob.classificationReason = result.reason;

    // 4. Rejection Rule: if experienced or not_a_job & confidence > 0.8 => expired
    if (['experienced', 'not_a_job'].includes(result.classification) && result.confidence > 0.8) {
      logger.info(
        `Job ${jobId} identified as ${result.classification} with high confidence. Marking as expired.`
      );
      dbJob.isExpired = true;
      dbJob.expiredAt = new Date();
    }

    await dbJob.save();
    logger.info(`Successfully classified job ${jobId} as ${result.classification}`);

    // 5. Trigger notifications for active early career jobs
    const earlyCareerCategories = ['internship', 'new_grad', 'entry_level', 'co_op', 'rotational'];
    if (!dbJob.isExpired && earlyCareerCategories.includes(result.classification)) {
      const { addJobToNotificationQueue } = await import('../queues/notification.queue');
      await addJobToNotificationQueue({
        jobId: dbJob.jobId,
        companyName: dbJob.companyName,
      });
    }
  },
  {
    connection: getRedisClient() as any,
    concurrency: 5,
  }
);

classificationWorker.on('completed', (job) => {
  logger.debug(`Classification job completed: ${job.id}`);
});

classificationWorker.on('failed', (job, err) => {
  logger.error(
    `Classification job failed for ${job?.data.companyName} - ${job?.data.jobId}:`,
    err.message
  );
});
