import { Document, Types } from 'mongoose';

import { JobCategory } from './job.types';

export type AlertChannel = 'email' | 'telegram' | 'discord';

export interface IAlert {
  userId: Types.ObjectId;
  company?: string;
  department?: string;
  location?: string;
  industry?: string;
  jobCategory?: JobCategory;
  channels: AlertChannel[];
  isActive: boolean;
  createdAt: Date;
}

export interface IAlertDocument extends IAlert, Document {
  _id: Types.ObjectId;
}
