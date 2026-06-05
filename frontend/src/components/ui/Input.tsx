import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn('input-text', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
