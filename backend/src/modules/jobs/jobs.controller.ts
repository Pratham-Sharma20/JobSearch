import { Request, Response } from 'express';
import { JobsService } from './jobs.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { NotFoundError } from '@/middleware/errorHandler';

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const result = await JobsService.getJobs(req.query as any);
  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const job = await JobsService.getJobById(req.params.id as string);
  
  if (!job) {
    throw new NotFoundError('Job');
  }

  res.status(200).json({
    success: true,
    job,
  });
});
