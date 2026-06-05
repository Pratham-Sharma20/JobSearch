import { logger } from '@/utils/logger';

export const discordService = {
  sendWebhook: async (webhookUrl: string, content: string, embeds?: any[]): Promise<void> => {
    if (!webhookUrl) {
      logger.warn(`Discord webhook not sent (missing URL).`);
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          embeds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord API Error: ${response.statusText}`);
      }
      logger.info(`Discord webhook sent successfully`);
    } catch (err: any) {
      logger.error(`Failed to send Discord webhook: ${err.message}`);
      throw err;
    }
  },
};
