import { ScraperManager } from './scrapers/scraper.manager';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function runCliScraper() {
  console.log('--- Job Scraper CLI ---');

  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const manager = new ScraperManager();
    const result = await manager.run();

    console.log('Scrape completed successfully!');
    console.log(`Companies attempted: ${result.companiesAttempted}`);
    console.log(`Companies succeeded: ${result.companiesSucceeded}`);
    console.log(`Jobs scraped: ${result.jobsScraped}`);
    console.log(`Jobs accepted: ${result.jobsAccepted}`);
    console.log(`Jobs rejected: ${result.jobsRejected}`);

    if (result.errors.length > 0) {
      console.log('\nErrors encountered:');
      result.errors.forEach((err: any) => {
        console.log(`- ${err.company}: ${err.error}`);
      });
    }

  } catch (error) {
    console.error('Fatal error during scrape:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

runCliScraper();
