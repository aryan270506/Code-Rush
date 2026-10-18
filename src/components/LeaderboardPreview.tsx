import { motion } from "framer-motion";
import { ArrowRight, Crown, Info } from "lucide-react";
import { leaderboardData } from "../data/competition";

export default function LeaderboardPreview() {
  return (
    <section id="leaderboard" className="relative py-24 sm:py-32">
      <div className="bg-radial-glow absolute inset-0 pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="mb-3 inline-block rounded-full border border-violet-primary/30 bg-violet-primary/10 px-4 py-1 text-xs font-semibold tracking-widest text-violet-light uppercase">
            Rankings
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Live <span className="text-gradient">Leaderboard</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary sm:text-lg">
            Track scores and rankings in real time as the competition unfolds.
          </p>
        </motion.div>

        {/* Leaderboard card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 overflow-hidden rounded-2xl border border-border bg-bg-card/60"
        >
          {/* Demo notice */}
          <div className="flex items-center gap-2 border-b border-border bg-violet-primary/5 px-5 py-3">
            <Info className="h-4 w-4 text-violet-light shrink-0" />
            <span className="text-xs text-text-muted">
              Demonstration data — rankings are illustrative until connected to
              the backend.
            </span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[60px_1fr_100px_110px] items-center border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted sm:grid-cols-[80px_1fr_120px_130px]">
            <span>Rank</span>
            <span>Participant</span>
            <span className="text-right">Score</span>
            <span className="text-right">Status</span>
          </div>

          {/* Rows */}
          {leaderboardData.map((row, i) => (
            <div
              key={row.rank}
              className={`grid grid-cols-[60px_1fr_100px_110px] items-center px-5 py-4 transition-colors hover:bg-bg-card-hover/50 sm:grid-cols-[80px_1fr_120px_130px] ${
                i < leaderboardData.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              {/* Rank */}
              <span className="flex items-center gap-2">
                {row.rank <= 3 ? (
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      row.rank === 1
                        ? "bg-warning/15 text-warning"
                        : row.rank === 2
                        ? "bg-text-muted/15 text-text-secondary"
                        : "bg-warning/10 text-warning/70"
                    }`}
                  >
                    {row.rank === 1 ? (
                      <Crown className="h-3.5 w-3.5" />
                    ) : (
                      `#${row.rank}`
                    )}
                  </span>
                ) : (
                  <span className="pl-1.5 text-sm font-medium text-text-muted">
                    #{row.rank}
                  </span>
                )}
              </span>

              {/* Name */}
              <span className="text-sm font-medium text-text-primary">
                {row.name}
              </span>

              {/* Score */}
              <span className="text-right font-mono text-sm font-semibold text-text-primary">
                {row.score}
              </span>

              {/* Status */}
              <span className="flex justify-end">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    row.status === "Qualified"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {row.status}
                </span>
              </span>
            </div>
          ))}

          {/* Footer */}
          <div className="flex justify-center border-t border-border px-5 py-4">
            <button
              onClick={() => alert("Full leaderboard — coming soon")}
              className="group cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-violet-light transition-colors hover:text-violet-primary"
            >
              View Full Leaderboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
