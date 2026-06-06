import { Router } from 'express';
import { getAllCompanies, getJobsByCompany, bulkUploadCompanies } from './companies.controller';

const router = Router();

router.get('/', getAllCompanies);
router.get('/:name/jobs', getJobsByCompany);
router.post('/bulk-upload', bulkUploadCompanies);

export { router as companiesRouter };
