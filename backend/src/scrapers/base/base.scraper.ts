import { RawJob } from './scraper.types';

export abstract class BaseScraper {
  abstract scrape(company: any): Promise<RawJob[]>;
}
