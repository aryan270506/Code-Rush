import React from "react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Layers,
  HelpCircle,
  FileCheck2,
  Sliders,
  Award,
  Settings,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import {
  SharedSidebar,
  type SharedNavGroup,
} from "../../common/SharedSidebar";

export interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenLogoutDialog?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenLogoutDialog,
}) => {
  const { user, profile } = useAuth();

  const navGroups: SharedNavGroup[] = [
    {
      groupTitle: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      groupTitle: "Competition Management",
      items: [
        {
          label: "Competitions",
          href: "/admin/competitions",
          icon: Trophy,
        },
        {
          label: "Rounds",
          href: "/admin/rounds",
          icon: Layers,
        },
        {
          label: "Questions",
          href: "/admin/questions",
          icon: HelpCircle,
        },
      ],
    },
    {
      groupTitle: "Participants & Submissions",
      items: [
        {
          label: "Participants",
          href: "/admin/participants",
          icon: Users,
        },
        {
          label: "Submissions",
          href: "/admin/submissions",
          icon: FileCheck2,
        },
        {
          label: "Scoring & Cutoffs",
          href: "/admin/scoring",
          icon: Sliders,
        },
      ],
    },
    {
      groupTitle: "Results & System",
      items: [
        {
          label: "Leaderboard",
          href: "/admin/leaderboard",
          icon: Award,
        },
        {
          label: "Settings & Reports",
          href: "/admin/reports",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <SharedSidebar
      isMobileOpen={mobileOpen}
      onCloseMobile={() => setMobileOpen(false)}
      onOpenLogoutDialog={onOpenLogoutDialog || (() => {})}
      isCollapsed={collapsed}
      setIsCollapsed={setCollapsed}
      brandTitle="CodeBattle"
      brandSubtitle="Admin Console"
      brandHref="/admin"
      navGroups={navGroups}
      storageKey="cb_admin_sidebar_collapsed"
      user={{
        displayName: profile?.displayName || user?.displayName || "Admin Operator",
        email: profile?.email || user?.email || "admin@codebattle.dev",
        role: "admin",
      }}
    />
  );
};

export default AdminSidebar;
