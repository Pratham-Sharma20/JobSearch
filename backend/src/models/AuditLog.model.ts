import { Document, Schema, Types, model } from 'mongoose';

export interface IAuditLog {
  userId?: Types.ObjectId;
  email?: string;
  action: 'Register' | 'Login' | 'Logout' | 'Refresh Token' | 'Google Login' | 'Profile Update';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    email: { type: String, index: true },
    action: { type: String, required: true, index: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, required: true, index: true },
  },
  {
    timestamps: false,
  }
);

export const AuditLog = model<IAuditLogDocument>('AuditLog', auditLogSchema);
