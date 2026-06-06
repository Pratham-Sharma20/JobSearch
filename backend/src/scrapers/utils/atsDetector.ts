import axios from 'axios';
import { scraperLogger } from './logger';

export enum ATSPlatform {
  GREENHOUSE = 'greenhouse',
  LEVER = 'lever',
  WORKDAY = 'workday',
  ICIMS = 'icims',
  SUCCESSFACTORS = 'successfactors',
  UNKNOWN = 'unknown'
}

export async function detectATS(url: string): Promise<ATSPlatform> {
  try {
    if (url.includes('boards.greenhouse.io')) return ATSPlatform.GREENHOUSE;
    if (url.includes('jobs.lever.co')) return ATSPlatform.LEVER;
    if (url.includes('myworkdayjobs.com')) return ATSPlatform.WORKDAY;
    if (url.includes('icims.com')) return ATSPlatform.ICIMS;
    if (url.includes('successfactors.com')) return ATSPlatform.SUCCESSFACTORS;

    // Fallback: Fetch the page and look for signatures
    const response = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = response.data.toLowerCase();

    if (html.includes('greenhouse.io')) return ATSPlatform.GREENHOUSE;
    if (html.includes('lever.co')) return ATSPlatform.LEVER;
    if (html.includes('myworkdayjobs')) return ATSPlatform.WORKDAY;
    if (html.includes('icims')) return ATSPlatform.ICIMS;
    if (html.includes('successfactors')) return ATSPlatform.SUCCESSFACTORS;

    return ATSPlatform.UNKNOWN;
  } catch (error: any) {
    scraperLogger.warn(`Failed to detect ATS for URL: ${url}`, error.message);
    return ATSPlatform.UNKNOWN;
  }
}
