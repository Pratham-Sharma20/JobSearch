import { Schema, model } from 'mongoose';

import { INotificationDocument } from '@/types/notification.types';

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    channel: {
      type: String,
      enum: ['email', 'telegram', 'discord'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    error: { type: String, trim: true },
    sentAt: { type: Date },
    isRead: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Index for createdAt to support querying notification logs chronologically
notificationSchema.index({ createdAt: -1 });

// Compound unique index to prevent duplicate notifications for the same job and channel to the same user
notificationSchema.index({ userId: 1, jobId: 1, channel: 1 }, { unique: true });

export const Notification = model<INotificationDocument>('Notification', notificationSchema);
