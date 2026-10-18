import React from "react";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  SharedSidebar,
  type SharedNavGroup,
} from "../common/SharedSidebar";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenLogoutDialog: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  onOpenLogoutDialog,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { user } = useAuth();

  const navGroups: SharedNavGroup[] = [
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

  return (
    <SharedSidebar
      isMobileOpen={isMobileOpen}
      onCloseMobile={onCloseMobile}
      onOpenLogoutDialog={onOpenLogoutDialog}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      brandTitle="CodeBattle"
      brandSubtitle="Participant Arena"
      brandHref="/participant/dashboard"
      navGroups={navGroups}
      storageKey="cb_sidebar_collapsed"
      user={user}
    />
  );
};

export default Sidebar;
