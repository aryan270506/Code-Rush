import React, { useState } from "react";
import {
  Trophy,
  Search,
  Crown,
  Award,
  Sparkles,
  Radio,
  Building,
} from "lucide-react";
import { useLeaderboard } from "../../hooks/useParticipantData";
import { StatusBadge } from "../../components/participant/StatusBadge";
import { useAuth } from "../../context/AuthContext";

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { leaderboard } = useLeaderboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLiveView, setIsLiveView] = useState(true);

  // Filter leaderboard
  const filteredList = leaderboard.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.displayName.toLowerCase().includes(q) ||
      (item.institution && item.institution.toLowerCase().includes(q))
    );
  });

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-violet-primary/30 bg-bg-card/70 p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-light uppercase tracking-wider mb-1">
            <Trophy className="h-4 w-4 text-warning" />
            <span>Official Rankings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Code Battle Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time standings across all four hackathon rounds.
          </p>
        </div>

        {/* Live vs Official Toggle */}
        <div className="flex items-center gap-3 bg-bg-secondary p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setIsLiveView(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isLiveView
                ? "bg-violet-primary text-white shadow-md shadow-violet-primary/25"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Radio className="h-3 w-3 text-cyan-primary animate-pulse" />
            <span>Live Standings</span>
          </button>
          <button
            onClick={() => setIsLiveView(false)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !isLiveView
                ? "bg-violet-primary text-white shadow-md shadow-violet-primary/25"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Award className="h-3 w-3" />
            <span>Official Audit</span>
          </button>
        </div>
      </div>

      {/* ── TOP 3 PODIUM CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Rank 2 (Silver) */}
        {top3[1] && (
          <div className="order-2 md:order-1 rounded-3xl border border-slate-500/40 bg-gradient-to-b from-[#131628] to-[#0c0d1b] p-6 text-center space-y-4 shadow-xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-400 text-black font-extrabold font-mono text-xs shadow-md">
              #2
            </div>
            <div className="flex justify-center pt-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-400/20 text-slate-300 ring-2 ring-slate-400/40 font-bold text-xl">
                {top3[1].displayName.charAt(0)}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">{top3[1].displayName}</h3>
              <p className="text-xs text-text-muted">{top3[1].institution}</p>
            </div>
            <div className="pt-3 border-t border-border font-mono">
              <span className="text-2xl font-extrabold text-slate-300">{top3[1].totalScore}</span>
              <span className="text-xs text-text-muted ml-1">pts</span>
            </div>
          </div>
        )}

        {/* Rank 1 (Gold / Champion) */}
        {top3[0] && (
          <div className="order-1 md:order-2 rounded-3xl border border-warning/50 bg-gradient-to-b from-[#251b0f] via-[#161226] to-[#0d0d1e] p-7 text-center space-y-4 shadow-2xl relative md:-translate-y-4">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-warning px-3 py-1 text-black font-extrabold font-mono text-xs shadow-lg">
              <Crown className="h-3.5 w-3.5" />
              <span>CHAMPION</span>
            </div>
            <div className="flex justify-center pt-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/20 text-warning ring-2 ring-warning/60 font-extrabold text-2xl shadow-lg shadow-warning/10">
                {top3[0].displayName.charAt(0)}
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-text-primary flex items-center justify-center gap-1.5">
                <span>{top3[0].displayName}</span>
                <Sparkles className="h-4 w-4 text-warning" />
              </h3>
              <p className="text-xs text-text-muted">{top3[0].institution}</p>
            </div>
            <div className="pt-3 border-t border-border font-mono">
              <span className="text-3xl font-extrabold text-warning">{top3[0].totalScore}</span>
              <span className="text-xs text-text-muted ml-1">pts</span>
            </div>
          </div>
        )}

        {/* Rank 3 (Bronze) */}
        {top3[2] && (
          <div className="order-3 md:order-3 rounded-3xl border border-amber-700/40 bg-gradient-to-b from-[#1c1314] to-[#0d0d1c] p-6 text-center space-y-4 shadow-xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white font-extrabold font-mono text-xs shadow-md">
              #3
            </div>
            <div className="flex justify-center pt-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-600/20 text-amber-500 ring-2 ring-amber-600/40 font-bold text-xl">
                {top3[2].displayName.charAt(0)}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">{top3[2].displayName}</h3>
              <p className="text-xs text-text-muted">{top3[2].institution}</p>
            </div>
            <div className="pt-3 border-t border-border font-mono">
              <span className="text-2xl font-extrabold text-amber-500">{top3[2].totalScore}</span>
              <span className="text-xs text-text-muted ml-1">pts</span>
            </div>
          </div>
        )}
      </div>

      {/* ── SEARCH & TABLE ──────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-bg-card/50 backdrop-blur-md overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by participant or institution..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-bg-secondary text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-violet-primary"
            />
          </div>

          <span className="text-xs font-mono text-text-muted">
            Displaying {filteredList.length} Competitors
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08081a] border-b border-border text-[11px] font-mono uppercase text-text-muted">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Participant</th>
                <th className="px-4 py-3.5 text-center">R1 (Quiz)</th>
                <th className="px-4 py-3.5 text-center">R2 (Coding)</th>
                <th className="px-4 py-3.5 text-center">R3 (Debug)</th>
                <th className="px-4 py-3.5 text-center">R4 (Final)</th>
                <th className="px-5 py-3.5 text-right">Total Score</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredList.map((entry) => {
                const isCurrentUser =
                  entry.isCurrentParticipant ||
                  entry.userId === user?.uid ||
                  entry.displayName.includes("You");

                return (
                  <tr
                    key={entry.userId}
                    className={`transition-colors ${
                      isCurrentUser
                        ? "bg-violet-primary/10 border-l-4 border-l-violet-primary font-medium"
                        : "hover:bg-bg-card-hover"
                    }`}
                  >
                    <td className="px-5 py-4 font-mono font-bold">
                      {entry.rank === 1 ? (
                        <span className="text-warning flex items-center gap-1">
                          <Crown className="h-3.5 w-3.5" />
                          <span>1</span>
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="text-slate-300">#2</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-amber-500">#3</span>
                      ) : (
                        <span className="text-text-muted">#{entry.rank}</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-bg-secondary border border-border font-bold text-violet-light">
                          {entry.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-primary">
                              {entry.displayName}
                            </span>
                            {isCurrentUser && (
                              <span className="rounded bg-violet-primary/30 text-violet-light text-[9px] px-1.5 py-0.5 font-bold uppercase">
                                You
                              </span>
                            )}
                          </div>
                          {entry.institution && (
                            <span className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                              <Building className="h-3 w-3" />
                              <span>{entry.institution}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-text-secondary">
                      {entry.roundScores.round1}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-text-secondary">
                      {entry.roundScores.round2}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-text-secondary">
                      {entry.roundScores.round3}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-text-secondary">
                      {entry.roundScores.round4}
                    </td>

                    <td className="px-5 py-4 text-right font-mono font-extrabold text-sm text-cyan-light">
                      {entry.totalScore} pts
                    </td>

                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={entry.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
