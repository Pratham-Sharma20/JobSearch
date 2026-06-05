import mongoose from 'mongoose';

import '@/models/Alert.model';
import '@/models/AuditLog.model';
import '@/models/Company.model';
import '@/models/Job.model';
import '@/models/Notification.model';
import '@/models/SavedJob.model';
import '@/models/ScrapeLog.model';
// Import all models to ensure they are registered in Mongoose
import '@/models/User.model';
import { logger } from '@/utils/logger';

/**
 * Automatically synchronizes indexes defined in Mongoose schemas with MongoDB.
 */
export async function initIndexes(): Promise<void> {
  const modelNames = Object.keys(mongoose.models);
  logger.info(`🔄 Synchronizing indexes for ${modelNames.length} registered models...`);

  for (const modelName of modelNames) {
    const model = mongoose.models[modelName];
    try {
      // syncIndexes drops indexes no longer in the schema and creates new ones
      await model.syncIndexes();
      logger.info(`✅ Indexes synced successfully for model: ${modelName}`);
    } catch (error) {
      logger.error(`❌ Failed to sync indexes for model: ${modelName}`, error);
    }
  }
}
