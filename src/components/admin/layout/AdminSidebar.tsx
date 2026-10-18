import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Trophy,
  Users,
  Layers,
  HelpCircle,
  FileCheck2,
  Sliders,
  Award,
  Settings,
  LogOut,
  Zap,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

// 9 Core hackathon navigation items mapped with vibrant accent colors matching reference design
const NAV_ITEMS = [
  {
    path: '/admin',
    label: 'Overview',
    icon: Home,
    exact: true,
    accentColor: '#EF4444', // Vibrant Coral / Red (like HOME in screenshot)
  },
  {
    path: '/admin/competitions',
    label: 'Competitions',
    icon: Trophy,
    accentColor: '#F59E0B', // Amber Gold
  },
  {
    path: '/admin/participants',
    label: 'Participants',
    icon: Users,
    accentColor: '#F97316', // Vibrant Orange (like PROFILE in screenshot)
  },
  {
    path: '/admin/rounds',
    label: 'Rounds',
    icon: Layers,
    accentColor: '#8B5CF6', // Vibrant Purple (like ORDER in screenshot)
  },
  {
    path: '/admin/questions',
    label: 'Questions',
    icon: HelpCircle,
    accentColor: '#EC4899', // Hot Pink
  },
  {
    path: '/admin/submissions',
    label: 'Submissions',
    icon: FileCheck2,
    accentColor: '#06B6D4', // Cyan Blue
  },
  {
    path: '/admin/scoring',
    label: 'Scoring',
    icon: Sliders,
    accentColor: '#10B981', // Vibrant Green (like INBOX in screenshot)
  },
  {
    path: '/admin/leaderboard',
    label: 'Leaderboard',
    icon: Award,
    accentColor: '#F59E0B', // Gold
  },
  {
    path: '/admin/reports',
    label: 'Settings',
    icon: Settings,
    accentColor: '#6366F1', // Indigo
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  // Sidebar theme: 'light' (white as in reference image) or 'dark'
  const [sidebarTheme, setSidebarTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('cb_admin_sidebar_theme') as 'light' | 'dark') || 'light';
  });

  const toggleSidebarTheme = () => {
    const nextTheme = sidebarTheme === 'light' ? 'dark' : 'light';
    setSidebarTheme(nextTheme);
    localStorage.setItem('cb_admin_sidebar_theme', nextTheme);
  };

  const isItemActive = (path: string, exact?: boolean) => {
    if (exact) {
      return (
        location.pathname === '/admin' ||
        location.pathname === '/admin/overview' ||
        location.pathname === '/admin/dashboard'
      );
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isLight = sidebarTheme === 'light';

  const navContent = (
    <div
      className={`flex flex-col h-full transition-colors duration-200 select-none ${
        isLight
          ? 'bg-[#FFFFFF] text-[#2B2E3E]'
          : 'bg-[#0D1024] text-[#A5ADCA]'
      }`}
    >
      {/* 1. Header / Logo Area */}
      <div
        className={`h-16 flex items-center shrink-0 relative px-4 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <NavLink to="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-black flex items-center justify-center shrink-0 shadow-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span
                className={`text-sm font-extrabold tracking-wider uppercase font-sans ${
                  isLight ? 'text-[#111827]' : 'text-[#F8FAFC]'
                }`}
              >
                Code Battle
              </span>
              <span className="text-[10px] text-[#737D9D] font-mono tracking-widest uppercase">
                Admin Portal
              </span>
            </div>
          )}
        </NavLink>

        {/* Toggle button on desktop matching the reference cyan square button */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg bg-[#0088CC] hover:bg-[#0077B5] text-white shadow-md shadow-[#0088CC]/30 transition-all cursor-pointer"
            title="Collapse Sidebar"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        )}

        {/* Mobile close button with X icon */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg bg-[#0088CC] hover:bg-[#0077B5] text-white shadow-md shadow-[#0088CC]/30 transition-all cursor-pointer"
          title="Close Navigation"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* 2. Navigation List with Organic Curved Cutouts */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-1 overflow-x-hidden relative scrollbar-none [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.path, item.exact);

          return (
            <div key={item.path} className="relative">
              {/* TOP SVG FILLET (curves the row above into the active cutout) */}
              {active && (
                <svg
                  className="absolute right-0 -top-6 w-6 h-6 pointer-events-none z-20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M0,24 C13.255,24 24,13.255 24,0 L24,24 Z" fill="#080A18" />
                </svg>
              )}

              {/* NAV ROW LINK */}
              <NavLink
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center h-12 transition-all relative z-10 ${
                  active
                    ? 'bg-[#080A18] text-white'
                    : isLight
                    ? 'hover:bg-[#F3F4F6] text-[#374151] hover:text-[#111827]'
                    : 'hover:bg-[#191B38] text-[#A5ADCA] hover:text-[#F8FAFC]'
                } ${collapsed ? 'justify-center px-0' : 'px-4'}`}
                title={collapsed ? item.label : undefined}
              >
                {/* ICON BUBBLE (Vibrant colored circle when active) */}
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                    active
                      ? 'shadow-md shadow-black/40 scale-105'
                      : isLight
                      ? 'text-[#4B5563]'
                      : 'text-[#A5ADCA]'
                  }`}
                  style={{
                    backgroundColor: active ? item.accentColor : 'transparent',
                  }}
                >
                  <Icon
                    className={`h-4.5 w-4.5 ${
                      active
                        ? 'text-white'
                        : isLight
                        ? 'text-[#4B5563]'
                        : 'text-[#A5ADCA]'
                    }`}
                  />
                </div>

                {/* TEXT LABEL (Highlighted with matching accent color when active) */}
                {!collapsed && (
                  <span
                    className={`ml-3.5 font-bold text-xs uppercase tracking-wider truncate font-sans ${
                      active ? '' : isLight ? 'text-[#374151]' : 'text-[#A5ADCA]'
                    }`}
                    style={{
                      color: active ? item.accentColor : undefined,
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </NavLink>

              {/* BOTTOM SVG FILLET (curves the row below into the active cutout) */}
              {active && (
                <svg
                  className="absolute right-0 -bottom-6 w-6 h-6 pointer-events-none z-20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M0,0 C13.255,0 24,10.745 24,24 L24,0 Z" fill="#080A18" />
                </svg>
              )}
            </div>
          );
        })}
      </nav>

      {/* 3. Bottom Section: User Profile & Logout */}
      <div
        className={`pt-2 pb-3 border-t shrink-0 ${
          isLight ? 'border-[#E5E7EB]' : 'border-[#272B49]'
        }`}
      >
        {/* User Card */}
        <div
          onClick={() => {
            setMobileOpen(false);
            navigate('/admin/reports');
          }}
          className={`flex items-center gap-3 px-3.5 py-2 rounded-lg cursor-pointer transition-colors ${
            isLight ? 'hover:bg-[#F3F4F6]' : 'hover:bg-[#191B38]'
          } ${collapsed ? 'justify-center' : ''}`}
          title="Account Settings"
        >
          <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-[#E5E7EB] shrink-0 bg-[#F3F4F6] shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Admin Avatar"
              className="h-full w-full object-cover"
            />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span
                className={`text-xs font-bold uppercase tracking-wider truncate ${
                  isLight ? 'text-[#111827]' : 'text-[#F8FAFC]'
                }`}
              >
                {profile?.displayName || user?.email?.split('@')[0] || 'Alex Chen'}
              </span>
              <span className="text-[10px] text-[#737D9D] font-medium truncate">
                Chief Administrator
              </span>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            isLight
              ? 'text-[#374151] hover:text-[#EF4444] hover:bg-[#FEF2F2]'
              : 'text-[#A5ADCA] hover:text-[#EF4444] hover:bg-[#EF4444]/10'
          } ${collapsed ? 'justify-center px-0' : ''}`}
          title="Logout"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Subtle Theme Switcher Pill (Light / Dark Sidebar) */}
        {!collapsed && (
          <div className="px-4 pt-1 flex items-center justify-between text-[10px] text-[#737D9D]">
            <span>Sidebar Style</span>
            <button
              onClick={toggleSidebarTheme}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                isLight
                  ? 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]'
                  : 'bg-[#191B38] text-[#A5ADCA] border-[#272B49]'
              }`}
            >
              {isLight ? <Sun className="h-3 w-3 text-[#F59E0B]" /> : <Moon className="h-3 w-3 text-[#8B5CF6]" />}
              <span>{isLight ? 'White UI' : 'Dark UI'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar with smooth transition */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};
