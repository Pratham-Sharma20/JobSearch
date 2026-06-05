const axios = require('axios');

async function testApis() {
  // Amazon
  try {
    const amzn = await axios.get('https://www.amazon.jobs/en/search.json?offset=0&result_limit=10&sort=recent');
    console.log('Amazon Jobs:', amzn.data.jobs ? amzn.data.jobs.length : 0);
    console.log('Sample Amazon Job:', amzn.data.jobs[0].title, amzn.data.jobs[0].url_next_step);
  } catch (e) { console.log('Amazon error', e.message); }

  // Google
  try {
    const goog = await axios.get('https://careers.google.com/api/v3/search/?distance=50&q=Software%20Engineer');
    console.log('Google Jobs:', goog.data.jobs ? goog.data.jobs.length : 0);
  } catch (e) { console.log('Google error', e.message); }

}

testApis();
