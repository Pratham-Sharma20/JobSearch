import { Search } from 'lucide-react';
import { Input } from './ui/Input';

interface FilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  companyFilter: string;
  onCompanyChange: (company: string) => void;
}

export function FilterSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  companyFilter,
  onCompanyChange,
}: FilterSidebarProps) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 bg-surface-soft rounded-lg border border-hairline p-6 flex flex-col gap-8 h-fit">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-sans font-medium text-ink text-[16px] mb-2">Search</h3>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Role, keyword..."
              className="pl-10 bg-canvas"
            />
          </div>
        </div>
        
        <div>
          <h3 className="font-sans font-medium text-ink text-[16px] mb-2">Company</h3>
          <div className="relative">
            <Input 
              value={companyFilter}
              onChange={(e) => onCompanyChange(e.target.value)}
              placeholder="Company name..."
              className="bg-canvas"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-sans font-medium text-ink text-[16px] mb-4">Categories</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelectCategory('All')}
            className={`text-left px-3 py-2 rounded-md transition-colors text-[14px] font-medium ${
              selectedCategory === 'All' 
                ? 'bg-surface-card text-ink' 
                : 'text-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            All Roles
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`text-left px-3 py-2 rounded-md transition-colors text-[14px] font-medium capitalize ${
                selectedCategory === category 
                  ? 'bg-surface-card text-ink' 
                  : 'text-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              {category.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-sans font-medium text-ink text-[16px] mb-4">Experience Level</h3>
        <div className="flex flex-col gap-3">
          {['Internship', 'Entry Level', 'Junior'].map(level => (
            <label key={level} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-hairline text-primary focus:ring-primary/20 accent-primary" 
              />
              <span className="text-[14px] text-body group-hover:text-ink">{level}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
