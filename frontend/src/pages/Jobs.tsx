import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterSidebar } from '../components/FilterSidebar';
import { JobCard } from '../components/JobCard';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import type { PaginatedResponse, JobDocument } from '../types/job';

export function Jobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedCompanyFilter = useDebounce(companyFilter, 500);

  const categories = ['internship', 'new_grad', 'entry_level', 'co_op', 'rotational'];

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [debouncedSearchTerm, debouncedCompanyFilter, selectedCategory]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['jobs', debouncedSearchTerm, debouncedCompanyFilter, selectedCategory, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('keyword', debouncedSearchTerm);
      if (debouncedCompanyFilter) params.append('company', debouncedCompanyFilter);
      if (selectedCategory !== 'All') params.append('jobCategory', selectedCategory);
      params.append('page', page.toString());
      params.append('limit', '20');
      
      const response = await api.get<PaginatedResponse<JobDocument>>(`/jobs?${params.toString()}`);
      return response.data;
    },
    // Keep previous data while fetching new page to avoid harsh loading states
    placeholderData: (previousData) => previousData,
  });

  const toggleSave = (id: string) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const jobs = data?.jobs || [];
  const totalPages = data?.pagination?.pages || 1;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-display font-medium text-ink mb-2">Explore Opportunities</h1>
        <p className="text-body text-lg">Find the perfect early-career role to kickstart your journey.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <FilterSidebar 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          companyFilter={companyFilter}
          onCompanyChange={setCompanyFilter}
        />
        
        <div className="flex-1 w-full flex flex-col gap-4">
          {isLoading ? (
            <div className="py-12 flex justify-center text-muted">Loading jobs...</div>
          ) : isError ? (
            <div className="py-12 flex justify-center text-danger">Failed to load jobs. Please try again.</div>
          ) : jobs.length > 0 ? (
            <>
              <div className={isFetching ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
                {jobs.map(job => (
                  <div key={job._id} className="mb-4">
                    <JobCard 
                      {...job} 
                      isSaved={savedJobs.has(job._id)}
                      onSave={toggleSave}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="sticky bottom-0 bg-canvas py-4 border-t border-hairline mt-auto flex items-center justify-between z-10">
                  <p className="text-sm text-muted-soft font-sans">
                    Showing page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || isFetching}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages || isFetching}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState 
              onAction={() => {
                setSearchTerm('');
                setCompanyFilter('');
                setSelectedCategory('All');
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
