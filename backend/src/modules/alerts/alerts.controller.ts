import { Request, Response } from 'express';
import { AlertsService } from './alerts.service';
import { asyncHandler } from '@/utils/asyncHandler';

export const createAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const alert = await AlertsService.createAlert(userId, req.body);
  res.status(201).json({ success: true, alert });
});

export const getAlerts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const alerts = await AlertsService.getAlerts(userId);
  res.status(200).json({ success: true, alerts });
});

export const updateAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { alertId } = req.params;
  const alert = await AlertsService.updateAlert(userId, alertId as string, req.body);
  res.status(200).json({ success: true, alert });
});

export const deleteAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { alertId } = req.params;
  await AlertsService.deleteAlert(userId, alertId as string);
  res.status(200).json({ success: true, message: 'Alert deleted successfully' });
});
