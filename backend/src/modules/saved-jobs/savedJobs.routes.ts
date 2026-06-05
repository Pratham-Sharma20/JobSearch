import { Router } from 'express';
import { getSavedJobs } from './savedJobs.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Note: /api/users/saved-jobs is expected to map here
router.get('/', getSavedJobs);

export { router as savedJobsRouter };
