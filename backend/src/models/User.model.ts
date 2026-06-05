import bcrypt from 'bcryptjs';
import { Model, Schema, model } from 'mongoose';

import { IUserDocument } from '@/types/user.types';

export interface IUserModel extends Model<IUserDocument> {
  // Can define custom statics here if needed
}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    provider: { type: String, enum: ['local', 'google'], default: 'local', required: true },
    profileImage: { type: String },
    telegramChatId: { type: String },
    discordWebhookUrl: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
    isActive: { type: Boolean, default: true, required: true },
    isDeleted: { type: Boolean, default: false, required: true },
    deletedAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// NOTE: Password hashing is handled exclusively in the service layer (utils/password.ts).
// Do NOT add a pre-save hook for hashing here — it causes double-hashing bugs.

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Soft delete instance method
userSchema.methods.softDelete = async function (): Promise<IUserDocument> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore instance method
userSchema.methods.restore = async function (): Promise<IUserDocument> {
  this.isDeleted = false;
  this.deletedAt = undefined;
  return this.save();
};

// Global query middleware to exclude soft-deleted records by default
userSchema.pre(/^find/, function (this: any, next) {
  const query = this.getQuery();
  // Allow explicit querying of soft-deleted items if the caller explicitly specifies it
  if (query.isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

export const User = model<IUserDocument, IUserModel>('User', userSchema);
