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
}

