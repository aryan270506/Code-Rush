import React from "react";
import { Link } from "react-router-dom";
import {
  Swords,
  Brain,
  Code2,
  Bug,
  Trophy,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Target,
  AlertCircle,
  Calendar,
  Flame,
  Loader2,
} from "lucide-react";
import { useCompetitionPipeline } from "../../hooks/useParticipantData";
import { StatusBadge } from "../../components/participant/StatusBadge";

export const CompetitionPipelinePage: React.FC = () => {
  const { pipeline, loading } = useCompetitionPipeline();

  const getRoundIcon = (slug: string) => {
    switch (slug) {
      case "quiz":
        return Brain;
      case "coding":
        return Code2;
      case "debugging":
        return Bug;
      case "final":
      default:
        return Trophy;
    }
  };

  if (loading && !pipeline) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Loader2 className="h-8 w-8 animate-spin text-violet-light" />
          <p className="text-sm">Synchronizing competition pipeline...</p>
        </div>
      </div>
    );
  }

  const getRoundBorderColor = (status: string) => {
    switch (status) {
      case "qualified":
      case "completed":
        return "border-success/40 bg-success/5";
      case "in_progress":
        return "border-warning/50 bg-warning/5 shadow-lg shadow-warning/5";
      case "available":
        return "border-cyan-primary/50 bg-cyan-primary/5 shadow-lg shadow-cyan-primary/5";
      case "under_evaluation":
      case "submitted":
        return "border-amber-500/40 bg-amber-500/5";
      case "not_qualified":
        return "border-danger/40 bg-danger/5";
      case "locked":
      default:
        return "border-border/60 bg-bg-card/30 opacity-80";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── 1. COMPETITION LIFECYCLE HERO BANNER ──────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-primary/40 bg-gradient-to-r from-[#110e2f] via-[#101035] to-[#08182b] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 h-48 w-48 rounded-full bg-cyan-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-primary/40 bg-violet-primary/20 px-3 py-1 font-mono text-xs font-bold text-violet-light">
                <Flame className="h-3.5 w-3.5 text-warning animate-pulse" />
                <span>Unified Competition Pipeline</span>
              </span>
              <span className="rounded-full bg-cyan-primary/15 text-cyan-light px-3 py-1 text-xs font-bold border border-cyan-primary/30">
                Live Hackathon
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              {pipeline?.name || "Code Battle Hackathon 2026"}
            </h1>

            <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
              Complete each stage sequentially. Automatic qualification gates evaluate your score
              and code correctness to grant access to subsequent challenge arenas.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-violet-light" />
                <span>Start: 10:00 UTC</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-light" />
                <span>Close: 22:00 UTC</span>
              </span>
              <span>•</span>
              <span className="text-violet-light font-bold">
                Current: Stage 0{pipeline?.currentRoundNumber || 1}
              </span>
            </div>
          </div>

          {/* Quick Metrics Tile */}
          <div className="shrink-0 flex items-center gap-3 sm:gap-4 bg-bg-card/80 p-4 rounded-2xl border border-border backdrop-blur-md">
            <div className="text-center px-3">
              <span className="text-[10px] font-mono uppercase text-text-muted block">Score</span>
              <span className="font-mono text-2xl font-extrabold text-violet-light">
                {pipeline?.totalScore ?? 0}
              </span>
              <span className="text-[10px] font-mono text-text-muted block">/ {pipeline?.maxScore ?? 750}</span>
            </div>
            <div className="h-10 w-[1px] bg-border" />
            <div className="text-center px-3">
              <span className="text-[10px] font-mono uppercase text-text-muted block">Completed</span>
              <span className="font-mono text-2xl font-extrabold text-cyan-light">
                {pipeline?.roundsCompleted ?? 0} <span className="text-sm font-normal text-text-muted">/ 4</span>
              </span>
              <span className="text-[10px] font-mono text-text-muted block">Stages</span>
            </div>
            <div className="h-10 w-[1px] bg-border" />
            <div className="text-center px-3">
              <span className="text-[10px] font-mono uppercase text-text-muted block">Progress</span>
              <span className="font-mono text-2xl font-extrabold text-success">
                {pipeline?.overallProgressPercentage ?? 0}%
              </span>
              <span className="text-[10px] font-mono text-text-muted block">Pipeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. NEXT AVAILABLE ACTION CALLOUT ─────────────────────────── */}
      {pipeline?.nextAction && (
        <div className="rounded-3xl border border-violet-primary/30 bg-gradient-to-r from-violet-primary/10 via-bg-card/70 to-cyan-primary/10 p-5 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-primary/20 text-violet-light ring-1 ring-violet-primary/40 shadow-inner">
              <Target className="h-6 w-6 text-violet-light" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-violet-light tracking-wider block">
                Recommended Next Step
              </span>
              <h2 className="text-base sm:text-lg font-bold text-text-primary mt-0.5">
                {pipeline.nextAction.label}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5 max-w-xl">
                {pipeline.nextAction.description}
              </p>
            </div>
          </div>

          <Link
            to={`/participant/rounds/${pipeline.nextAction.roundSlug}`}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-primary to-cyan-primary px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-primary/25 hover:opacity-95 transition-all"
          >
            <span>{pipeline.nextAction.label}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* ── 3. VISUAL ROUND PIPELINE TRACKER ────────────────────────── */}
      <div className="rounded-3xl border border-border bg-bg-card/50 p-6 sm:p-8 backdrop-blur-md space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
              <Swords className="h-5 w-5 text-violet-light" />
              <span>Competition Stage Lifecycle</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Stages unlock sequentially based on verified score qualification thresholds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span>Qualified</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              <span>In Progress</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-primary" />
              <span>Available</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-text-muted" />
              <span>Locked</span>
            </span>
          </div>
        </div>

        {/* Desktop Pipeline Roadmap: Connected cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {pipeline?.rounds.map((round) => {
            const Icon = getRoundIcon(round.slug);
            const isLocked = round.status === "locked";
            const isCompleted = round.status === "completed" || round.status === "qualified";
            const isInProgress = round.status === "in_progress";
            const isAvailable = round.status === "available";
            const isFailed = round.status === "not_qualified";

            return (
              <div
                key={round.id}
                className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all ${getRoundBorderColor(
                  round.status
                )}`}
              >
                <div>
                  {/* Stage number & status pill */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-text-muted uppercase">
                      Stage 0{round.id}
                    </span>
                    <StatusBadge status={round.status} size="sm" />
                  </div>

                  {/* Header & Icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isCompleted
                          ? "bg-success/20 text-success"
                          : isInProgress
                          ? "bg-warning/20 text-warning"
                          : isAvailable
                          ? "bg-cyan-primary/20 text-cyan-light"
                          : isFailed
                          ? "bg-danger/20 text-danger"
                          : "bg-bg-primary text-text-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-text-primary leading-tight">
                        {round.name.split(": ")[1] || round.name}
                      </h3>
                      <span className="text-[11px] font-mono text-text-muted">
                        Max: {round.maxScore} pts • {round.durationMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {round.shortDescription}
                  </p>

                  {/* Qualification Criteria Pill */}
                  <div className="mt-4 rounded-xl border border-border/80 bg-bg-secondary/70 p-2.5 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Cutoff Target:</span>
                      <strong className="text-text-primary">{round.qualificationCutoff} pts</strong>
                    </div>
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Earned Score:</span>
                      <strong
                        className={
                          round.currentScore && round.currentScore >= round.qualificationCutoff
                            ? "text-success"
                            : "text-violet-light"
                        }
                      >
                        {round.currentScore ?? 0} pts
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-6 pt-4 border-t border-border/60">
                  {isLocked ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-bg-card/40 py-2.5 text-xs font-semibold text-text-muted cursor-not-allowed"
                      title={round.unlockConditionText}
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>{round.unlockConditionText}</span>
                    </button>
                  ) : isFailed ? (
                    <Link
                      to={`/participant/rounds/${round.slug}`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-danger/40 bg-danger/10 py-2.5 text-xs font-semibold text-danger hover:bg-danger/20 transition-colors"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Cutoff Not Met (Review)</span>
                    </Link>
                  ) : isCompleted ? (
                    <Link
                      to={`/participant/rounds/${round.slug}`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-success/40 bg-success/10 py-2.5 text-xs font-semibold text-success hover:bg-success/20 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Review Solutions</span>
                    </Link>
                  ) : isInProgress ? (
                    <Link
                      to={`/participant/rounds/${round.slug}`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-warning py-2.5 text-xs font-bold text-black shadow-md shadow-warning/20 hover:bg-warning/90 transition-all"
                    >
                      <span>Resume Battle</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to={`/participant/rounds/${round.slug}`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-violet-primary py-2.5 text-xs font-bold text-white shadow-md shadow-violet-primary/20 hover:bg-violet-light transition-all"
                    >
                      <span>Start Round</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompetitionPipelinePage;
