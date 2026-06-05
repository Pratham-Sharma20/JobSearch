import { SavedJob } from '@/models/SavedJob.model';
import { Job } from '@/models/Job.model';
import { NotFoundError, ConflictError } from '@/middleware/errorHandler';

export class SavedJobsService {
  static async saveJob(userId: string, jobId: string) {
    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      throw new NotFoundError('Job');
    }

    try {
      const savedJob = await SavedJob.create({ userId, jobId });
      return savedJob;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('Duplicate save');
      }
      throw error;
    }
  }

  static async removeSavedJob(userId: string, jobId: string) {
    const result = await SavedJob.findOneAndDelete({ userId, jobId });
    if (!result) {
      throw new NotFoundError('Saved job');
    }
    return result;
  }

  static async getSavedJobs(userId: string) {
    // Populate the jobs and return
    const savedJobs = await SavedJob.find({ userId })
      .populate('jobId')
      .sort({ savedAt: -1 })
      .lean();
    
    return savedJobs;
  }
}
