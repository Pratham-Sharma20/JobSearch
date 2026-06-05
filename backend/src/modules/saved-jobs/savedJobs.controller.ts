import { Request, Response } from 'express';
import { SavedJobsService } from './savedJobs.service';
import { asyncHandler } from '@/utils/asyncHandler';

export const saveJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id: jobId } = req.params;

  await SavedJobsService.saveJob(userId, jobId as string);
  res.status(201).json({ success: true, message: 'Job saved successfully' });
});

export const removeSavedJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id: jobId } = req.params;

  await SavedJobsService.removeSavedJob(userId, jobId as string);
  res.status(200).json({ success: true, message: 'Job removed from saved list' });
});

export const getSavedJobs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  
  const savedJobs = await SavedJobsService.getSavedJobs(userId);
  res.status(200).json({ success: true, savedJobs });
});
