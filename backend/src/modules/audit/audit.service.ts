import { Types } from 'mongoose';

import { AuditLog } from '@/models/AuditLog.model';
import { logger } from '@/utils/logger';

export interface LogAuditParams {
  userId?: string | Types.ObjectId;
  email?: string;
  action: 'Register' | 'Login' | 'Logout' | 'Refresh Token' | 'Google Login' | 'Profile Update';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export class AuditService {
  /**
   * Logs an authentication or profile action to the database asynchronously.
   * Safe method: will not throw errors to prevent blocking primary request flows.
   */
  public static async log(params: LogAuditParams): Promise<void> {
    try {
      await AuditLog.create({
        userId: params.userId ? new Types.ObjectId(params.userId) : undefined,
        email: params.email,
        action: params.action,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        details: params.details,
        timestamp: new Date(),
      });
      logger.debug(
        `[Audit] Action logged: ${params.action} for ${params.email || params.userId || 'unknown'}`
      );
    } catch (error: any) {
      logger.error(`[Audit] Failed to log action: ${params.action}. Error:`, error.message);
    }
  }
}
