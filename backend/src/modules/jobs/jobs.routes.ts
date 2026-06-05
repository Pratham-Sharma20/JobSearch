import { Router } from 'express';
import { getJobs, getJobById } from './jobs.controller';
import { validate } from '@/middleware/validate.middleware';
import { searchJobsSchema } from '@/validators/job.validator';
import { saveJobSchema } from '@/validators/savedJob.validator';
import { saveJob, removeSavedJob } from '@/modules/saved-jobs/savedJobs.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.get('/', validate(searchJobsSchema), getJobs);
router.get('/:id', getJobById);

// Saved Jobs endpoints on Jobs resource
router.post('/:id/save', authenticate, validate(saveJobSchema), saveJob);
router.delete('/:id/save', authenticate, validate(saveJobSchema), removeSavedJob);

export { router as jobsRouter };

