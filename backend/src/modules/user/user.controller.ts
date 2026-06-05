import { Request, Response } from 'express';

import { NotFoundError, UnauthorizedError } from '@/middleware/errorHandler';
import { User } from '@/models/User.model';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthService } from '@/modules/auth/auth.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/response';

export class UserController {
  /**
   * GET /api/users/profile
   * Retrieves the profile of the currently logged-in user.
   */
  public static getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    
    sendSuccess(res, AuthService.mapUserToResponse(user), 'Profile retrieved successfully');
  });

  /**
   * PUT /api/users/profile
   * Updates allowed profile fields.
   */
  public static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const { name, profileImage, telegramChatId, discordWebhookUrl } = req.body;

    if (name !== undefined) user.name = name;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (telegramChatId !== undefined) user.telegramChatId = telegramChatId;
    if (discordWebhookUrl !== undefined) user.discordWebhookUrl = discordWebhookUrl;

    await user.save();

    // Log the audit event asynchronously
    AuditService.log({
      userId: user._id.toString(),
      email: user.email,
      action: 'Profile Update',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        updatedFields: Object.keys(req.body),
      },
    }).catch(() => {});

    sendSuccess(res, AuthService.mapUserToResponse(user), 'Profile updated successfully');
  });
}
