import { NormalizedJob, RawJob } from '../base/scraper.types';

export function normalizeJob(rawJob: RawJob, companyName: string): NormalizedJob {
  // Generate a fallback jobId if not provided
  const generatedId = rawJob.jobId || Buffer.from(`${companyName}-${rawJob.title}-${rawJob.location}`).toString('base64');
  
  return {
    jobId: generatedId,
    title: rawJob.title,
    description: rawJob.description || '',
    companyName,
    location: rawJob.location,
    applyUrl: rawJob.applyUrl,
    datePosted: rawJob.updated_at ? new Date(rawJob.updated_at) : new Date(),
  };
}
