import { Request, Response } from 'express';
import { ScraperManager } from '../../scrapers/scraper.manager';

export const triggerScrape = async (_req: Request, res: Response) => {
  try {
    const manager = new ScraperManager();
    // Run asynchronously to avoid blocking request, or wait for it.
    // For this implementation, we will start it and return success immediately, 
    // or we can await it if it's not too long. Since 20 companies could take a few mins,
    // we should run it in the background.
    
    manager.run().catch(err => console.error('Background scrape failed', err));

    res.status(202).json({
      success: true,
      message: 'Scrape run triggered successfully. It will run in the background.'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to trigger scrape run',
      error: error.message
    });
  }
};
