import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'secondary-dark' | 'text' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variantClasses = {
      primary: 'btn btn-primary',
      secondary: 'btn btn-secondary',
      'secondary-dark': 'btn btn-secondary-dark',
      text: 'btn-text',
      icon: 'btn-icon',
    };

    return (
      <button
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
