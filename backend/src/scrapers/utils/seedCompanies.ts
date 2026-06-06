import fs from 'fs';
import path from 'path';
import axios from 'axios';

const COMPANIES_TO_ADD = [
  { "name": "Google", "domain": "google.com", "careerUrl": "https://careers.google.com/jobs/results/", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "Meta", "domain": "meta.com", "careerUrl": "https://www.metacareers.com/jobs", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "Apple", "domain": "apple.com", "careerUrl": "https://jobs.apple.com/en-us/search", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "Microsoft", "domain": "microsoft.com", "careerUrl": "https://jobs.careers.microsoft.com/global/en/search", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "Netflix", "domain": "netflix.com", "careerUrl": "https://jobs.netflix.com/search", "industry": "Entertainment", "atsPlatform": "custom" },
  { "name": "Airbnb", "domain": "airbnb.com", "careerUrl": "https://careers.airbnb.com/positions", "industry": "Technology", "atsPlatform": "greenhouse" },
  { "name": "Uber", "domain": "uber.com", "careerUrl": "https://www.uber.com/careers/list", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "Lyft", "domain": "lyft.com", "careerUrl": "https://www.lyft.com/careers", "industry": "Technology", "atsPlatform": "lever" },
  { "name": "DoorDash", "domain": "doordash.com", "careerUrl": "https://careers.doordash.com/", "industry": "Technology", "atsPlatform": "greenhouse" },
  { "name": "Stripe", "domain": "stripe.com", "careerUrl": "https://stripe.com/jobs/search", "industry": "Fintech", "atsPlatform": "custom" },
  { "name": "Palantir", "domain": "palantir.com", "careerUrl": "https://www.palantir.com/careers/", "industry": "Technology", "atsPlatform": "lever" },
  { "name": "Snowflake", "domain": "snowflake.com", "careerUrl": "https://www.snowflake.com/en/company/careers/", "industry": "Technology", "atsPlatform": "workday" },
  { "name": "Databricks", "domain": "databricks.com", "careerUrl": "https://www.databricks.com/company/careers", "industry": "Technology", "atsPlatform": "greenhouse" },
  { "name": "Salesforce", "domain": "salesforce.com", "careerUrl": "https://careers.salesforce.com/en/", "industry": "Technology", "atsPlatform": "workday" },
  { "name": "Adobe", "domain": "adobe.com", "careerUrl": "https://www.adobe.com/careers.html", "industry": "Technology", "atsPlatform": "workday" },
  { "name": "LinkedIn", "domain": "linkedin.com", "careerUrl": "https://www.linkedin.com/company/linkedin/jobs/", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "Twitter", "domain": "twitter.com", "careerUrl": "https://careers.twitter.com/", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "Pinterest", "domain": "pinterest.com", "careerUrl": "https://www.pinterestcareers.com/", "industry": "Technology", "atsPlatform": "lever" },
  { "name": "Snap", "domain": "snap.com", "careerUrl": "https://www.snap.com/en-US/jobs", "industry": "Technology", "atsPlatform": "workday" },
  { "name": "NVIDIA", "domain": "nvidia.com", "careerUrl": "https://www.nvidia.com/en-us/about-nvidia/careers/", "industry": "Technology", "atsPlatform": "workday" },
  { "name": "Intel", "domain": "intel.com", "careerUrl": "https://jobs.intel.com/", "industry": "Technology", "atsPlatform": "workday" },
  { "name": "AMD", "domain": "amd.com", "careerUrl": "https://careers.amd.com/", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "Qualcomm", "domain": "qualcomm.com", "careerUrl": "https://www.qualcomm.com/company/careers", "industry": "Technology", "atsPlatform": "workday" },
  { "name": "Tesla", "domain": "tesla.com", "careerUrl": "https://www.tesla.com/careers/search", "industry": "Automotive", "atsPlatform": "custom" },
  { "name": "Oracle", "domain": "oracle.com", "careerUrl": "https://eeho.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/requisitions", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "Cisco", "domain": "cisco.com", "careerUrl": "https://jobs.cisco.com/", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "IBM", "domain": "ibm.com", "careerUrl": "https://www.ibm.com/careers", "industry": "Technology", "atsPlatform": "custom" },
  { "name": "ServiceNow", "domain": "servicenow.com", "careerUrl": "https://www.servicenow.com/company/careers.html", "industry": "Technology", "atsPlatform": "workday" },
  { "name": "Workday", "domain": "workday.com", "careerUrl": "https://www.workday.com/en-us/company/about-workday/careers.html", "industry": "Technology", "atsPlatform": "workday" },
  { "name": "Splunk", "domain": "splunk.com", "careerUrl": "https://www.splunk.com/en_us/about-us/careers.html", "industry": "Technology", "atsPlatform": "workday" }
];

async function seed() {
  const companiesPath = path.join(__dirname, '../../data/companies.json');
  let currentCompanies = [];

  if (fs.existsSync(companiesPath)) {
    currentCompanies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
  }

  const existingDomains = new Set(currentCompanies.map((c: any) => c.domain));

  for (const company of COMPANIES_TO_ADD) {
    if (!existingDomains.has(company.domain)) {
      currentCompanies.push({
        ...company,
        logoUrl: `https://logo.clearbit.com/${company.domain}`,
        scrapeStrategy: 'api'
      });
      console.log(`Added ${company.name}`);
    }
  }

  fs.writeFileSync(companiesPath, JSON.stringify(currentCompanies, null, 2));
  console.log('Seeding completed. Total companies:', currentCompanies.length);
}

seed();
