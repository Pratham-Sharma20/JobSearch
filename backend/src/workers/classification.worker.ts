import { Job } from '@/models/Job.model';
import { classifierService } from '@/services/ai/classifier.service';
import { logger } from '@/utils/logger';

export async function processClassificationJob(jobId: string, companyName: string) {
  logger.info(`Processing classification for ${companyName} - ${jobId}`);

  try {
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
      const { processNotificationJob } = await import('./notification.worker');
      
      // Execute asynchronously in the background
      processNotificationJob(dbJob.jobId, dbJob.companyName).catch((err) => {
        logger.error(`Notification dispatch failed for ${dbJob.companyName} - ${dbJob.jobId}:`, err);
      });
    }
  } catch (err: any) {
    logger.error(`Classification job failed for ${companyName} - ${jobId}:`, err.message);
  }
}
