import { Types } from 'mongoose';

import { Notification } from '@/models/Notification.model';
import { INotificationDocument } from '@/types/notification.types';

export const getNotificationsByUserId = async (
  userId: string | Types.ObjectId,
  page = 1,
  limit = 20
): Promise<{ data: INotificationDocument[]; total: number; pages: number }> => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('jobId'),
    Notification.countDocuments({ userId }),
  ]);

  return {
    data,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const markNotificationAsRead = async (
  userId: string | Types.ObjectId,
  notificationId: string | Types.ObjectId
): Promise<INotificationDocument | null> => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { new: true }
  );
};
