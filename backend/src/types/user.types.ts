import { Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type AuthProvider = 'local' | 'google';

export interface IUser {
  name: string;
  email: string;
  passwordHash?: string;
  provider: AuthProvider;
  profileImage?: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
  role: UserRole;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  softDelete(): Promise<IUserDocument>;
  restore(): Promise<IUserDocument>;
}
