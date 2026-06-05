import crypto from 'crypto';

import { getRedisClient } from '@/config/redis';

import { AIClassificationResult } from '../services/ai/ai.types';

const CACHE_PREFIX = 'ai:class:';
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days

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
      const redis = getRedisClient();
      const hash = hashJob(title, description);
      const cached = await redis.get(`${CACHE_PREFIX}${hash}`);

      if (cached) {
        return JSON.parse(cached) as AIClassificationResult;
      }
      return null;
    } catch (error) {
      // Ignore cache errors, fallback to generating
      return null;
    }
  }

  static async setClassification(
    title: string,
    description: string,
    result: AIClassificationResult
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      const hash = hashJob(title, description);
      await redis.setex(
        `${CACHE_PREFIX}${hash}`,
        CACHE_TTL,
        JSON.stringify(result)
      );
    } catch (error) {
      // Ignore cache errors
    }
  }
}
