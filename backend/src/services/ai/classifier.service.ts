import { GoogleGenAI } from '@google/genai';

import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { AiCache } from '@/utils/aiCache';

import {
  AIClassificationResult,
  classificationSchema,
  Classification,
} from './ai.types';
import { buildClassificationPrompt } from './prompt.builder';

export class ClassifierService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY || '' });
  }

  /**
   * Simple fallback matching logic if the LLM fails.
   */
  private fallbackClassification(title: string): Classification {
    const t = title.toLowerCase();
    if (t.includes('intern') || t.includes('internship')) return 'internship';
    if (t.includes('new grad') || t.includes('university grad'))
      return 'new_grad';
    if (t.includes('co-op') || t.includes('coop')) return 'co_op';
    if (t.includes('rotation')) return 'rotational';
    if (t.includes('entry') || t.includes('junior')) return 'entry_level';
    return 'experienced';
  }

  public async classifyJob(
    title: string,
    description: string
  ): Promise<AIClassificationResult> {
    // 1. Check Cache
    const cached = await AiCache.getClassification(title, description);
    if (cached) {
      return cached;
    }

    try {
      if (!env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      // 2. Build Prompt
      const prompt = buildClassificationPrompt(title, description);

      // 3. Call LLM
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Low temp for deterministic classification
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      // 4. Parse & Validate
      const jsonText = text.replace(/```(?:json)?\n?|\n?```/g, '').trim();
      const parsedJson = JSON.parse(jsonText);
      const validated = classificationSchema.parse(parsedJson);

      // 5. Update Cache
      await AiCache.setClassification(title, description, validated);

      return validated;
    } catch (error: any) {
      logger.error('Failed to classify job with AI:', error.message);

      // Fallback Strategy
      const fallbackClass = this.fallbackClassification(title);
      return {
        classification: fallbackClass,
        confidence: 0.5,
        reason: 'Fallback keyword classification used due to AI failure.',
      };
    }
  }
}

export const classifierService = new ClassifierService();
