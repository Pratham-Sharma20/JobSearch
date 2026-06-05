import { Resend } from 'resend';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const emailService = {
  sendEmail: async (to: string, subject: string, html: string): Promise<void> => {
    if (!resend || !env.RESEND_FROM_EMAIL) {
      logger.warn(`Email not sent (missing Resend config). To: ${to}, Subject: ${subject}`);
      return;
    }

    try {
      const { error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }
      logger.info(`Email sent successfully to ${to}`);
    } catch (err: any) {
      logger.error(`Failed to send email to ${to}: ${err.message}`);
      throw err;
    }
  },
};
