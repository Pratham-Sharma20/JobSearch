import { z } from 'zod';

export const searchJobsSchema = z.object({
  query: z.object({
    keyword: z.string().trim().optional(),
    company: z.string().trim().optional(),
    location: z.string().trim().optional(),
    workModel: z
      .union([
        z.enum(['remote', 'hybrid', 'onsite']),
        z
          .string()
          .transform((val) => val.split(','))
          .pipe(z.array(z.enum(['remote', 'hybrid', 'onsite']))),
      ])
      .optional(),
    jobCategory: z
      .union([
        z.enum(['internship', 'new_grad', 'entry_level', 'co_op', 'rotational']),
        z
          .string()
          .transform((val) => val.split(','))
          .pipe(z.array(z.enum(['internship', 'new_grad', 'entry_level', 'co_op', 'rotational']))),
      ])
      .optional(),
    internshipSeason: z
      .union([
        z.enum(['summer', 'fall', 'spring', 'year_round']),
        z
          .string()
          .transform((val) => val.split(','))
          .pipe(z.array(z.enum(['summer', 'fall', 'spring', 'year_round']))),
      ])
      .optional(),
    department: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    dateRange: z.enum(['today', 'week', 'month']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export type SearchJobsInput = z.infer<typeof searchJobsSchema>;
