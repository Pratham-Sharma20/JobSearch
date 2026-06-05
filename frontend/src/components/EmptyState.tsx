import { SearchX } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No results found",
  description = "We couldn't find any matches for your current search. Try adjusting your filters.",
  actionLabel = "Clear filters",
  onAction,
  icon = <SearchX size={48} className="text-muted-soft" />
}: EmptyStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-24 px-6 text-center bg-canvas rounded-lg border border-hairline border-dashed">
      <div className="mb-6">{icon}</div>
      <h3 className="font-display text-2xl font-medium text-ink mb-2">{title}</h3>
      <p className="text-body max-w-md mb-8">{description}</p>
      {onAction && actionLabel && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
