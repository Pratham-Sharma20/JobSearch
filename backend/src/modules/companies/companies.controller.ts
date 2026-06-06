import { Request, Response } from 'express';
import { CompaniesService } from './companies.service';
import { asyncHandler } from '@/utils/asyncHandler';

export const getAllCompanies = asyncHandler(async (_req: Request, res: Response) => {
  const companies = await CompaniesService.getAllCompanies();
  res.status(200).json(companies); // API spec requested an array return: [{ name: '...', ... }]
});

export const getJobsByCompany = asyncHandler(async (req: Request, res: Response) => {
  const jobs = await CompaniesService.getJobsByCompany(req.params.name as string);
  
  res.status(200).json({
    success: true,
    jobs,
  });
});

export const bulkUploadCompanies = asyncHandler(async (req: Request, res: Response) => {
  const companies = req.body.companies;
  if (!Array.isArray(companies)) {
    return res.status(400).json({ success: false, message: 'Invalid data format. Expected an array of companies.' });
  }

  const results = await CompaniesService.bulkUpload(companies);
  res.status(200).json({
    success: true,
    results,
  });
});
