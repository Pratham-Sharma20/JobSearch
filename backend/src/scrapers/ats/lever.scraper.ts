import axios from 'axios';
import { BaseScraper } from '../base/base.scraper';
import { RawJob } from '../base/scraper.types';

export class LeverScraper extends BaseScraper {
  async scrape(company: any): Promise<RawJob[]> {
    const boardToken = company.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const url = `https://api.lever.co/v0/postings/${boardToken}?mode=json`;

    try {
      const response = await axios.get(url);
      const jobs = response.data || [];

      return jobs.map((job: any) => ({
        jobId: job.id,
        title: job.text,
        location: job.categories?.location || 'Unknown',
        description: job.descriptionPlain || job.description || '',
        applyUrl: job.applyUrl || job.hostedUrl,
        updated_at: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
      }));
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.warn(`[WARN] Lever API returned 404 for board token: ${boardToken}`);
        return [];
      }
      throw error;
    }
  }
}
