import React from "react";
import {
  Lock,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
} from "lucide-react";
import type { RoundStatus, SubmissionStatus } from "../../types/participant";

interface StatusBadgeProps {
  status: RoundStatus | SubmissionStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = "unknown",
  size = "md",
  className = "",
}) => {
  const safeStatus = typeof status === "string" ? status : String(status || "unknown");
  const norm = (safeStatus || "unknown").toLowerCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  }[size];

  // Round Statuses
  if (norm === "available") {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-cyan-primary/10 text-cyan-light border border-cyan-primary/30 ${sizeClasses} ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-primary animate-pulse" />
        Available
      </span>
    );
  }

  if (norm === "in_progress" || norm === "running") {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-warning/15 text-warning border border-warning/30 ${sizeClasses} ${className}`}
      >
        <PlayCircle className="h-3 w-3 animate-spin" />
        In Progress
      </span>
    );
  }

  if (norm === "completed" || norm === "accepted") {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-success/15 text-success border border-success/30 ${sizeClasses} ${className}`}
      >
        <CheckCircle2 className="h-3 w-3" />
        {status === "Accepted" ? "Accepted" : "Completed"}
      </span>
    );
  }

  if (norm === "qualified") {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-violet-primary/20 text-violet-light border border-violet-primary/40 shadow-sm shadow-violet-primary/20 ${sizeClasses} ${className}`}
      >
        <Award className="h-3 w-3 text-violet-light" />
        Qualified
      </span>
    );
  }

  if (norm === "locked") {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-bg-card text-text-muted border border-border ${sizeClasses} ${className}`}
      >
        <Lock className="h-3 w-3 text-text-muted" />
        Locked
      </span>
    );
  }

  if (norm === "upcoming") {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-bg-card-hover text-text-secondary border border-border ${sizeClasses} ${className}`}
      >
        <Clock className="h-3 w-3 text-text-secondary" />
        Upcoming
      </span>
    );
  }

  if (norm === "submitted" || norm === "under_evaluation" || norm === "awaiting_evaluation" || norm === "pending") {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses} ${className}`}
      >
        <Clock className="h-3 w-3 animate-spin" />
        {norm === "submitted" ? "Submitted" : "Under Evaluation"}
      </span>
    );
  }

  if (norm === "not_qualified") {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-danger/15 text-danger border border-danger/30 ${sizeClasses} ${className}`}
      >
        <AlertCircle className="h-3 w-3" />
        Not Qualified
      </span>
    );
  }

  if (norm === "expired") {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-bg-card text-text-muted border border-border ${sizeClasses} ${className}`}
      >
        <Clock className="h-3 w-3 text-text-muted" />
        Expired
      </span>
    );
  }

  if (
    norm === "wrong answer" ||
    norm === "failed" ||
    norm === "compilation error" ||
    norm === "runtime error" ||
    norm === "time limit exceeded"
  ) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-danger/15 text-danger border border-danger/30 ${sizeClasses} ${className}`}
      >
        <AlertCircle className="h-3 w-3" />
        {status}
      </span>
    );
  }

  // Default fallback
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-bg-card text-text-secondary border border-border ${sizeClasses} ${className}`}
    >
      <Sparkles className="h-3 w-3 text-violet-light" />
      {status}
    </span>
  );
};
