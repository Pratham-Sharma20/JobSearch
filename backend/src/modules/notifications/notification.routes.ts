import { Router } from 'express';

import { authenticate } from '@/middleware/auth.middleware';

import { getNotificationsHandler, markAsReadHandler } from './notification.controller';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', getNotificationsHandler);
router.patch('/:id/read', markAsReadHandler);

export const notificationRouter = router;
