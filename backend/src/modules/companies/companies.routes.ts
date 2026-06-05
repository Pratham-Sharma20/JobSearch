import { Router } from 'express';
import { getAllCompanies, getJobsByCompany } from './companies.controller';

const router = Router();

router.get('/', getAllCompanies);
router.get('/:name/jobs', getJobsByCompany);

export { router as companiesRouter };
