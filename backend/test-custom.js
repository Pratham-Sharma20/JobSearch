const mongoose = require('mongoose');
const { CustomScraper } = require('./dist/scrapers/ats/custom.scraper');

async function testCustomScraper() {
  const scraper = new CustomScraper();
  
  const testCompanies = [
    { name: 'Amazon' },
    { name: 'Meta' },
    { name: 'Apple' },
    { name: 'Google' }
  ];

  for (const company of testCompanies) {
    console.log(`\nTesting ${company.name}...`);
    try {
      const jobs = await scraper.scrape(company);
      console.log(`Found ${jobs.length} jobs for ${company.name}.`);
      if (jobs.length > 0) {
        console.log(`Sample:`, jobs[0]);
      }
    } catch(e) {
      console.log(`Failed for ${company.name}:`, e.message);
    }
  }
}

testCustomScraper();
