import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#6D28D9] hover:bg-[#7C3AED] text-[#F8FAFC] shadow-sm shadow-[#6D28D9]/40 border border-[#8B5CF6]/30 active:scale-[0.98]',
    secondary:
      'bg-[#191B38] hover:bg-[#1f2246] text-[#F8FAFC] border border-[#272B49] active:scale-[0.98]',
    danger:
      'bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/40 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-[#191B38] text-[#A5ADCA] hover:text-[#F8FAFC] border border-[#272B49]',
    ghost:
      'bg-transparent hover:bg-[#191B38] text-[#A5ADCA] hover:text-[#F8FAFC] border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
