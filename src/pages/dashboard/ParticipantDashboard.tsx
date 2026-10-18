import { Link } from "react-router-dom";
import { Zap, LogOut, CheckCircle2, Shield, User, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function ParticipantDashboard() {
  const { user, profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Top Navigation */}
      <header className="border-b border-border bg-bg-secondary/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-primary/20 ring-1 ring-violet-primary/40">
              <Zap className="h-5 w-5 text-violet-light" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Code<span className="text-violet-light">Battle</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-bg-card/50 text-xs">
              <User className="h-3.5 w-3.5 text-violet-light" />
              <span>{user?.displayName || user?.email}</span>
              <span className="ml-1.5 rounded bg-violet-primary/20 text-violet-light px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                {profile?.role || "participant"}
              </span>
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Verification Success Strip */}
        <div className="rounded-2xl border border-success/30 bg-success/5 p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/20 text-success ring-1 ring-success/40">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">
                Account Active &amp; Verified
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Your email <strong className="text-text-primary">{user?.email}</strong> is verified via 6-digit OTP. You are eligible to participate in all hackathon rounds.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
            Verified Participant
          </span>
        </div>

        {/* Dashboard Placeholder Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Welcome Card */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-bg-card/60 p-6 sm:p-8">
            <div className="inline-block rounded-full bg-violet-primary/10 border border-violet-primary/30 px-3 py-0.5 text-xs font-semibold text-violet-light uppercase tracking-wider mb-4">
              Participant Portal Placeholder
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.displayName || "Competitor"}!
            </h1>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Authentication and role authorization are fully configured. The full competition dashboard (live code execution, quiz rounds, and real-time leaderboard integration) will be connected in Phase 2.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-primary/25 hover:bg-violet-light transition-all"
              >
                <span>View Competition Schedule</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Account Profile Status */}
          <div className="rounded-2xl border border-border bg-bg-card/60 p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
              <Shield className="h-4 w-4 text-violet-light" />
              <span>Security Profile</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-text-muted block">User ID (UID)</span>
                <span className="font-mono text-[11px] text-text-primary truncate block mt-0.5">
                  {user?.uid}
                </span>
              </div>

              <div>
                <span className="text-text-muted block">Verified Role</span>
                <span className="font-semibold text-violet-light mt-0.5 inline-block uppercase">
                  {profile?.role || "participant"}
                </span>
              </div>

              <div>
                <span className="text-text-muted block">Account Status</span>
                <span className="font-semibold text-success mt-0.5 inline-block capitalize">
                  {profile?.accountStatus || "active"}
                </span>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-text-muted block">Competition Access</span>
                <span className="text-text-secondary mt-0.5 inline-block">
                  Rounds 1–4 Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Competition Rounds Preview */}
        <div className="mt-8">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-warning" />
            <span>Upcoming Rounds</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id: 1, name: "Quiz Battle", status: "Upcoming", color: "violet" },
              { id: 2, name: "Coding Battle", status: "Upcoming", color: "cyan" },
              { id: 3, name: "Debugging Battle", status: "Upcoming", color: "violet" },
              { id: 4, name: "Final Battle", status: "Upcoming", color: "cyan" },
            ].map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-bg-card/40 p-4 transition-colors hover:border-violet-primary/30"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-text-muted">Round {r.id}</span>
                  <span className="rounded bg-violet-primary/10 text-violet-light px-2 py-0.5 text-[10px] font-medium">
                    {r.status}
                  </span>
                </div>
                <p className="font-bold text-sm text-text-primary">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
