import crypto from 'crypto';
import { AIClassificationResult } from '../services/ai/ai.types';

const CACHE_PREFIX = 'ai:class:';
const memoryCache = new Map<string, string>();

function hashJob(title: string, description: string): string {
  return crypto
    .createHash('sha256')
    .update(`${title}||${description}`)
    .digest('hex');
}

export class AiCache {
  static async getClassification(
    title: string,
    description: string
  ): Promise<AIClassificationResult | null> {
    try {
      const hash = hashJob(title, description);
      const cached = memoryCache.get(`${CACHE_PREFIX}${hash}`);

      if (cached) {
        return JSON.parse(cached) as AIClassificationResult;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static async setClassification(
    title: string,
    description: string,
    result: AIClassificationResult
  ): Promise<void> {
    try {
      const hash = hashJob(title, description);
      memoryCache.set(
        `${CACHE_PREFIX}${hash}`,
        JSON.stringify(result)
      );
    } catch (error) {
      // Ignore cache errors
    }
  }
}
