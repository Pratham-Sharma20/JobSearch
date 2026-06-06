import { Job } from '@/models/Job.model';
import { Notification } from '@/models/Notification.model';
import { logger } from '@/utils/logger';
import { matchAlertsForJob } from '@/modules/alerts/alerts.matcher';

import { emailService } from '@/services/channels/email.service';
import { telegramService } from '@/services/channels/telegram.service';
import { discordService } from '@/services/channels/discord.service';

export async function processNotificationJob(jobId: string, companyName: string) {
  logger.info(`Processing notifications for ${companyName} - ${jobId}`);

  try {
    const dbJob = await Job.findOne({ jobId, companyName });
    if (!dbJob) {
      logger.warn(`Job not found in DB: ${jobId} - ${companyName}`);
      return;
    }

    if (dbJob.isExpired) {
      logger.info(`Job ${jobId} is expired, skipping notifications`);
      return;
    }

    const matchedUsers = await matchAlertsForJob(dbJob);
    logger.info(`Found ${matchedUsers.length} users to notify for job ${jobId}`);

    for (const match of matchedUsers) {
      for (const channel of match.channels) {
        try {
          // Attempt to retrieve or create the Notification record to prevent duplicates
          const notificationDoc = await Notification.findOneAndUpdate(
            { userId: match.user._id, jobId: dbJob._id, channel },
            { $setOnInsert: { status: 'pending' } },
            { upsert: true, new: true }
          );
          
          if (notificationDoc.status === 'sent') {
            logger.debug(`Notification already exists and sent for user ${match.user._id}, job ${jobId}, channel ${channel}`);
            continue;
          }

          // Dispatch notification
          try {
            if (channel === 'email' && match.user.email) {
              const html = `
                <h2>New Job Alert 🚀</h2>
                <p><strong>Title:</strong> ${dbJob.jobTitle}</p>
                <p><strong>Company:</strong> ${dbJob.companyName}</p>
                <p><strong>Location:</strong> ${dbJob.location}</p>
                <p><a href="${dbJob.applyUrl}">Apply Here</a></p>
              `;
              await emailService.sendEmail(match.user.email, `New ${dbJob.jobCategory} at ${dbJob.companyName}`, html);
            } else if (channel === 'telegram' && match.user.telegramChatId) {
              const text = `<b>New Job Alert 🚀</b>\n\n<b>Title:</b> ${dbJob.jobTitle}\n<b>Company:</b> ${dbJob.companyName}\n<b>Location:</b> ${dbJob.location}\n<a href="${dbJob.applyUrl}">Apply Here</a>`;
              await telegramService.sendMessage(match.user.telegramChatId, text);
            } else if (channel === 'discord' && match.user.discordWebhookUrl) {
              await discordService.sendWebhook(match.user.discordWebhookUrl, 'New Job Alert 🚀', [
                {
                  title: dbJob.jobTitle,
                  url: dbJob.applyUrl,
                  author: { name: dbJob.companyName },
                  description: dbJob.descriptionSnippet,
                  fields: [
                    { name: 'Location', value: dbJob.location, inline: true },
                    { name: 'Category', value: dbJob.jobCategory, inline: true }
                  ]
                }
              ]);
            } else {
              // Channel selected but missing user details (e.g. email or telegramChatId)
              logger.warn(`User ${match.user._id} selected ${channel} but is missing required configuration`);
              notificationDoc.status = 'failed';
              notificationDoc.error = `Missing user configuration for ${channel}`;
              await notificationDoc.save();
              continue;
            }

            notificationDoc.status = 'sent';
            notificationDoc.sentAt = new Date();
            await notificationDoc.save();
          } catch (dispatchErr: any) {
            notificationDoc.status = 'failed';
            notificationDoc.error = dispatchErr.message;
            await notificationDoc.save();
            logger.error(`Failed dispatching ${channel} to user ${match.user._id}: ${dispatchErr.message}`);
          }
        } catch (err: any) {
          logger.error(`Error saving notification doc: ${err.message}`);
        }
      }
    }
    logger.debug(`Notification job completed for: ${jobId}`);
  } catch (err: any) {
    logger.error(`Notification job failed for ${companyName} - ${jobId}: ${err.message}`);
  }
}
