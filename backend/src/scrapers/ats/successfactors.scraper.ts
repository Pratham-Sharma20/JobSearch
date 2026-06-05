import { chromium } from 'playwright';
import { BaseScraper } from '../base/base.scraper';
import { RawJob } from '../base/scraper.types';
import { scraperLogger } from '../utils/logger';

export class SuccessFactorsScraper extends BaseScraper {
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
      
      try {
        await page.waitForSelector('.jobSearchResults tr.jobResultItem', { timeout: 10000 });
      } catch (e) {
        scraperLogger.warn(`Timeout waiting for SuccessFactors job results on ${company.name}`);
        return [];
      }

      const jobRows = await page.$$('.jobSearchResults tr.jobResultItem');

      for (const row of jobRows) {
        const titleElement = await row.$('.jobTitle a');
        if (!titleElement) continue;

        const title = await titleElement.innerText();
        const applyUrlPath = await titleElement.getAttribute('href');
        const applyUrl = applyUrlPath ? new URL(applyUrlPath, url).toString() : url;

        const locationElement = await row.$('.jobLocation');
        const location = locationElement ? await locationElement.innerText() : 'Unknown';

        const jobId = Buffer.from(title + location).toString('base64');

        jobs.push({
          jobId,
          title: title.trim(),
          location: location.trim(),
          applyUrl,
          description: '',
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      scraperLogger.error(`Error scraping SuccessFactors for ${company.name}`, error);
      throw error;
    } finally {
      await context.close();
      await browser.close();
    }

    return jobs;
  }
}
