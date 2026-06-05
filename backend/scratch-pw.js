const { chromium } = require('playwright');

async function testPlaywright() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Testing Meta...');
    await page.goto('https://www.metacareers.com/jobs', { waitUntil: 'networkidle', timeout: 30000 });
    const metaTitle = await page.title();
    console.log('Meta Title:', metaTitle);
  } catch(e) {
    console.error('Meta error', e.message);
  }

  try {
    console.log('Testing Apple...');
    await page.goto('https://jobs.apple.com/en-us/search', { waitUntil: 'networkidle', timeout: 30000 });
    const appleTitle = await page.title();
    console.log('Apple Title:', appleTitle);
  } catch(e) {
    console.error('Apple error', e.message);
  }

  await browser.close();
}

testPlaywright();
