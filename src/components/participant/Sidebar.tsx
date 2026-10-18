import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Swords,
  BarChart3,
  ListOrdered,
  FileCode2,
  Megaphone,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenLogoutDialog: () => void;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  onOpenLogoutDialog,
  isCollapsed,
  setIsCollapsed,
}) => {
  const location = useLocation();
  const { user } = useAuth();

  // Close mobile drawer on route change
  useEffect(() => {
    onCloseMobile();
  }, [location.pathname, onCloseMobile]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("cb_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Nav items configuration
  const navGroups: NavGroup[] = [
    {
      groupTitle: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/participant/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupTitle: "Competition",
      items: [
        {
          label: "Competition",
          href: "/participant/competition",
          icon: Swords,
          badge: "Pipeline",
          badgeColor: "violet",
        },
      ],
    },
    {
      groupTitle: "Analytics & Logs",
      items: [
        {
          label: "Leaderboard",
          href: "/participant/leaderboard",
          icon: ListOrdered,
        },
        {
          label: "My Performance",
          href: "/participant/performance",
          icon: BarChart3,
        },
        {
          label: "My Submissions",
          href: "/participant/submissions",
          icon: FileCode2,
        },
        {
          label: "Announcements",
          href: "/participant/announcements",
          icon: Megaphone,
        },
      ],
    },
    {
      groupTitle: "Account",
      items: [
        {
          label: "My Profile",
          href: "/participant/profile",
          icon: User,
        },
        {
          label: "Settings",
          href: "/participant/settings",
          icon: Settings,
        },
        {
          label: "Help & Support",
          href: "/participant/help",
          icon: HelpCircle,
        },
      ],
    },
  ];

  const renderBadge = (badge: string) => {
    const isLocked = badge === "locked";
    const isCompleted = badge === "completed";
    const isInProgress = badge === "in_progress";
    const isAvail = badge === "available";

    if (isLocked) {
      return (
        <span className="flex items-center gap-1 rounded bg-bg-primary px-1.5 py-0.5 text-[9px] font-medium text-text-muted border border-border">
          <Lock className="h-2.5 w-2.5" />
          <span>Locked</span>
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="rounded bg-success/15 px-1.5 py-0.5 text-[9px] font-medium text-success border border-success/30">
          Done
        </span>
      );
    }
    if (isInProgress) {
      return (
        <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[9px] font-medium text-warning border border-warning/30 animate-pulse">
          Active
        </span>
      );
    }
    if (isAvail) {
      return (
        <span className="rounded bg-cyan-primary/15 px-1.5 py-0.5 text-[9px] font-medium text-cyan-light border border-cyan-primary/30">
          Open
        </span>
      );
    }
    return null;
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden p-3 sm:p-4">
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-border">
          <Link
            to="/participant/dashboard"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-primary rounded-xl"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-primary/20 text-violet-light ring-1 ring-violet-primary/40 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-violet-light" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-text-primary">
                  Code<span className="text-violet-light">Battle</span>
                </span>
                <span className="text-[10px] font-mono tracking-wider text-text-muted uppercase">
                  Participant Arena
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-bg-card text-text-muted hover:bg-bg-card-hover hover:text-text-primary transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close mobile navigation"
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-bg-card text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="mt-5 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-3 pb-1 text-[10px] font-bold font-mono tracking-wider text-text-muted/70 uppercase select-none">
                  {group.groupTitle}
                </div>
              )}

              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.href ||
                    (item.href === "/participant/competition" &&
                      (location.pathname === "/participant/competition" ||
                        location.pathname.startsWith("/participant/rounds")));

                  return (
                    <div key={item.href} className="relative group">
                      <Link
                        to={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-violet-primary/15 text-white border border-violet-primary/40 shadow-sm shadow-violet-primary/20"
                            : "text-text-secondary hover:bg-bg-card hover:text-text-primary border border-transparent"
                        } ${isCollapsed && !isMobileOpen ? "justify-center px-0" : ""}`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? "text-violet-light" : "text-text-muted group-hover:text-text-primary"
                          }`}
                        />

                        {(!isCollapsed || isMobileOpen) && (
                          <div className="flex flex-1 items-center justify-between overflow-hidden">
                            <span className="truncate">{item.label}</span>
                            {item.badge && renderBadge(item.badge)}
                          </div>
                        )}
                      </Link>

                      {/* Tooltip in Collapsed Mode */}
                      {isCollapsed && !isMobileOpen && (
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 z-50 hidden group-hover:flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-1.5 text-xs font-semibold text-text-primary shadow-xl whitespace-nowrap"
                        >
                          <span>{item.label}</span>
                          {item.badge && renderBadge(item.badge)}
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rotate-45 border-l border-b border-border bg-bg-secondary" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile & Logout Footer */}
      <div className="pt-4 border-t border-border mt-6 space-y-2">
        {/* User Card */}
        <Link
          to="/participant/profile"
          className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-bg-card border border-transparent hover:border-border ${
            isCollapsed && !isMobileOpen ? "justify-center" : ""
          }`}
          title={isCollapsed ? user?.displayName || user?.email || "Profile" : undefined}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-primary/40 to-cyan-primary/30 border border-violet-light/30 text-xs font-bold text-violet-light shadow-inner">
            {(user?.displayName || user?.email || "P").charAt(0).toUpperCase()}
          </div>

          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-1 flex-col overflow-hidden text-left">
              <span className="truncate text-xs font-bold text-text-primary">
                {user?.displayName || "Participant"}
              </span>
              <span className="truncate text-[11px] text-text-muted">
                {user?.email}
              </span>
            </div>
          )}
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onOpenLogoutDialog}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-text-muted hover:bg-danger/10 hover:text-danger border border-transparent hover:border-danger/20 transition-colors cursor-pointer ${
            isCollapsed && !isMobileOpen ? "justify-center px-0" : ""
          }`}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 bg-[#08081a]/95 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out select-none ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-bg-primary/80 backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-bg-secondary border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
