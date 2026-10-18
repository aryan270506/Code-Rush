import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const widthStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
  '3xl': 'max-w-5xl',
  '4xl': 'max-w-6xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#080A18]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Surface */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${widthStyles[maxWidth]} bg-[#13162D] border border-[#272B49] rounded-xl shadow-2xl shadow-black/80 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#272B49] flex items-center justify-between gap-4 bg-[#0D1024]/60">
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#A5ADCA] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#737D9D] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#191B38] transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-[#272B49] bg-[#0D1024]/70 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
