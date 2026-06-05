import { z } from 'zod';

export const createAlertSchema = z.object({
  body: z.object({
    company: z.string().trim().optional(),
    department: z.string().trim().optional(),
    location: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    jobCategory: z
      .enum(['internship', 'new_grad', 'entry_level', 'co_op', 'rotational'])
      .optional(),
    channels: z
      .array(z.enum(['email', 'telegram', 'discord']))
      .min(1, 'At least one notification channel is required'),
    isActive: z.boolean().optional(),
  }),
});

export const updateAlertSchema = z.object({
  params: z.object({
    alertId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid alert ID format'),
  }),
  body: z.object({
    company: z.string().trim().optional(),
    department: z.string().trim().optional(),
    location: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    jobCategory: z
      .enum(['internship', 'new_grad', 'entry_level', 'co_op', 'rotational'])
      .optional()
      .nullable(),
    channels: z
      .array(z.enum(['email', 'telegram', 'discord']))
      .min(1, 'At least one notification channel is required')
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
