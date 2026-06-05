import { FilterQuery } from 'mongoose';
import { Job } from '@/models/Job.model';
import { IJobDocument } from '@/types/job.types';
import { SearchJobsInput } from '@/validators/job.validator';

export class JobsService {
  static async getJobs(query: SearchJobsInput['query']) {
    const {
      keyword,
      company,
      location,
      workModel,
      jobCategory,
      internshipSeason,
      department,
      industry,
      dateRange,
      page = 1,
      limit = 20,
    } = query;

    const filter: FilterQuery<IJobDocument> = {
      isExpired: false,
    };

    if (keyword) {
      filter.$or = [
        { jobTitle: { $regex: keyword, $options: 'i' } },
        { descriptionSnippet: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (company) {
      filter.companyName = { $regex: company, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (workModel && workModel.length > 0) {
      filter.workModel = { $in: workModel };
    }

    if (jobCategory && jobCategory.length > 0) {
      filter.jobCategory = { $in: jobCategory };
    }

    if (internshipSeason && internshipSeason.length > 0) {
      filter.internshipSeason = { $in: internshipSeason };
    }

    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }

    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }

    if (dateRange) {
      const now = new Date();
      let fromDate: Date;
      if (dateRange === 'today') {
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (dateRange === 'week') {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        // month
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      filter.datePosted = { $gte: fromDate };
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-description -__v') // exclude large description in list view
        .lean(),
      Job.countDocuments(filter),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getJobById(id: string) {
    return Job.findById(id).lean();
  }
}
