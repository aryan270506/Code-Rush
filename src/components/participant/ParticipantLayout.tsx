import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { useAuth } from "../../context/AuthContext";

export const ParticipantLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Desktop sidebar collapse state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cb_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Mobile sidebar drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Logout confirmation state
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setIsLogoutOpen(false);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary antialiased selection:bg-violet-primary/30 selection:text-white">
      {/* Collapsible Sidebar (Desktop) & Drawer (Mobile) */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenLogoutDialog={() => setIsLogoutOpen(true)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area: transitions margin based on sidebar state */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top Header */}
        <DashboardHeader
          onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)}
          onOpenLogoutDialog={() => setIsLogoutOpen(true)}
        />

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmDialog
        isOpen={isLogoutOpen}
        title="Sign Out of Code Battle"
        message="Are you sure you want to end your current session? Any unsaved coding progress in temporary editor buffers will be discarded."
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="danger"
        icon="logout"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutOpen(false)}
      />
    </div>
  );
};

export default ParticipantLayout;
