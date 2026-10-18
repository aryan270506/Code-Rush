import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../../hooks/useAuth';

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
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cb_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSetCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    setCollapsed((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem('cb_admin_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setIsLogoutOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex font-sans antialiased selection:bg-violet-primary/30 selection:text-white">
      {/* Shared Reusable Sidebar for Admin */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={handleSetCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenLogoutDialog={() => setIsLogoutOpen(true)}
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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
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

      {/* Logout Confirmation Modal */}
      <ConfirmDialog
        isOpen={isLogoutOpen}
        title="Sign Out of Operations Console"
        description="Are you sure you want to end your administrative session?"
        confirmLabel="Sign Out"
        cancelLabel="Stay Signed In"
        variant="danger"
        loading={loggingOut}
        onConfirm={handleLogout}
        onClose={() => setIsLogoutOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
