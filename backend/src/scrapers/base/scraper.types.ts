export interface RawJob {
  title: string;
  location: string;
  description?: string;
  applyUrl: string;
  updated_at?: string;
  jobId?: string;
}

export interface NormalizedJob {
  jobId: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  applyUrl: string;
  datePosted?: Date;
}
