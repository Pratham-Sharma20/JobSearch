import { Document, Types } from 'mongoose';

export type WorkModel = 'remote' | 'hybrid' | 'onsite';

export type JobCategory = 'internship' | 'new_grad' | 'entry_level' | 'co_op' | 'rotational';

export type InternshipSeason = 'summer' | 'fall' | 'spring' | 'year_round';

export type AIClassification =
  | 'internship'
  | 'new_grad'
  | 'entry_level'
  | 'co_op'
  | 'rotational'
  | 'experienced';

export interface IJob {
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyId: Types.ObjectId;
  companyLogoUrl: string;
  industry: string;
  location: string;
  country: string;
  workModel: WorkModel;
  department: string;
  jobCategory: JobCategory;
  internshipSeason?: InternshipSeason;
  applyUrl: string;
  description: string;
  descriptionSnippet: string;
  sourcePlatform: string;
  datePosted?: Date;
  requiresUSWorkAuth?: boolean;
  aiClassification: AIClassification;
  aiConfidence: number;
  classificationReason: string;
  isExpired: boolean;
  expiredAt?: Date;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobDocument extends IJob, Document {
  _id: Types.ObjectId;
}

export interface ISavedJob {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  savedAt: Date;
}

export interface ISavedJobDocument extends ISavedJob, Document {
  _id: Types.ObjectId;
}
