import { ScraperManager } from './src/scrapers/scraper.manager';
import { connectDB } from './src/database/connectDB';
import fs from 'fs';

(async () => {
  await connectDB();
  const manager = new ScraperManager();
  const companiesPath = './src/data/companies.json';
  const data = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
  const amazon = data.find((c: any) => c.name === 'Amazon');
  
  fs.writeFileSync(companiesPath, JSON.stringify([amazon]));
  try {
    await manager.run();
  } finally {
    fs.writeFileSync(companiesPath, JSON.stringify(data, null, 2));
  }
  
  console.log('Done running Amazon scrape!');
  process.exit(0);
})();
