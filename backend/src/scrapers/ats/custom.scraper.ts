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
    const queries = ['Software Development Engineer', 'Software Engineer Intern'];
    
    try {
      for (const query of queries) {
        const response = await axios.get(`https://www.amazon.jobs/en/search.json?base_query=${encodeURIComponent(query)}&offset=0&result_limit=100&sort=recent&category[]=software-development`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        const data = response.data.jobs || [];
        for (const item of data) {
          jobs.push({
            jobId: item.id_icims || item.id,
            title: item.title,
            location: item.normalized_location || item.location,
            description: item.description_short || item.description,
            applyUrl: item.url_next_step ? (item.url_next_step.startsWith('http') ? item.url_next_step : `https://account.amazon.jobs${item.url_next_step}`) : `https://www.amazon.jobs${item.job_path}`,
            updated_at: item.posted_date || new Date().toISOString(),
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
      // Searching specifically for internships and software engineering roles
      await page.goto('https://www.metacareers.com/jobs/?q=software%20engineer', { waitUntil: 'networkidle', timeout: 60000 });

      // Wait for results to load
      await page.waitForSelector('a[href*="/v2/jobs/"]', { timeout: 15000 }).catch(() => {});

      const jobCards = await page.$$('a[href*="/v2/jobs/"]');
      for (const card of jobCards) {
        const titleEl = await card.$('div[role="heading"]');
        const title = titleEl ? await titleEl.innerText() : await card.innerText();
        const url = await card.getAttribute('href');
        
        // Find location - often in a sibling or parent div
        const location = 'Multiple Locations'; // Default

        if (title && url) {
          jobs.push({
            title: title.split('\n')[0],
            location: location,
            applyUrl: `https://www.metacareers.com${url}`,
            jobId: url.split('/').pop() || undefined
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
