import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'feature' | 'dark' | 'code' | 'coral' | 'flat';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'feature', ...props }, ref) => {
    const variantClasses = {
      feature: 'card-feature',
      dark: 'card-dark',
      code: 'card-code',
      coral: 'card-coral',
      flat: 'bg-canvas text-ink rounded-lg p-xl border border-hairline',
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
