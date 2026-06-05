import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export const telegramService = {
  sendMessage: async (chatId: string, text: string): Promise<void> => {
    if (!env.TELEGRAM_BOT_TOKEN) {
      logger.warn(`Telegram message not sent (missing bot token). ChatId: ${chatId}`);
      return;
    }

    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API Error: ${errorData.description || response.statusText}`);
      }
      logger.info(`Telegram message sent successfully to ${chatId}`);
    } catch (err: any) {
      logger.error(`Failed to send Telegram message to ${chatId}: ${err.message}`);
      throw err;
    }
  },
};
