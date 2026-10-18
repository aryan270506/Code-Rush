import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-[#272B49] bg-[#13162D] ${className}`}>
      <table className="w-full text-left text-xs text-[#A5ADCA] border-collapse">{children}</table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <thead className={`bg-[#0D1024] text-[11px] font-semibold text-[#F8FAFC] uppercase tracking-wider border-b border-[#272B49] ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <tbody className={`divide-y divide-[#272B49]/70 ${className}`}>{children}</tbody>;
};

export const TableRow: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}> = ({ children, className = '', onClick, selected = false }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${
        selected ? 'bg-[#4F20D8]/15' : 'hover:bg-[#191B38]/60'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<{
  children?: React.ReactNode;
  className?: string;
  width?: string;
}> = ({ children, className = '', width }) => {
  return (
    <th scope="col" style={{ width }} className={`px-4 py-3 text-left font-medium ${className}`}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}> = ({ children, className = '', align = 'left' }) => {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return <td className={`px-4 py-3.5 whitespace-nowrap align-middle ${alignClass} ${className}`}>{children}</td>;
};
