import React from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Zap,
  Target,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Code2,
  Brain,
  Bug,
  Sparkles,
  Calendar,
  Flame,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  useParticipantRounds,
  useParticipantStats,
  useSubmissions,
  useCompetitionPipeline,
} from "../../hooks/useParticipantData";
import { StatusBadge } from "../../components/participant/StatusBadge";

export const ParticipantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { rounds } = useParticipantRounds();
  const { stats } = useParticipantStats();
  const { submissions } = useSubmissions();
  const { pipeline } = useCompetitionPipeline();

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

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Competitor";

  const currentRound = pipeline?.rounds.find((r) => r.id === pipeline.currentRoundNumber);
  const nextActionTargetUrl = pipeline?.nextAction?.roundSlug
    ? pipeline.nextAction.isAvailable
      ? `/participant/rounds/${pipeline.nextAction.roundSlug}`
      : "/participant/competition"
    : "/participant/competition";

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── 1. WELCOME HERO SECTION ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-primary/30 bg-gradient-to-r from-[#0f0e26] via-[#121235] to-[#0a182e] p-6 sm:p-8 shadow-2xl">
        {/* Futuristic background elements */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 h-48 w-48 rounded-full bg-cyan-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-primary/40 bg-violet-primary/20 px-3 py-1 text-xs font-semibold text-violet-light">
              <Flame className="h-3.5 w-3.5 text-warning animate-bounce" />
              <span>Season 2026 • Live Competition Arena</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              Welcome back, <span className="text-gradient">{displayName}</span>!
            </h1>

            <p className="text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed">
              {pipeline
                ? `Active in ${pipeline.name}. Current stage: ${currentRound?.name || "Stage 1"}. ${pipeline.nextAction.description}`
                : "Ready for your next battle? Review requirements, check test-case feedback, optimize your time complexity, and push for the podium."}
            </p>
          </div>

          {/* Quick CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to={nextActionTargetUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-primary to-violet-light px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-violet-primary/30 hover:opacity-95 transition-all"
            >
              <span>{pipeline?.nextAction.label || "Enter Competition"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/participant/competition"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-card/70 px-4 py-3 text-xs sm:text-sm font-semibold text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
            >
              <span>Competition Pipeline</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. FOUR KEY METRICS CARDS ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Score */}
        <div className="rounded-2xl border border-border bg-bg-card/70 p-5 backdrop-blur-sm hover:border-violet-primary/40 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted">
              Total Score
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-primary/15 text-violet-light group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary font-mono">
              {pipeline?.totalScore ?? stats?.totalScore ?? 0}
            </span>
            <span className="text-xs text-text-muted font-mono">
              / {pipeline?.maxScore ?? 800} pts
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-violet-light" />
            <span>
              {pipeline
                ? `${pipeline.roundsCompleted} of ${pipeline.totalRounds} rounds evaluated`
                : "Active Competition Score"}
            </span>
          </p>
        </div>

        {/* Card 2: Current Rank */}
        <div className="rounded-2xl border border-border bg-bg-card/70 p-5 backdrop-blur-sm hover:border-cyan-primary/40 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted">
              Current Rank
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-primary/15 text-cyan-light group-hover:scale-110 transition-transform">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-light font-mono">
              #{stats?.currentRank ?? 5}
            </span>
            <span className="text-xs text-text-muted font-mono">
              of {stats?.totalParticipants ?? 540}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-primary" />
            <span>Top 1.2% Provisional Tier</span>
          </p>
        </div>

        {/* Card 3: Rounds Completed */}
        <div className="rounded-2xl border border-border bg-bg-card/70 p-5 backdrop-blur-sm hover:border-success/40 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted">
              Rounds Completed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/15 text-success group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary font-mono">
              {pipeline?.roundsCompleted ?? 1}{" "}
              <span className="text-text-muted text-xl font-normal">
                / {pipeline?.totalRounds ?? 4}
              </span>
            </span>
            <span className="text-xs text-success font-medium">
              {pipeline ? `${pipeline.overallProgressPercentage}% Progress` : "Round 2 Live"}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success to-cyan-primary rounded-full transition-all duration-500"
              style={{ width: `${pipeline?.overallProgressPercentage ?? 25}%` }}
            />
          </div>
        </div>

        {/* Card 4: Qualification Status */}
        <div className="rounded-2xl border border-border bg-bg-card/70 p-5 backdrop-blur-sm hover:border-warning/40 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted">
              Qualification
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 text-warning group-hover:scale-110 transition-transform">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-xl sm:text-2xl font-bold ${
                pipeline?.rounds.some((r) => r.status === "not_qualified")
                  ? "text-danger"
                  : pipeline?.roundsCompleted === pipeline?.totalRounds
                  ? "text-cyan-light"
                  : "text-success"
              }`}
            >
              {pipeline?.rounds.some((r) => r.status === "not_qualified")
                ? "Not Qualified"
                : pipeline?.roundsCompleted === pipeline?.totalRounds
                ? "All Cleared"
                : "Active & Qualified"}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary truncate">
            {pipeline?.rounds.some((r) => r.status === "not_qualified")
              ? "Cutoff not reached in previous round"
              : pipeline?.roundsCompleted === pipeline?.totalRounds
              ? "All rounds completed"
              : `Current: ${currentRound?.name || "Stage 1"}`}
          </p>
        </div>
      </div>

      {/* ── 3. FOUR ROUNDS COMPETITION PROGRESS TRACKER ─────────────── */}
      <div className="rounded-3xl border border-border bg-bg-card/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
              <Target className="h-5 w-5 text-violet-light" />
              <span>Competition Arena Roadmap</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Advance through all 4 competitive stages to earn championship points.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-text-muted">
              <span className="inline-block h-2 w-2 rounded-full bg-success" /> Completed
              <span className="inline-block h-2 w-2 rounded-full bg-warning ml-2" /> In Progress
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-primary ml-2" /> Available
            </div>
            <Link
              to="/participant/competition"
              className="text-xs font-semibold text-violet-light hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View Full Pipeline</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Rounds Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(pipeline?.rounds || rounds).map((round, idx) => {
            const Icon = getRoundIcon(round.slug);
            const isRoundLocked = round.status === "locked" || round.status === "upcoming";
            const isCompleted = round.status === "completed" || round.status === "qualified";
            const isInProgress = round.status === "in_progress";

            return (
              <div
                key={round.id ? `round-${round.id}-${round.slug || idx}` : `round-idx-${idx}`}
                className={`relative rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  isInProgress
                    ? "border-warning/50 bg-warning/5 shadow-lg shadow-warning/5"
                    : isCompleted
                    ? "border-success/40 bg-success/5"
                    : isRoundLocked
                    ? "border-border/60 bg-bg-card/30 opacity-75"
                    : "border-cyan-primary/40 bg-cyan-primary/5 hover:border-cyan-primary/70"
                }`}
              >
                <div>
                  {/* Top line with stage and status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] font-bold text-text-muted uppercase">
                      Stage 0{round.id}
                    </span>
                    <StatusBadge status={round.status} size="sm" />
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isInProgress
                          ? "bg-warning/20 text-warning"
                          : isCompleted
                          ? "bg-success/20 text-success"
                          : isRoundLocked
                          ? "bg-bg-primary text-text-muted"
                          : "bg-cyan-primary/20 text-cyan-light"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-text-primary leading-tight">
                        {round.name.split(": ")[1] || round.name}
                      </h3>
                      <span className="text-[11px] font-mono text-text-muted">
                        Max: {round.maxScore} pts
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary line-clamp-2 mt-2 leading-relaxed">
                    {round.shortDescription}
                  </p>

                  {/* Score pill if scored */}
                  {round.currentScore !== undefined && round.currentScore > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-bg-card px-2.5 py-1 text-xs font-mono font-bold text-violet-light border border-border">
                      <Sparkles className="h-3 w-3" />
                      <span>Score: {round.currentScore} pts</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="mt-5 pt-3 border-t border-border/60">
                  {isRoundLocked ? (
                    <Link
                      to="/participant/competition"
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-bg-card/50 py-2 text-xs font-semibold text-text-muted hover:text-text-secondary hover:border-text-muted transition-colors text-center truncate px-2"
                    >
                      <Lock className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {round.unlockConditionText || "Locked • See Pipeline"}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to={`/participant/rounds/${round.slug}`}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                        isInProgress
                          ? "bg-warning text-black hover:bg-warning/90 shadow-md shadow-warning/20"
                          : isCompleted
                          ? "border border-success/40 bg-success/10 text-success hover:bg-success/20"
                          : "bg-violet-primary text-white hover:bg-violet-light shadow-md shadow-violet-primary/20"
                      }`}
                    >
                      <span>
                        {isInProgress
                          ? "Resume Battle"
                          : isCompleted
                          ? "Review Answers"
                          : "Enter Arena"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. SPLIT PERFORMANCE & UPCOMING SCHEDULE ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Performance Progression Summary (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-bg-card/50 p-6 sm:p-7 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-light" />
                  <span>Performance Breakdown</span>
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Round metrics and test suite execution accuracy.
                </p>
              </div>

              <Link
                to="/participant/performance"
                className="text-xs font-semibold text-violet-light hover:underline flex items-center gap-1"
              >
                <span>Full Analytics</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Visual SVG Progress Bar / Metric Bars */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-text-secondary">Round 1 (Quiz Accuracy)</span>
                  <span className="font-mono text-cyan-light font-bold">80% Accuracy</span>
                </div>
                <div className="h-2.5 w-full bg-bg-primary rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-violet-primary to-cyan-primary rounded-full"
                    style={{ width: "80%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-text-secondary">Round 2 (Coding Test Suites Passed)</span>
                  <span className="font-mono text-violet-light font-bold">12 / 18 Tests (67%)</span>
                </div>
                <div className="h-2.5 w-full bg-bg-primary rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-violet-primary to-warning rounded-full"
                    style={{ width: "67%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-text-secondary">Overall Hackathon Completion</span>
                  <span className="font-mono text-success font-bold">
                    {pipeline?.overallProgressPercentage ?? 25}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-bg-primary rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-primary to-success rounded-full transition-all duration-500"
                    style={{ width: `${pipeline?.overallProgressPercentage ?? 25}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Submissions Snippet */}
            <div className="mt-6 pt-5 border-t border-border">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted block mb-3">
                Recent Submissions
              </span>
              <div className="space-y-2">
                {submissions.slice(0, 2).map((sub, idx) => (
                  <div
                    key={sub.id || `sub-${idx}-${sub.problemTitle || "sub"}`}
                    className="flex items-center justify-between rounded-xl bg-bg-card p-3 border border-border text-xs"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Code2 className="h-4 w-4 text-violet-light shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-text-primary block truncate">
                          {sub.problemTitle}
                        </span>
                        <span className="text-[11px] font-mono text-text-muted">
                          {sub.language.toUpperCase()} • {sub.executionTimeMs}ms
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={sub.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Upcoming Contest Schedule & Announcements */}
        <div className="rounded-3xl border border-border bg-bg-card/50 p-6 sm:p-7 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Calendar className="h-4 w-4 text-warning" />
                <span>Round Schedule</span>
              </h3>
              <Clock className="h-4 w-4 text-text-muted" />
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative pl-5 border-l-2 border-success pb-3">
                <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-success" />
                <span className="text-[10px] font-mono text-success uppercase font-semibold">
                  Completed
                </span>
                <h4 className="text-xs font-bold text-text-primary mt-0.5">
                  Round 1: Quiz Battle
                </h4>
                <p className="text-[11px] text-text-muted">10:00 - 12:00 UTC</p>
              </div>

              <div className="relative pl-5 border-l-2 border-warning pb-3">
                <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-warning animate-pulse" />
                <span className="text-[10px] font-mono text-warning uppercase font-semibold">
                  Now Live
                </span>
                <h4 className="text-xs font-bold text-text-primary mt-0.5">
                  Round 2: Coding Battle
                </h4>
                <p className="text-[11px] text-text-muted">12:30 - 14:30 UTC</p>
              </div>

              <div className="relative pl-5 border-l-2 border-border pb-3">
                <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-text-muted" />
                <span className="text-[10px] font-mono text-text-muted uppercase font-semibold">
                  Upcoming
                </span>
                <h4 className="text-xs font-bold text-text-secondary mt-0.5">
                  Round 3: Debugging Battle
                </h4>
                <p className="text-[11px] text-text-muted">Starts today at 15:00 UTC</p>
              </div>

              <div className="relative pl-5 border-l-2 border-border">
                <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-text-muted" />
                <span className="text-[10px] font-mono text-text-muted uppercase font-semibold">
                  Championship
                </span>
                <h4 className="text-xs font-bold text-text-secondary mt-0.5">
                  Round 4: Final Battle
                </h4>
                <p className="text-[11px] text-text-muted">Starts today at 17:00 UTC</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Link
              to="/participant/announcements"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-bg-card py-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              <span>View Contest Announcements</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboardPage;
