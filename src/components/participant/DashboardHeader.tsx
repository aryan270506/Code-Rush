import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronRight,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Radio,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useParticipantData";

interface DashboardHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenLogoutDialog: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleMobileSidebar,
  onOpenLogoutDialog,
}) => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute breadcrumbs and title
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.includes("/rounds/quiz")) {
      return { title: "Round 1: Quiz Battle", group: "Competition" };
    }
    if (path.includes("/rounds/coding")) {
      return { title: "Round 2: Coding Battle", group: "Competition" };
    }
    if (path.includes("/rounds/debugging")) {
      return { title: "Round 3: Debugging Battle", group: "Competition" };
    }
    if (path.includes("/rounds/final")) {
      return { title: "Round 4: Final Battle", group: "Competition" };
    }
    if (path.includes("/leaderboard")) {
      return { title: "Global Leaderboard", group: "Rankings" };
    }
    if (path.includes("/performance")) {
      return { title: "My Performance & Analytics", group: "Insights" };
    }
    if (path.includes("/submissions")) {
      return { title: "Submission History", group: "Logs" };
    }
    if (path.includes("/announcements")) {
      return { title: "Contest Announcements", group: "Updates" };
    }
    if (path.includes("/profile")) {
      return { title: "Participant Profile", group: "Account" };
    }
    if (path.includes("/settings")) {
      return { title: "Account & Arena Settings", group: "Preferences" };
    }
    if (path.includes("/help")) {
      return { title: "Help & Rules", group: "Support" };
    }
    return { title: "Competition Arena", group: "Participant" };
  };

  const { title, group } = getPageInfo();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-[#070714]/80 backdrop-blur-md px-4 sm:px-6 select-none">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation sidebar"
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-card text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          {/* Breadcrumb row */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
            <Link to="/participant/dashboard" className="hover:text-violet-light transition-colors">
              Arena
            </Link>
            <ChevronRight className="h-3 w-3 text-text-muted/60" />
            <span className="text-text-secondary">{group}</span>
            <ChevronRight className="h-3 w-3 text-text-muted/60" />
            <span className="text-violet-light font-medium truncate max-w-[140px] sm:max-w-none">
              {title}
            </span>
          </div>

          {/* Dynamic Heading */}
          <h1 className="text-sm sm:text-base font-bold text-text-primary tracking-tight hidden sm:block">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Competition Status Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-violet-primary/30 bg-violet-primary/10 px-3 py-1 text-xs font-semibold text-violet-light">
          <Radio className="h-3 w-3 text-cyan-primary animate-pulse" />
          <span>Hackathon Active</span>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="View notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-card/70 text-text-muted hover:border-violet-primary/40 hover:text-text-primary transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-primary text-[10px] font-bold text-white shadow-sm shadow-violet-primary/50 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-bg-secondary p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-violet-primary/20 px-2 py-0.5 text-[10px] font-bold text-violet-light">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-violet-light hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-muted">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`rounded-xl p-3 text-xs transition-colors cursor-pointer border ${
                        notif.read
                          ? "bg-bg-card/40 border-border/40 text-text-muted"
                          : "bg-bg-card border-violet-primary/30 text-text-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-text-primary">{notif.title}</span>
                        <span className="text-[10px] font-mono text-text-muted shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <Link
                          to={notif.link}
                          onClick={() => setIsNotifOpen(false)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-light hover:underline"
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-xl border border-border bg-bg-card/70 p-1.5 sm:px-2.5 sm:py-1.5 hover:border-violet-primary/40 transition-colors cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-primary to-cyan-primary text-xs font-bold text-white shadow-sm">
              {(user?.displayName || user?.email || "P").charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-text-primary leading-tight truncate max-w-[110px]">
                {user?.displayName || "Participant"}
              </span>
              <span className="text-[10px] font-mono text-violet-light uppercase tracking-wider">
                {profile?.role || "Competitor"}
              </span>
            </div>
          </button>

          {/* User Menu Modal / Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-bg-secondary p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-border/80">
                <p className="text-xs font-bold text-text-primary truncate">
                  {user?.displayName || "Participant"}
                </p>
                <p className="text-[11px] font-mono text-text-muted truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              <div className="mt-1 space-y-0.5 text-xs">
                <Link
                  to="/participant/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
                >
                  <User className="h-4 w-4 text-violet-light" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/participant/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
                >
                  <Settings className="h-4 w-4 text-cyan-primary" />
                  <span>Settings</span>
                </Link>

                <Link
                  to="/participant/help"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-warning" />
                  <span>Help &amp; Support</span>
                </Link>

                <div className="pt-1 border-t border-border/80">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenLogoutDialog();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
