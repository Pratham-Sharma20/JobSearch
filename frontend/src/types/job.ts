export interface JobDocument {
  _id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string;
  industry: string;
  location: string;
  country: string;
  workModel: 'remote' | 'hybrid' | 'onsite';
  department: string;
  jobCategory: 'internship' | 'new_grad' | 'entry_level' | 'co_op' | 'rotational';
  internshipSeason?: 'summer' | 'fall' | 'spring' | 'year_round';
  applyUrl: string;
  descriptionSnippet: string;
  sourcePlatform: string;
  datePosted: string;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  jobs: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SavedJob {
  _id: string;
  userId: string;
  jobId: JobDocument;
  savedAt: string;
}

export interface SavedJobsResponse {
  success: boolean;
  savedJobs: SavedJob[];
}
