import { chromium } from 'playwright';
import { BaseScraper } from '../base/base.scraper';
import { RawJob } from '../base/scraper.types';
import { scraperLogger } from '../utils/logger';

export class WorkdayScraper extends BaseScraper {
  async scrape(company: any): Promise<RawJob[]> {
    const url = company.earlyCareerUrl || company.careerUrl;
    if (!url) return [];

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const jobs: RawJob[] = [];

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Attempt to wait for job listings. Workday usually has a <ul> with job list or similar cards.
      // This selector is a generic fallback that often matches Workday lists.
      try {
        await page.waitForSelector('[data-automation-id="jobResults"] li', { timeout: 10000 });
      } catch (e) {
        scraperLogger.warn(`Timeout waiting for Workday job results on ${company.name}`);
        // Return empty if we can't find jobs
        return [];
      }

      const jobCards = await page.$$('[data-automation-id="jobResults"] li');

      for (const card of jobCards) {
        const titleElement = await card.$('h3 a');
        if (!titleElement) continue;

        const title = await titleElement.innerText();
        const applyUrlPath = await titleElement.getAttribute('href');
        const applyUrl = applyUrlPath ? new URL(applyUrlPath, url).toString() : url;

        const locationElement = await card.$('[data-automation-id="locations"]');
        const location = locationElement ? await locationElement.innerText() : 'Unknown';

        const jobIdElement = await card.$('[data-automation-id="jobResultsJobId"]');
        const jobId = jobIdElement ? await jobIdElement.innerText() : Buffer.from(title + location).toString('base64');

        jobs.push({
          jobId,
          title: title.trim(),
          location: location.trim(),
          applyUrl,
          description: '', // Usually not present in the list view
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      scraperLogger.error(`Error scraping Workday for ${company.name}`, error);
      throw error;
    } finally {
      await context.close();
      await browser.close();
    }

    return jobs;
  }
}
