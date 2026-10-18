import React from 'react';

export type BadgeVariant =
  | 'purple'
  | 'bright'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  purple: {
    bg: 'bg-[#6D28D9]/15',
    text: 'text-[#8B5CF6]',
    border: 'border-[#6D28D9]/40',
    dot: 'bg-[#8B5CF6]',
  },
  bright: {
    bg: 'bg-[#7C3AED]/20',
    text: 'text-[#A78BFA]',
    border: 'border-[#7C3AED]/50',
    dot: 'bg-[#7C3AED]',
  },
  success: {
    bg: 'bg-[#10B981]/15',
    text: 'text-[#10B981]',
    border: 'border-[#10B981]/30',
    dot: 'bg-[#10B981]',
  },
  warning: {
    bg: 'bg-[#F59E0B]/15',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/30',
    dot: 'bg-[#F59E0B]',
  },
  error: {
    bg: 'bg-[#EF4444]/15',
    text: 'text-[#EF4444]',
    border: 'border-[#EF4444]/30',
    dot: 'bg-[#EF4444]',
  },
  info: {
    bg: 'bg-[#3B82F6]/15',
    text: 'text-[#3B82F6]',
    border: 'border-[#3B82F6]/30',
    dot: 'bg-[#3B82F6]',
  },
  neutral: {
    bg: 'bg-[#191B38]',
    text: 'text-[#A5ADCA]',
    border: 'border-[#272B49]',
    dot: 'bg-[#737D9D]',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const style = variantStyles[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot} animate-pulse`} />}
      {children}
    </span>
  );
};
