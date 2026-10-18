import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, ShieldAlert, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { participantService } from "../../services/participantService";
import { useAuth } from "../../context/AuthContext";
import type { CompetitionRound, RoundStatus } from "../../types/participant";

interface RoundAccessGuardProps {
  roundSlug: "quiz" | "coding" | "debugging" | "final";
  children: React.ReactNode;
}

export const RoundAccessGuard: React.FC<RoundAccessGuardProps> = ({
  roundSlug,
  children,
}) => {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [access, setAccess] = useState<{
    allowed: boolean;
    status: RoundStatus;
    reason?: string;
    requiredCutoff?: number;
    prerequisiteRound?: string;
    round?: CompetitionRound;
  } | null>(null);

  useEffect(() => {
    participantService.canAccessRound(roundSlug, user?.uid).then((res) => {
      setAccess(res);
      setChecking(false);
    });
  }, [roundSlug, user]);

  if (checking) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 text-violet-light animate-spin" />
        <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
          Verifying Authoritative Round Authorization...
        </span>
      </div>
    );
  }

  // If permitted, render round workspace
  if (access?.allowed) {
    return <>{children}</>;
  }

  // Access denied screen
  const isFailedCutoff = access?.status === "not_qualified";

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in text-center space-y-6">
      <div className="flex justify-center">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${
            isFailedCutoff
              ? "bg-danger/15 text-danger border-danger/30"
              : "bg-bg-card text-text-muted border-border"
          } shadow-2xl`}
        >
          {isFailedCutoff ? <ShieldAlert className="h-10 w-10" /> : <Lock className="h-10 w-10" />}
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-card px-3 py-1 font-mono text-[11px] font-bold text-text-muted uppercase">
          <span>Security &amp; Gatekeeper Notice</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {isFailedCutoff ? "Qualification Prerequisite Not Satisfied" : "Round Access Locked"}
        </h1>

        <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
          {access?.reason ||
            "You cannot enter this round until all preceding stage prerequisites and score cutoffs have been authoritatively validated by the judging system."}
        </p>
      </div>

      {access?.requiredCutoff !== undefined && (
        <div className="inline-flex items-center gap-4 rounded-2xl border border-border bg-bg-card/70 p-4 font-mono text-xs text-left">
          <div>
            <span className="text-text-muted text-[10px] uppercase block">Prerequisite Stage</span>
            <span className="text-violet-light font-bold">
              {access.prerequisiteRound || "Preceding Stage"}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-border" />
          <div>
            <span className="text-text-muted text-[10px] uppercase block">Required Cutoff</span>
            <span className="text-warning font-bold">{access.requiredCutoff} Points</span>
          </div>
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/participant/competition"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-violet-primary px-6 py-3 text-xs font-bold text-white shadow-lg shadow-violet-primary/25 hover:bg-violet-light transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Competition Pipeline</span>
        </Link>

        {roundSlug !== "quiz" && (
          <Link
            to="/participant/rounds/quiz"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-card px-5 py-3 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>Review Quiz Battle (Round 1)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
};
