import { Schema, model } from 'mongoose';

import { ICompanyDocument } from '@/types/company.types';

const companySchema = new Schema<ICompanyDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logoUrl: { type: String, required: true, trim: true },
    careerUrl: { type: String, required: true, trim: true },
    earlyCareerUrl: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true, index: true },
    atsPlatform: {
      type: String,
      enum: ['greenhouse', 'lever', 'workday', 'icims', 'successfactors', 'ashby', 'custom'],
      default: 'custom',
      required: true,
    },
    scrapeStrategy: {
      type: String,
      enum: ['api', 'playwright', 'static'],
      default: 'static',
      required: true,
    },
    activeJobCount: { type: Number, default: 0, required: true },
    lastScrapedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Company = model<ICompanyDocument>('Company', companySchema);
