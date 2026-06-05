import axios from 'axios';
import { BaseScraper } from '../base/base.scraper';
import { RawJob } from '../base/scraper.types';

export class GreenhouseScraper extends BaseScraper {
  async scrape(company: any): Promise<RawJob[]> {
    const boardToken = company.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;

    try {
      const response = await axios.get(url);
      const jobs = response.data.jobs || [];

      return jobs.map((job: any) => ({
        jobId: job.id.toString(),
        title: job.title,
        location: job.location?.name || 'Unknown',
        description: job.content || '',
        applyUrl: job.absolute_url,
        updated_at: job.updated_at,
      }));
    } catch (error: any) {
      // Return empty array if board not found or other errors
      if (error.response && error.response.status === 404) {
        console.warn(`[WARN] Greenhouse API returned 404 for board token: ${boardToken}`);
        return [];
      }
      throw error;
    }
  }
}
