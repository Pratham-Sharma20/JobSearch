import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Job } from '../models/Job.model';
import { ScrapeLog } from '../models/ScrapeLog.model';
import { Company } from '../models/Company.model';
import { GreenhouseScraper } from './ats/greenhouse.scraper';
import { LeverScraper } from './ats/lever.scraper';
import { WorkdayScraper } from './ats/workday.scraper';
import { IcimsScraper } from './ats/icims.scraper';
import { SuccessFactorsScraper } from './ats/successfactors.scraper';
import { CustomScraper } from './ats/custom.scraper';
import { isEarlyCareer } from './filters/relevance.filter';
import { normalizeJob } from './utils/normalizeJob';
import { withRetry } from './utils/retry';
import { scraperLogger } from './utils/logger';
import { RawJob } from './base/scraper.types';
import { addJobToClassificationQueue } from '../queues/classification.queue';

const CONCURRENCY_LIMIT = 3;

function randomDelay(min: number, max: number) {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));
}

export class ScraperManager {
  private scrapers: Record<string, any>;

  constructor() {
    this.scrapers = {
      greenhouse: new GreenhouseScraper(),
      lever: new LeverScraper(),
      workday: new WorkdayScraper(),
      icims: new IcimsScraper(),
      successfactors: new SuccessFactorsScraper(),
      custom: new CustomScraper(),
    };
  }

  async run() {
    const runId = crypto.randomUUID();
    scraperLogger.info(`Starting scrape run: ${runId}`);

    const scrapeLog = await ScrapeLog.create({
      runId,
      startedAt: new Date(),
      companiesAttempted: 0,
      companiesSucceeded: 0,
      jobsScraped: 0,
      jobsAccepted: 0,
      jobsRejected: 0,
      errors: [],
    });

    const companiesPath = path.join(__dirname, '../data/companies.json');
    const companiesData = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));

    const activeJobIdsThisRun: Set<string> = new Set();
    const errors: { company: string; error: string }[] = [];
    let jobsScraped = 0;
    let jobsAccepted = 0;
    let jobsRejected = 0;
    let companiesSucceeded = 0;

    // Process in chunks
    for (let i = 0; i < companiesData.length; i += CONCURRENCY_LIMIT) {
      const chunk = companiesData.slice(i, i + CONCURRENCY_LIMIT);
      
      await Promise.all(chunk.map(async (companyData: any) => {
        try {
          await randomDelay(2000, 5000);
          
          let companyDoc = await Company.findOne({ domain: companyData.domain });
          if (!companyDoc) {
            companyDoc = await Company.create({
              name: companyData.name,
              domain: companyData.domain,
              logoUrl: companyData.logoUrl,
              careerUrl: companyData.careerUrl,
              earlyCareerUrl: companyData.earlyCareerUrl,
              industry: companyData.industry,
              atsPlatform: companyData.atsPlatform,
              scrapeStrategy: companyData.scrapeStrategy,
            });
          }

          const scraper = this.scrapers[companyData.atsPlatform];
          if (!scraper) {
            scraperLogger.warn(`No scraper found for ${companyData.atsPlatform} (Company: ${companyData.name})`);
            return;
          }

          const rawJobs = await withRetry<RawJob[]>(() => scraper.scrape(companyData));
          scraperLogger.debug(`[DEBUG] Scraped ${rawJobs.length} raw jobs from ${companyData.name}`);
          jobsScraped += rawJobs.length;

          for (const rawJob of rawJobs) {
            const normalized = normalizeJob(rawJob, companyData.name);
            
            if (isEarlyCareer(normalized.title)) {
              scraperLogger.debug(`[DEBUG] Accepted early-career job: ${normalized.title} at ${companyData.name}`);
              jobsAccepted++;
              
              const compoundId = `${normalized.jobId}-${companyData.name}`;
              activeJobIdsThisRun.add(compoundId);

              // Update or Insert
              const updateResult = await Job.updateOne(
                { jobId: normalized.jobId, companyName: companyData.name },
                {
                  $set: {
                    jobTitle: normalized.title,
                    companyId: companyDoc._id,
                    companyLogoUrl: companyData.logoUrl,
                    industry: companyData.industry,
                    location: normalized.location,
                    country: 'US', // default placeholder
                    workModel: 'onsite', // default placeholder
                    department: 'Engineering', // default placeholder
                    jobCategory: 'entry_level', // default placeholder
                    applyUrl: normalized.applyUrl,
                    description: normalized.description || 'No description provided.',
                    descriptionSnippet: normalized.description ? normalized.description.substring(0, 150) : 'No description provided.',
                    sourcePlatform: companyData.atsPlatform,
                    datePosted: normalized.datePosted,
                    lastSeen: new Date(),
                  },
                  $setOnInsert: {
                    aiClassification: 'entry_level', // default placeholder
                    aiConfidence: 0.5, // default placeholder
                    classificationReason: 'Pending AI Classification', // default placeholder
                    isExpired: false,
                  }
                },
                { upsert: true, runValidators: true }
              );

              // Add to AI Classification Queue only if it's a newly inserted job
              if (updateResult.upsertedCount > 0) {
                await addJobToClassificationQueue({
                  jobId: normalized.jobId,
                  companyName: companyData.name,
                });
              }
            } else {
              jobsRejected++;
            }
          }

          companyDoc.activeJobCount = jobsAccepted;
          companyDoc.lastScrapedAt = new Date();
          await companyDoc.save();

          companiesSucceeded++;
          scraperLogger.success(`Successfully scraped ${companyData.name}`);
        } catch (error: any) {
          errors.push({ company: companyData.name, error: error.message || String(error) });
          scraperLogger.error(`Failed to scrape ${companyData.name}`, error.message);
        }
      }));
    }

    // Mark missing jobs as expired
    if (companiesSucceeded > 0) {
      await Job.updateMany(
        { 
          companyName: { $in: companiesData.map((c: any) => c.name) },
          lastSeen: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 12) }, // Older than 12 hours
          isExpired: false
        },
        { 
          $set: { isExpired: true, expiredAt: new Date() } 
        }
      );
    }

    scrapeLog.finishedAt = new Date();
    scrapeLog.companiesAttempted = companiesData.length;
    scrapeLog.companiesSucceeded = companiesSucceeded;
    scrapeLog.jobsScraped = jobsScraped;
    scrapeLog.jobsAccepted = jobsAccepted;
    scrapeLog.jobsRejected = jobsRejected;
    scrapeLog.errors = errors as any;
    await scrapeLog.save();

    scraperLogger.info(`Finished scrape run: ${runId}`);
    return scrapeLog;
  }
}
