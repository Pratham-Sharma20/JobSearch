import { Document, Types } from 'mongoose';

export type ATSPlatform =
  | 'greenhouse'
  | 'lever'
  | 'workday'
  | 'icims'
  | 'successfactors'
  | 'ashby'
  | 'custom';

export type ScrapeStrategy = 'api' | 'playwright' | 'static';

export interface ICompany {
  name: string;
  domain: string;
  logoUrl: string;
  careerUrl: string;
  earlyCareerUrl: string;
  industry: string;
  atsPlatform: ATSPlatform;
  scrapeStrategy: ScrapeStrategy;
  activeJobCount: number;
  lastScrapedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyDocument extends ICompany, Document {
  _id: Types.ObjectId;
}

export interface IScrapeError {
  company: string;
  error: string;
}

export interface IScrapeLog {
  runId: string;
  startedAt: Date;
  finishedAt?: Date;
  companiesAttempted: number;
  companiesSucceeded: number;
  jobsScraped: number;
  jobsAccepted: number;
  jobsRejected: number;
  errors: IScrapeError[];
}

export interface IScrapeLogDocument extends Omit<Document, 'errors'>, IScrapeLog {
  _id: Types.ObjectId;
}
