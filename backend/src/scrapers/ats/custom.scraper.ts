import { chromium } from 'playwright';
import axios from 'axios';
import { BaseScraper } from '../base/base.scraper';
import { RawJob } from '../base/scraper.types';
import { scraperLogger } from '../utils/logger';

export class CustomScraper extends BaseScraper {
  async scrape(company: any): Promise<RawJob[]> {
    scraperLogger.info(`Running custom scraper for ${company.name}...`);

    try {
      switch (company.name) {
        case 'Amazon':
          return await this.scrapeAmazon();
        case 'Meta':
          return await this.scrapeMeta();
        case 'Apple':
          return await this.scrapeApple();
        case 'Google':
          return await this.scrapeGoogle();
        case 'Microsoft':
          return await this.scrapeMicrosoft();
        default:
          scraperLogger.warn(`No custom scrape logic implemented for ${company.name}`);
          return [];
      }
    } catch (error: any) {
      scraperLogger.error(`Failed to scrape ${company.name}: ${error.message}`);
      return [];
    }
  }

  private async scrapeAmazon(): Promise<RawJob[]> {
    const jobs: RawJob[] = [];
    const queries = ['intern', 'new grad', 'entry level'];
    
    try {
      for (const query of queries) {
        const response = await axios.get(`https://www.amazon.jobs/en/search.json?base_query=${encodeURIComponent(query)}&offset=0&result_limit=50&sort=recent`);
        const data = response.data.jobs || [];
        for (const item of data) {
          jobs.push({
            jobId: item.id_icims || item.id,
            title: item.title,
            location: item.normalized_location || item.location,
            description: item.description_short,
            applyUrl: item.url_next_step ? (item.url_next_step.startsWith('http') ? item.url_next_step : `https://account.amazon.jobs${item.url_next_step}`) : `https://www.amazon.jobs${item.job_path}`,
            updated_at: new Date().toISOString(), // Amazon gives strings like "14 minutes", just use current time to avoid Invalid Date
          });
        }
      }
    } catch (e: any) {
      scraperLogger.error('Amazon API Error: ' + e.message);
    }
    return jobs;
  }

  private async scrapeMeta(): Promise<RawJob[]> {
    const jobs: RawJob[] = [];
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto('https://www.metacareers.com/jobs', { waitUntil: 'networkidle', timeout: 60000 });
      // Very basic extraction, relying on Meta's role list container
      const jobCards = await page.$$('a[href*="/v2/jobs/"]');
      for (const card of jobCards.slice(0, 20)) { // limit to top 20
        const titleEl = await card.$('div[role="heading"]');
        const title = titleEl ? await titleEl.innerText() : await card.innerText();
        const url = await card.getAttribute('href');
        
        if (title && url) {
          jobs.push({
            title: title.split('\n')[0], // Clean up newlines if location is inside
            location: 'Multiple Locations',
            applyUrl: `https://www.metacareers.com${url}`,
          });
        }
      }
    } finally {
      await browser.close();
    }
    return jobs;
  }

  private async scrapeApple(): Promise<RawJob[]> {
    const jobs: RawJob[] = [];
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto('https://jobs.apple.com/en-us/search', { waitUntil: 'networkidle', timeout: 60000 });
      
      const jobCards = await page.$$('a[id*="job-link"]');
      for (const card of jobCards.slice(0, 20)) {
        const title = await card.innerText();
        const url = await card.getAttribute('href');
        if (title && url) {
          jobs.push({
            title,
            location: 'Various',
            applyUrl: `https://jobs.apple.com${url}`,
          });
        }
      }
    } finally {
      await browser.close();
    }
    return jobs;
  }

  private async scrapeGoogle(): Promise<RawJob[]> {
    const jobs: RawJob[] = [];
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto('https://careers.google.com/jobs/results/', { waitUntil: 'networkidle', timeout: 60000 });
      
      // Wait for job list container
      await page.waitForSelector('a[data-gtm-ref="search-results"]', { timeout: 10000 }).catch(() => {});
      const jobCards = await page.$$('a[data-gtm-ref="search-results"]');
      
      for (const card of jobCards.slice(0, 20)) {
        const titleEl = await card.$('h3');
        const title = titleEl ? await titleEl.innerText() : 'Google Role';
        const url = await card.getAttribute('href');
        
        if (url) {
          jobs.push({
            title,
            location: 'Multiple Locations',
            applyUrl: `https://careers.google.com${url}`,
          });
        }
      }
    } finally {
      await browser.close();
    }
    return jobs;
  }

  private async scrapeMicrosoft(): Promise<RawJob[]> {
    const jobs: RawJob[] = [];
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto('https://jobs.careers.microsoft.com/global/en/search', { waitUntil: 'networkidle', timeout: 60000 });
      
      const jobCards = await page.$$('a[href*="/job/"]');
      for (const card of jobCards.slice(0, 20)) {
        const titleEl = await card.$('h2');
        const title = titleEl ? await titleEl.innerText() : await card.innerText();
        const url = await card.getAttribute('href');
        
        if (title && url) {
          jobs.push({
            title: title.split('\n')[0],
            location: 'Multiple Locations',
            applyUrl: url.startsWith('http') ? url : `https://jobs.careers.microsoft.com${url}`,
          });
        }
      }
    } finally {
      await browser.close();
    }
    return jobs;
  }
}
