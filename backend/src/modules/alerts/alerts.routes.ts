import { Router } from 'express';
import { createAlert, getAlerts, updateAlert, deleteAlert } from './alerts.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { createAlertSchema, updateAlertSchema } from '@/validators/alert.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createAlertSchema), createAlert);
router.get('/', getAlerts);

// We update param name to match updateAlertSchema expected param 'alertId'
// Wait, the existing schema expects 'alertId'. Let's rename the param to :alertId
router.put('/:alertId', validate(updateAlertSchema), updateAlert);

// We need a deleteAlert schema if we strictly want to validate alertId, but we can reuse updateAlertSchema's params for delete.
// Let's create a minimal validation for delete or update the controller to use req.params.alertId.
router.delete('/:alertId', deleteAlert);

export { router as alertsRouter };
