import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, LogOut } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../hooks/useAuth";

export default function UnauthorizedPage() {
  const { user, profile, logout } = useAuth();

  return (
    <AuthLayout
      badge="Security Notice"
      title="Access Restricted"
      subtitle="You do not have the required permissions to access this area."
    >
      <div className="space-y-6 text-center py-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/15 ring-1 ring-danger/30 text-danger">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div>
          <h3 className="text-base font-bold text-text-primary">
            Insufficient Privileges
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            This section is restricted to authorized competition administrators.
            Your current account role is{" "}
            <span className="font-semibold text-violet-light font-mono">
              {profile?.role || (user ? "participant" : "unauthenticated")}
            </span>
            .
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {user ? (
            <Link
              to="/participant/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-violet-primary py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-primary/25 hover:bg-violet-light transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go to Participant Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-violet-primary py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-primary/25 hover:bg-violet-light transition-all"
            >
              <span>Sign In with an Authorized Account</span>
            </Link>
          )}

          <div className="flex items-center justify-center gap-4 pt-1">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Landing Page</span>
            </Link>

            {user && (
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 text-xs text-danger hover:underline cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
