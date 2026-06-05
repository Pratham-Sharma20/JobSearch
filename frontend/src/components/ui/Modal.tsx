import { useEffect, type HTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, className, ...props }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4">
      <div 
        className={cn("bg-surface-card rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-lg border border-hairline", className)}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        <div className="flex items-center justify-between p-6 border-b border-hairline">
          {title && <h2 className="text-xl font-display font-medium m-0">{title}</h2>}
          <button 
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors focus:outline-none"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
