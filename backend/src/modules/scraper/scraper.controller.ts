import { Request, Response } from 'express';
import { ScraperManager } from '../../scrapers/scraper.manager';

export const triggerScrape = async (req: Request, res: Response) => {
  try {
    const manager = new ScraperManager();
    const wait = req.query.wait === 'true';

    if (wait) {
      const result = await manager.run();
      return res.status(200).json({
        success: true,
        message: 'Scrape completed successfully.',
        result
      });
    }

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
