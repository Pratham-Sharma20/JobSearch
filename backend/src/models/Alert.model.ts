import { Schema, model } from 'mongoose';

import { IAlertDocument } from '@/types/alert.types';

const alertSchema = new Schema<IAlertDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, trim: true },
    department: { type: String, trim: true },
    location: { type: String, trim: true },
    industry: { type: String, trim: true },
    jobCategory: {
      type: String,
      enum: ['internship', 'new_grad', 'entry_level', 'co_op', 'rotational'],
    },
    channels: {
      type: [String],
      enum: ['email', 'telegram', 'discord'],
      required: true,
    },
    isActive: { type: Boolean, default: true, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const Alert = model<IAlertDocument>('Alert', alertSchema);
