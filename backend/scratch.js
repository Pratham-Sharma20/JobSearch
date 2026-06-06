const fs = require('fs');
const files = [
  'src/modules/saved-jobs/savedJobs.test.ts',
  'src/modules/notifications/notification.test.ts',
  'src/modules/jobs/jobs.test.ts',
  'src/modules/companies/companies.test.ts',
  'src/modules/auth/auth.test.ts',
  'src/modules/alerts/alerts.test.ts'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');
  content = content.replace(/vi\.mock\('bullmq'[\s\S]*?\)\);\r?\n/g, '');
  content = content.replace(/vi\.mock\('ioredis'[\s\S]*?\)\);\r?\n/g, '');
  content = content.replace(/\/\/ Mocks to prevent Redis\/BullMQ\/Typesense from trying to connect\r?\n/g, '// Mocks to prevent Typesense from trying to connect\n');
  fs.writeFileSync(f, content);
});
