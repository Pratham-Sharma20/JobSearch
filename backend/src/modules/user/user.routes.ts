import { Router } from 'express';

import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { updateProfileSchema } from '@/validators/auth.validator';
import { getSavedJobs } from '@/modules/saved-jobs/savedJobs.controller';

import { UserController } from './user.controller';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), UserController.updateProfile);
router.get('/saved-jobs', authenticate, getSavedJobs);

export const userRouter = router;
