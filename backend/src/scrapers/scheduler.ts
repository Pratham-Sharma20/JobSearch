import cron from 'node-cron';
import { ScraperManager } from './scraper.manager';
import { scraperLogger } from './utils/logger';

export function initializeScheduler() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    scraperLogger.info('Starting scheduled scraper run...');
    const manager = new ScraperManager();
    try {
      await manager.run();
    } catch (error) {
      scraperLogger.error('Scheduled scraper run failed', error);
    }
  });

  scraperLogger.info('Scraper scheduler initialized.');
}
