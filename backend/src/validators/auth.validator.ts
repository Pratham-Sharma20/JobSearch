import { z } from 'zod';

// Password pattern: min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':",./<>?|\\`~-]).{8,}$/;

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .trim(),

    email: z
      .string({ required_error: 'Email is required' })
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),

    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),

    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    credential: z
      .string({ required_error: 'Google credential is required' })
      .min(1, 'Google credential token cannot be empty'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .trim()
      .optional(),

    profileImage: z.string().url('Profile image must be a valid URL').or(z.literal('')).optional(),

    telegramChatId: z.string().trim().optional(),

    discordWebhookUrl: z
      .string()
      .url('Discord webhook must be a valid URL')
      .or(z.literal(''))
      .optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
