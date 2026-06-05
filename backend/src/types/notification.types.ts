import { Document, Types } from 'mongoose';

import { AlertChannel } from './alert.types';

export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface INotification {
  userId: Types.ObjectId;
  jobId?: Types.ObjectId;
  channel: AlertChannel;
  status: NotificationStatus;
  error?: string;
  sentAt?: Date;
  isRead: boolean;
  createdAt: Date;
}

export interface INotificationDocument extends INotification, Document {
  _id: Types.ObjectId;
}
