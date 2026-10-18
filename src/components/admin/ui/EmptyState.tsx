import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#272B49] bg-[#13162D]/40 ${className}`}
    >
      <div className="h-12 w-12 rounded-full bg-[#191B38] border border-[#272B49] flex items-center justify-center text-[#7C3AED] mb-3.5 shadow-inner">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-semibold text-[#F8FAFC]">{title}</h3>
      <p className="text-xs text-[#A5ADCA] max-w-sm mt-1 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
