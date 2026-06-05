import { BookmarkIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { JobCard } from '../components/JobCard';
import { EmptyState } from '../components/EmptyState';
import { api } from '../lib/api';
import type { SavedJobsResponse } from '../types/job';

export function SavedJobs() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const response = await api.get<SavedJobsResponse>('/users/saved-jobs');
      return response.data;
    },
    retry: false // don't retry repeatedly if unauthorized
  });

  const savedJobs = data?.savedJobs || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-display font-medium text-ink mb-2">Saved Opportunities</h1>
        <p className="text-body text-lg">Review and apply to the roles you've bookmarked.</p>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-4">
        {isLoading ? (
          <div className="py-12 flex justify-center text-muted">Loading saved jobs...</div>
        ) : isError ? (
          <EmptyState 
            icon={<BookmarkIcon size={48} className="text-muted-soft" />}
            title="Log in to view saved jobs"
            description="You need to be logged in to view your saved opportunities."
            actionLabel="Sign In"
          />
        ) : savedJobs.length > 0 ? (
          savedJobs.map(savedJob => (
            <JobCard 
              key={savedJob._id} 
              {...savedJob.jobId} 
              isSaved={true}
            />
          ))
        ) : (
          <EmptyState 
            icon={<BookmarkIcon size={48} className="text-muted-soft" />}
            title="No saved jobs yet"
            description="When you see a role you like, click the bookmark icon to save it for later."
            actionLabel="Browse Jobs"
          />
        )}
      </div>
    </div>
  );
}
