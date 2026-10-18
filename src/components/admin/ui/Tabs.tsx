import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1.5 border-b border-[#272B49] pb-px overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-px ${
              isActive
                ? 'border-[#7C3AED] text-[#F8FAFC] bg-[#191B38]'
                : 'border-transparent text-[#A5ADCA] hover:text-[#F8FAFC] hover:bg-[#191B38]/50'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive
                    ? 'bg-[#6D28D9] text-[#F8FAFC]'
                    : 'bg-[#272B49] text-[#A5ADCA]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
