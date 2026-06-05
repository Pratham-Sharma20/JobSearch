import { MapPin, Building2, Clock, Bookmark } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { JobDocument } from '../types/job';

export interface JobCardProps extends JobDocument {
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onApply?: (id: string) => void;
}

export function JobCard(props: JobCardProps) {
  const {
    _id,
    jobTitle,
    companyName,
    location,
    workModel,
    jobCategory,
    datePosted,
    companyLogoUrl,
    applyUrl,
    isSaved,
    onSave,
    onApply
  } = props;

  const formattedDate = datePosted ? new Date(datePosted).toLocaleDateString() : 'Recently';

  return (
    <Card variant="flat" className="flex flex-col sm:flex-row gap-6 hover:border-muted-soft transition-colors group">
      {/* Logo */}
      <div className="w-16 h-16 rounded-md bg-surface-card border border-hairline flex items-center justify-center flex-shrink-0 overflow-hidden">
        {companyLogoUrl ? (
          <img src={companyLogoUrl} alt={companyName} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="text-muted" size={24} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Badge variant="coral" className="mb-2 capitalize">{jobCategory.replace('_', ' ')}</Badge>
            <h3 className="font-display text-2xl text-ink font-semibold group-hover:text-primary transition-colors cursor-pointer">
              {jobTitle}
            </h3>
            <div className="font-sans text-body font-medium text-[16px] mt-1">
              {companyName}
            </div>
          </div>
          
          <button 
            onClick={() => onSave?.(_id)} 
            className={`p-2 rounded-full hover:bg-surface-soft transition-colors ${isSaved ? 'text-primary' : 'text-muted'}`}
            aria-label={isSaved ? "Remove from saved" : "Save job"}
          >
            <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[14px] text-muted-soft font-sans mt-4">
          <div className="flex items-center gap-1.5">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5 capitalize">
            <Clock size={16} />
            <span>{workModel} • {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="flex flex-col justify-end mt-4 sm:mt-0 border-t border-hairline sm:border-none pt-4 sm:pt-0">
        <Button 
          variant="primary" 
          onClick={() => {
            if (onApply) onApply(_id);
            else if (applyUrl) window.open(applyUrl, '_blank', 'noopener,noreferrer');
          }} 
          className="w-full sm:w-auto"
        >
          Apply Now
        </Button>
      </div>
    </Card>
  );
}
