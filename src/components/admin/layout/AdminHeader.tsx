import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileSidebar,
  collapsed,
  onToggleCollapse,
}) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('part') || q.includes('user') || q.includes('devin') || q.includes('aria')) {
      navigate(`/admin/participants?q=${encodeURIComponent(searchQuery)}`);
    } else if (q.includes('comp') || q.includes('grand') || q.includes('duel')) {
      navigate('/admin/competitions');
    } else if (q.includes('sub') || q.includes('eval')) {
      navigate('/admin/submissions');
    } else if (q.includes('round') || q.includes('quiz') || q.includes('cod')) {
      navigate('/admin/rounds');
    } else if (q.includes('lead') || q.includes('rank') || q.includes('result')) {
      navigate('/admin/leaderboard');
    } else {
      navigate(`/admin/questions?q=${encodeURIComponent(searchQuery)}`);
    }
    setSearchQuery('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-[#080A18]/90 backdrop-blur-md border-b border-[#272B49] transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        collapsed ? 'lg:left-20' : 'lg:left-64'
      } left-0`}
    >
      {/* Left: Mobile hamburger + Desktop toggle + Live Event Indicator */}
      <div className="flex items-center gap-3">
        {/* Mobile slide-out toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg bg-[#0088CC] text-white shadow-md shadow-[#0088CC]/30 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Desktop collapse/expand toggle button matching reference image */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg bg-[#0088CC] hover:bg-[#0077B5] text-white shadow-md shadow-[#0088CC]/30 transition-all cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#13162D] border border-[#272B49] text-xs">
          <Radio className="h-3.5 w-3.5 text-[#10B981] animate-pulse" />
          <span className="text-[#F8FAFC] font-medium">Code Battle 2026</span>
          <span className="text-[#737D9D]">•</span>
          <span className="text-[#8B5CF6] font-mono text-[11px] font-semibold">ROUND 2: CODING BATTLE</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737D9D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participants, questions, competitions..."
            className="w-full bg-[#13162D] border border-[#272B49] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 rounded-lg pl-9 pr-8 py-1.5 text-xs text-[#F8FAFC] placeholder-[#737D9D] transition-colors focus:outline-none"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#737D9D] bg-[#191B38] border border-[#272B49] rounded px-1.5 py-0.5">
            ↵
          </kbd>
        </form>
      </div>

      {/* Right: Notifications & Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#A5ADCA] hover:text-[#F8FAFC] hover:bg-[#191B38] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#8B5CF6] ring-2 ring-[#080A18]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#13162D] border border-[#272B49] shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#272B49] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F8FAFC]">System Notifications</span>
                <span className="text-[10px] text-[#8B5CF6] font-medium bg-[#6D28D9]/20 px-1.5 py-0.5 rounded">
                  3 unread
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#272B49]/50">
                <div className="p-3 hover:bg-[#191B38]/50 transition-colors flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#F8FAFC] font-medium">Coding Battle Started</p>
                    <p className="text-[11px] text-[#A5ADCA]">700 qualified participants entered Round 2.</p>
                    <span className="text-[10px] text-[#737D9D] mt-1 block">45 minutes ago</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-[#191B38]/50 transition-colors flex items-start gap-2.5">
                  <Activity className="h-4 w-4 text-[#3B82F6] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#F8FAFC] font-medium">Evaluation Spike</p>
                    <p className="text-[11px] text-[#A5ADCA]">8,900+ unit test assertions executed in last hour.</p>
                    <span className="text-[10px] text-[#737D9D] mt-1 block">1 hour ago</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-[#191B38]/50 transition-colors flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#F8FAFC] font-medium">Integrity Warning</p>
                    <p className="text-[11px] text-[#A5ADCA]">Candidate account usr-108 flagged for multi-session IP.</p>
                    <span className="text-[10px] text-[#737D9D] mt-1 block">2 hours ago</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-[#272B49] text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/admin/reports');
                  }}
                  className="text-[11px] text-[#8B5CF6] hover:text-[#A78BFA] font-medium"
                >
                  View System Audit Logs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#191B38] transition-colors cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-[#F8FAFC] ring-1 ring-[#8B5CF6]/50">
              {profile?.displayName
                ? profile.displayName.substring(0, 2).toUpperCase()
                : 'AD'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F8FAFC]">
                {profile?.displayName || user?.email?.split('@')[0] || 'Chief Admin'}
              </span>
              <span className="text-[10px] text-[#737D9D]">Lead Administrator</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#13162D] border border-[#272B49] shadow-2xl shadow-black/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2.5 border-b border-[#272B49]">
                <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                  {profile?.displayName || 'Administrator'}
                </p>
                <p className="text-[11px] text-[#737D9D] truncate">
                  {user?.email || 'admin@codebattle.dev'}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#10B981]">
                  <Shield className="h-3 w-3" /> Full Superadmin Access
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/admin/reports');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#A5ADCA] hover:text-[#F8FAFC] hover:bg-[#191B38] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-[#8B5CF6]" />
                  <span>Admin Profile &amp; Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/admin/reports');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#A5ADCA] hover:text-[#F8FAFC] hover:bg-[#191B38] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Activity className="h-3.5 w-3.5 text-[#8B5CF6]" />
                  <span>Security &amp; Audit Logs</span>
                </button>
              </div>

              <div className="border-t border-[#272B49] pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
