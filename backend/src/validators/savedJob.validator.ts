import { z } from 'zod';

export const saveJobSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID format'),
  }),
});

export type SaveJobInput = z.infer<typeof saveJobSchema>;
