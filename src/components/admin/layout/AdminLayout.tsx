import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('cb_admin_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const handleSetCollapsed = (val: boolean) => {
    setCollapsed(val);
    localStorage.setItem('cb_admin_sidebar_collapsed', String(val));
  };

  return (
    <div className="min-h-screen bg-[#080A18] text-[#F8FAFC] flex font-sans antialiased selection:bg-[#6D28D9]/40 selection:text-[#F8FAFC]">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={handleSetCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Fixed Top Navigation */}
        <AdminHeader
          collapsed={collapsed}
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          onToggleCollapse={() => handleSetCollapsed(!collapsed)}
        />

        {/* Page Body */}
        <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl w-full mx-auto">
          {/* Reusable Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272B49]">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#A5ADCA] mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
          </div>

          {/* Page Content View */}
          {children}
        </main>
      </div>
    </div>
  );
};
