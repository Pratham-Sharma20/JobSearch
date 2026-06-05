import { IJobDocument } from '@/types/job.types';
import { Alert } from '@/models/Alert.model';
import { IUserDocument } from '@/types/user.types';

export interface MatchedUser {
  user: IUserDocument;
  channels: ('email' | 'telegram' | 'discord')[];
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export const matchAlertsForJob = async (job: IJobDocument): Promise<MatchedUser[]> => {
  const matchedAlerts = await Alert.find({
    isActive: true,
    $and: [
      {
        $or: [
          { company: { $exists: false } },
          { company: null },
          { company: '' },
          { company: new RegExp(`^${escapeRegExp(job.companyName)}$`, 'i') }
        ]
      },
      {
        $or: [
          { department: { $exists: false } },
          { department: null },
          { department: '' },
          { department: new RegExp(`^${escapeRegExp(job.department)}$`, 'i') }
        ]
      },
      {
        $or: [
          { location: { $exists: false } },
          { location: null },
          { location: '' },
          { location: new RegExp(`^${escapeRegExp(job.location)}$`, 'i') }
        ]
      },
      {
        $or: [
          { industry: { $exists: false } },
          { industry: null },
          { industry: '' },
          { industry: new RegExp(`^${escapeRegExp(job.industry)}$`, 'i') }
        ]
      },
      {
        $or: [
          { jobCategory: { $exists: false } },
          { jobCategory: null },
          { jobCategory: job.aiClassification }
        ]
      }
    ]
  }).populate('userId');

  const result: MatchedUser[] = [];
  const processedUserIds = new Set<string>();

  for (const alert of matchedAlerts) {
    // Populate replaces the ObjectId with the actual document
    const user = alert.userId as unknown as IUserDocument;
    
    // Check if user exists and is active
    if (!user || user.isDeleted || !user.isActive) {
      continue;
    }

    const userIdStr = user._id.toString();
    
    // Avoid sending multiple notifications to the same user if multiple alerts match
    if (processedUserIds.has(userIdStr)) {
      continue;
    }

    result.push({
      user,
      channels: alert.channels,
    });
    processedUserIds.add(userIdStr);
  }

  return result;
};
