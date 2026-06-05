import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { classifierService } from '../classifier.service';
import { AiCache } from '@/utils/aiCache';
import { env } from '@/config/env';
import { GoogleGenAI } from '@google/genai';

vi.mock('@google/genai', () => {
  const mockGenerateContent = vi.fn();
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
    },
  };
});

vi.mock('@/utils/aiCache', () => ({
  AiCache: {
    getClassification: vi.fn(),
    setClassification: vi.fn(),
  },
}));

vi.mock('@/config/env', () => ({
  env: {
    GEMINI_API_KEY: 'test-api-key',
  },
}));

describe('ClassifierService', () => {
  let mockGenAIInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenAIInstance = new GoogleGenAI({ apiKey: 'test' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return cached result if available', async () => {
    const cachedResult = {
      classification: 'internship',
      confidence: 0.9,
      reason: 'It is a summer internship',
    };
    vi.mocked(AiCache.getClassification).mockResolvedValue(cachedResult as any);

    const result = await classifierService.classifyJob(
      'Software Engineer Intern',
      'Summer 2024 intern program.'
    );

    expect(result).toEqual(cachedResult);
    expect(mockGenAIInstance.models.generateContent).not.toHaveBeenCalled();
  });

  it('should call Gemini API and parse correctly when not in cache', async () => {
    vi.mocked(AiCache.getClassification).mockResolvedValue(null);

    const mockResponse = {
      text: JSON.stringify({
        classification: 'entry_level',
        confidence: 0.85,
        reason: 'Mentions 0-1 years of experience',
      }),
    };

    // Override the mock implementation for this test to return the mock response.
    // The singleton was initialized before the mock was updated.
    // We can directly mock the generateContent on the service's AI instance.
    (classifierService as any).ai.models.generateContent = vi
      .fn()
      .mockResolvedValue(mockResponse);

    const result = await classifierService.classifyJob(
      'Junior Developer',
      'Requires 0-1 years of experience.'
    );

    expect(result).toEqual({
      classification: 'entry_level',
      confidence: 0.85,
      reason: 'Mentions 0-1 years of experience',
    });

    expect(
      (classifierService as any).ai.models.generateContent
    ).toHaveBeenCalled();
    expect(AiCache.setClassification).toHaveBeenCalledWith(
      'Junior Developer',
      'Requires 0-1 years of experience.',
      result
    );
  });

  it('should fallback to keyword classification if Gemini API fails', async () => {
    vi.mocked(AiCache.getClassification).mockResolvedValue(null);

    (classifierService as any).ai.models.generateContent = vi
      .fn()
      .mockRejectedValue(new Error('API Error'));

    const result = await classifierService.classifyJob(
      'Software Engineer Intern',
      'Summer 2024 intern program.'
    );

    expect(result).toEqual({
      classification: 'internship',
      confidence: 0.5,
      reason: 'Fallback keyword classification used due to AI failure.',
    });
  });

  it('should fallback if JSON is invalid', async () => {
    vi.mocked(AiCache.getClassification).mockResolvedValue(null);

    (classifierService as any).ai.models.generateContent = vi
      .fn()
      .mockResolvedValue({ text: 'invalid json' });

    const result = await classifierService.classifyJob(
      'New Grad SWE',
      'Starts August 2024'
    );

    expect(result).toEqual({
      classification: 'new_grad',
      confidence: 0.5,
      reason: 'Fallback keyword classification used due to AI failure.',
    });
  });
});
