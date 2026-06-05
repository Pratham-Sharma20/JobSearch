import { z } from 'zod';

export type Classification =
  | 'internship'
  | 'new_grad'
  | 'entry_level'
  | 'co_op'
  | 'rotational'
  | 'experienced';

export const classificationSchema = z.object({
  classification: z.enum([
    'internship',
    'new_grad',
    'entry_level',
    'co_op',
    'rotational',
    'experienced',
  ]),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1),
});

export type AIClassificationResult = z.infer<typeof classificationSchema>;
