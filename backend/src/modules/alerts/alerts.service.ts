import { Alert } from '@/models/Alert.model';
import { NotFoundError } from '@/middleware/errorHandler';
import { CreateAlertInput, UpdateAlertInput } from '@/validators/alert.validator';

export class AlertsService {
  static async createAlert(userId: string, data: CreateAlertInput['body']) {
    const alert = await Alert.create({ userId, ...data });
    return alert;
  }

  static async getAlerts(userId: string) {
    return Alert.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  static async updateAlert(userId: string, alertId: string, data: UpdateAlertInput['body']) {
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId },
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!alert) {
      throw new NotFoundError('Alert');
    }

    return alert;
  }

  static async deleteAlert(userId: string, alertId: string) {
    const alert = await Alert.findOneAndDelete({ _id: alertId, userId });
    
    if (!alert) {
      throw new NotFoundError('Alert');
    }
    
    return alert;
  }
}
