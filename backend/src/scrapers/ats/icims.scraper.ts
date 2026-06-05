import { chromium } from 'playwright';
import { BaseScraper } from '../base/base.scraper';
import { RawJob } from '../base/scraper.types';
import { scraperLogger } from '../utils/logger';

export class IcimsScraper extends BaseScraper {
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
      
      // iCIMS often loads the job portal in an iframe with id "icims_content_iframe"
      const iframeElement = await page.$('iframe#icims_content_iframe');
      let frame = page.mainFrame();

      if (iframeElement) {
        frame = await iframeElement.contentFrame() || frame;
      }

      try {
        await frame.waitForSelector('.iCIMS_JobsTable .row', { timeout: 10000 });
      } catch (e) {
        scraperLogger.warn(`Timeout waiting for iCIMS job results on ${company.name}`);
        return [];
      }

      const jobRows = await frame.$$('.iCIMS_JobsTable .row');

      for (const row of jobRows) {
        const titleElement = await row.$('.title a');
        if (!titleElement) continue;

        const title = await titleElement.innerText();
        const applyUrlPath = await titleElement.getAttribute('href');
        const applyUrl = applyUrlPath ? new URL(applyUrlPath, url).toString() : url;

        // Try to get location, usually in a span next to title or another column
        const descElement = await row.$('.description, .additionalFields');
        const locationText = descElement ? await descElement.innerText() : 'Unknown';

        const jobId = Buffer.from(title + locationText).toString('base64');

        jobs.push({
          jobId,
          title: title.trim(),
          location: locationText.trim(),
          applyUrl,
          description: '',
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      scraperLogger.error(`Error scraping iCIMS for ${company.name}`, error);
      throw error;
    } finally {
      await context.close();
      await browser.close();
    }

    return jobs;
  }
}
