import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#13162D] border border-[#272B49] rounded-xl overflow-hidden ${
        hoverable ? 'hover:border-[#6D28D9]/50 transition-colors cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`p-4 sm:p-5 border-b border-[#272B49] flex items-center justify-between gap-4 ${className}`}>
    <div>
      <h3 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-[#A5ADCA] mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`p-3.5 sm:p-4 border-t border-[#272B49] bg-[#0D1024]/40 flex items-center justify-between text-xs text-[#A5ADCA] ${className}`}>
    {children}
  </div>
);
