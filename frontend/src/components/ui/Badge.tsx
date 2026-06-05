import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'pill' | 'coral';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'pill', ...props }, ref) => {
    const variantClasses = {
      pill: 'badge-pill',
      coral: 'badge-coral',
    };

    return (
      <span
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
