import { Link } from "react-router-dom";
import { Zap, LogOut, ShieldCheck, Users, Code, Award } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function AdminDashboard() {
  const { user, profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <header className="border-b border-border bg-bg-secondary/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-primary/20 ring-1 ring-cyan-primary/40">
              <Zap className="h-5 w-5 text-cyan-light" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Code<span className="text-cyan-light">Battle</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-primary/30 bg-cyan-primary/10 text-xs">
              <ShieldCheck className="h-4 w-4 text-cyan-light" />
              <span className="font-semibold text-cyan-light uppercase">ADMINISTRATOR</span>
            </div>

            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-danger px-3 py-2 rounded-lg border border-border hover:border-danger/30 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-cyan-primary/30 bg-cyan-primary/5 p-6 mb-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-cyan-light" />
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Administrator Control Center (Placeholder)
              </h1>
              <p className="text-xs text-text-secondary mt-1">
                Authenticated as: <strong className="text-text-primary">{user?.email}</strong> (UID: {user?.uid}) with verified role: <span className="text-cyan-light font-mono font-semibold">{profile?.role}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-bg-card/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-violet-light" />
              <h3 className="text-sm font-bold">Participant Management</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Review registered participants, email verification logs, and active competitors.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="h-5 w-5 text-cyan-light" />
              <h3 className="text-sm font-bold">Problem &amp; Challenge Editor</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Configure rounds, test cases, time limits, and scoring parameters.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-warning" />
              <h3 className="text-sm font-bold">Scoring &amp; Leaderboard Publish</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Review automated submissions, adjust final rankings, and publish results.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
