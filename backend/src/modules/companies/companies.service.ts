import { Company } from '@/models/Company.model';
import { Job } from '@/models/Job.model';
import { NotFoundError } from '@/middleware/errorHandler';

export class CompaniesService {
  static async getAllCompanies() {
    return Company.find()
      .select('name logoUrl industry activeJobCount -_id')
      .lean();
  }

  static async getJobsByCompany(name: string) {
    const companyExists = await Company.exists({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!companyExists) {
      throw new NotFoundError('Company');
    }

    return Job.find({
      companyName: { $regex: new RegExp(`^${name}$`, 'i') },
      isExpired: false,
    })
      .sort({ createdAt: -1 })
      .select('-description -__v')
      .lean();
  }

  static async bulkUpload(companies: any[]) {
    const results = {
      total: companies.length,
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const companyData of companies) {
      try {
        const updateResult = await Company.updateOne(
          { domain: companyData.domain },
          {
            $set: {
              name: companyData.name,
              logoUrl: companyData.logoUrl,
              careerUrl: companyData.careerUrl,
              earlyCareerUrl: companyData.earlyCareerUrl,
              industry: companyData.industry,
              atsPlatform: companyData.atsPlatform || 'unknown',
              scrapeStrategy: companyData.scrapeStrategy || 'api',
            }
          },
          { upsert: true }
        );

        if (updateResult.upsertedCount > 0) {
          results.inserted++;
        } else if (updateResult.modifiedCount > 0) {
          results.updated++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${companyData.name}: ${error.message}`);
      }
    }

    return results;
  }
}

