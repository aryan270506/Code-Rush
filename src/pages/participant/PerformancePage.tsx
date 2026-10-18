import React from "react";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Sparkles,
} from "lucide-react";
import { useParticipantStats } from "../../hooks/useParticipantData";

export const PerformancePage: React.FC = () => {
  const { stats } = useParticipantStats();

  const totalScore = stats?.totalScore ?? 260;
  const rank = stats?.currentRank ?? 5;
  const accuracy = stats?.accuracy ?? 80;
  const passRate = stats?.codePassRate ?? 67;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="rounded-3xl border border-violet-primary/30 bg-bg-card/70 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-light uppercase tracking-wider mb-2">
          <BarChart3 className="h-4 w-4" />
          <span>Analytics &amp; Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Performance Analytics
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
          Comprehensive breakdown of your problem-solving velocity, algorithmic test case pass
          rates, and competitive ranking progression.
        </p>
      </div>

      {/* 4 Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-border bg-bg-card/60 p-5">
          <span className="text-xs font-bold font-mono uppercase text-text-muted">Total Score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-violet-light font-mono">{totalScore}</span>
            <span className="text-xs text-text-muted font-mono">/ 800 max</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">Across completed rounds</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg-card/60 p-5">
          <span className="text-xs font-bold font-mono uppercase text-text-muted">Provisional Rank</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-light font-mono">#{rank}</span>
            <span className="text-xs text-text-muted font-mono">of 540</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">Top 1.2% Percentile</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg-card/60 p-5">
          <span className="text-xs font-bold font-mono uppercase text-text-muted">Quiz Accuracy</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-success font-mono">{accuracy}%</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">Round 1 Fundamental MCQs</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg-card/60 p-5">
          <span className="text-xs font-bold font-mono uppercase text-text-muted">Test Pass Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-warning font-mono">{passRate}%</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">Hidden &amp; sample test suites</p>
        </div>
      </div>

      {/* ── CHARTS & VISUAL PROGRESSION ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Score Curve (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-bg-card/50 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-primary" />
                <span>Cumulative Score Progression</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Points accumulated as each challenge stage unlocks.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-light font-bold">260 pts</span>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="mt-4 pt-4 border-t border-border">
            <svg
              viewBox="0 0 500 200"
              className="w-full h-52 overflow-visible select-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1e1e4a" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#1e1e4a" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#1e1e4a" strokeDasharray="4 4" />

              {/* Area */}
              <path
                d="M 20 180 Q 140 100, 250 80 T 500 40 L 500 180 L 20 180 Z"
                fill="url(#scoreGrad)"
              />

              {/* Curve Line */}
              <path
                d="M 20 180 Q 140 100, 250 80 T 500 40"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Points */}
              <circle cx="20" cy="180" r="5" fill="#06b6d4" />
              <circle cx="160" cy="95" r="5" fill="#7c3aed" />
              <circle cx="340" cy="65" r="5" fill="#a78bfa" />
              <circle cx="500" cy="40" r="6" fill="#10b981" />
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between font-mono text-[11px] text-text-muted pt-3">
              <span>Start</span>
              <span>Round 1 (Quiz)</span>
              <span>Round 2 (Code)</span>
              <span>Round 3 (Debug)</span>
              <span>Round 4 (Final)</span>
            </div>
          </div>
        </div>

        {/* Skill Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-bg-card/50 p-6 backdrop-blur-md space-y-5">
          <div>
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-light" />
              <span>Competency Matrix</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Assessed from submissions &amp; code analysis.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-secondary">Algorithmic Complexity</span>
                <span className="text-cyan-light font-bold">92%</span>
              </div>
              <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden border border-border">
                <div className="h-full bg-cyan-primary rounded-full w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-secondary">Data Structures &amp; Trees</span>
                <span className="text-violet-light font-bold">85%</span>
              </div>
              <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden border border-border">
                <div className="h-full bg-violet-primary rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-secondary">Code Optimization &amp; Speed</span>
                <span className="text-warning font-bold">78%</span>
              </div>
              <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden border border-border">
                <div className="h-full bg-warning rounded-full w-[78%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-secondary">Debugging &amp; Invariants</span>
                <span className="text-success font-bold">70%</span>
              </div>
              <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden border border-border">
                <div className="h-full bg-success rounded-full w-[70%]" />
              </div>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="rounded-2xl border border-violet-primary/30 bg-violet-primary/10 p-4 space-y-1.5 text-xs">
            <span className="font-bold text-violet-light flex items-center gap-1.5 font-mono uppercase">
              <Zap className="h-3.5 w-3.5" />
              <span>Diagnostic Insights</span>
            </span>
            <p className="text-text-secondary leading-relaxed">
              Strong performance in bitwise XOR tree manipulations. Recommendation: review boundary
              overflow invariants when indexing zero-length arrays in the upcoming Debugging round.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
