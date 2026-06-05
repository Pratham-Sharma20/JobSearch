import { Schema, model } from 'mongoose';

import { ISavedJobDocument } from '@/types/job.types';

const savedJobSchema = new Schema<ISavedJobDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    savedAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index to prevent duplicate saves for the same user and job
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const SavedJob = model<ISavedJobDocument>('SavedJob', savedJobSchema);
