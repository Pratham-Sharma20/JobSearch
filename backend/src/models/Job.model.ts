import { Schema, model } from 'mongoose';

import { IJobDocument } from '@/types/job.types';

const jobSchema = new Schema<IJobDocument>(
  {
    jobId: { type: String, required: true, trim: true, index: true },
    jobTitle: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    companyLogoUrl: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true, index: true },
    country: { type: String, required: true, trim: true },
    workModel: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      required: true,
      index: true,
    },
    department: { type: String, required: true, trim: true },
    jobCategory: {
      type: String,
      enum: ['internship', 'new_grad', 'entry_level', 'co_op', 'rotational'],
      required: true,
      index: true,
    },
    internshipSeason: {
      type: String,
      enum: ['summer', 'fall', 'spring', 'year_round'],
    },
    applyUrl: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    descriptionSnippet: { type: String, required: true, trim: true },
    sourcePlatform: { type: String, required: true, trim: true },
    datePosted: { type: Date, index: true },
    requiresUSWorkAuth: { type: Boolean, default: false },
    aiClassification: {
      type: String,
      enum: ['internship', 'new_grad', 'entry_level', 'co_op', 'rotational', 'experienced'],
      required: true,
    },
    aiConfidence: { type: Number, required: true, min: 0, max: 1 },
    classificationReason: { type: String, required: true, trim: true },
    isExpired: { type: Boolean, default: false, required: true, index: true },
    expiredAt: { type: Date },
    lastSeen: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: jobId + companyName
jobSchema.index({ jobId: 1, companyName: 1 }, { unique: true });

export const Job = model<IJobDocument>('Job', jobSchema);
