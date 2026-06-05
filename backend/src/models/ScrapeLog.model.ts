import { Schema, model } from 'mongoose';

import { IScrapeLogDocument } from '@/types/company.types';

const scrapeErrorSchema = new Schema(
  {
    company: { type: String, required: true, trim: true },
    error: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const scrapeLogSchema = new Schema<IScrapeLogDocument>(
  {
    runId: { type: String, required: true, unique: true, index: true },
    startedAt: { type: Date, required: true, index: true },
    finishedAt: { type: Date },
    companiesAttempted: { type: Number, default: 0, required: true },
    companiesSucceeded: { type: Number, default: 0, required: true },
    jobsScraped: { type: Number, default: 0, required: true },
    jobsAccepted: { type: Number, default: 0, required: true },
    jobsRejected: { type: Number, default: 0, required: true },
    errors: [scrapeErrorSchema],
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

export const ScrapeLog = model<IScrapeLogDocument>('ScrapeLog', scrapeLogSchema);
