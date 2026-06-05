import { Request, Response } from 'express';

import { getNotificationsByUserId, markNotificationAsRead } from './notification.service';
import { logger } from '@/utils/logger';

export const getNotificationsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getNotificationsByUserId(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        pages: result.pages,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

export const markAsReadHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const notification = await markNotificationAsRead(userId, id);

    if (!notification) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error: any) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
};
