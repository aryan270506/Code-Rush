import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthFormField from "../../components/auth/AuthFormField";
import PasswordField from "../../components/auth/PasswordField";
import { validateEmail } from "../../utils/validation";
import { DEMO_CREDENTIALS } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  // Check if redirected from sign-up or verification with notice
  const queryParams = new URLSearchParams(location.search);
  const infoNotice = queryParams.get("notice");

  const handleDemoClick = (role: "participant" | "admin") => {
    loginDemo(role);
    if (role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/participant/dashboard", { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Check if submitting demo credentials directly through form
    const cleanEmail = email.trim().toLowerCase();
    if (
      cleanEmail === DEMO_CREDENTIALS.admin.email.toLowerCase() &&
      password === DEMO_CREDENTIALS.admin.password
    ) {
      handleDemoClick("admin");
      return;
    }
    if (
      cleanEmail === DEMO_CREDENTIALS.participant.email.toLowerCase() &&
      password === DEMO_CREDENTIALS.participant.password
    ) {
      handleDemoClick("participant");
      return;
    }

    // Validate inputs
    const newErrors: { email?: string; password?: string; general?: string } = {};
    if (!email || !email.trim()) {
      newErrors.email = "Please enter your email address or login ID.";
    } else if (email.includes("@")) {
      const emailErr = validateEmail(email);
      if (emailErr) newErrors.email = emailErr;
    } else if (email.trim().length < 3) {
      newErrors.email = "Login ID must be at least 3 characters.";
    }
    if (!password) newErrors.password = "Please enter your password.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { user, profile } = await login(email, password);

      const isDemo = Boolean(
        user.uid?.startsWith("demo-") || cleanEmail.includes("codebattle.dev")
      );

      // Check email verification status
      const isVerified =
        isDemo ||
        user.emailVerified ||
        profile?.emailVerified ||
        sessionStorage.getItem("cb_verified_" + user.uid) === "true" ||
        sessionStorage.getItem("cb_verified_" + cleanEmail) === "true";

      if (!isVerified) {
        // Redirect to email verification page with uid and email
        navigate(`/verify-email?email=${encodeURIComponent(user.email || email)}&uid=${user.uid}`, {
          replace: true,
        });
        return;
      }

      // Role-based redirect verified by server-side Realtime Database profile
      const userRole = profile?.role || "participant";
      if (userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/participant/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      console.error("[Login] Authentication error:", err);
      let errorMsg = "Invalid email or password. Please check your credentials.";

      if (err instanceof Error) {
        if (
          err.message.includes("auth/user-not-found") ||
          err.message.includes("auth/wrong-password") ||
          err.message.includes("auth/invalid-credential")
        ) {
          errorMsg = "Invalid email address or password.";
        } else if (err.message.includes("auth/too-many-requests")) {
          errorMsg = "Too many failed attempts. Please reset your password or try again later.";
        } else if (err.message.includes("auth/user-disabled")) {
          errorMsg = "This account has been disabled. Please contact the competition organizers.";
        } else {
          errorMsg = err.message;
        }
      }

      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Sign In"
      title="Welcome Back"
      subtitle="Enter your credentials to access your Code Battle competition account."
      footerText="Don't have an account?"
      footerLinkText="Create Participant Account"
      footerLinkHref="/signup"
    >
      {infoNotice && (
        <div className="mb-5 rounded-xl border border-violet-primary/30 bg-violet-primary/10 p-3.5 text-xs text-violet-light">
          {infoNotice}
        </div>
      )}

      {errors.general && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 p-3.5 text-xs text-danger font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthFormField
          id="login-email"
          label="Email Address or Login ID"
          type="text"
          autoComplete="username"
          icon={Mail}
          placeholder="name@example.com or username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          disabled={loading}
        />

        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          disabled={loading}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary hover:text-text-primary">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="h-3.5 w-3.5 rounded border-border bg-bg-secondary text-violet-primary focus:ring-1 focus:ring-violet-primary"
            />
            <span>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-violet-light hover:text-white transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group cursor-pointer mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-violet-primary py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-primary/25 transition-all hover:bg-violet-light hover:shadow-violet-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {/* Quick Demo Credentials for Instant Dashboard Testing */}
        <div className="pt-4 border-t border-border/60">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-text-muted text-center mb-2.5">
            ⚡ Quick Demo Logins (1-Click Instant Access)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick("participant")}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/80 bg-bg-secondary/70 hover:border-violet-primary/50 hover:bg-violet-primary/10 transition-all cursor-pointer text-center group"
            >
              <span className="text-xs font-bold text-violet-light group-hover:text-white">
                Participant Demo
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 font-mono">
                /participant
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick("admin")}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/80 bg-bg-secondary/70 hover:border-cyan-primary/50 hover:bg-cyan-primary/10 transition-all cursor-pointer text-center group"
            >
              <span className="text-xs font-bold text-cyan-light group-hover:text-white">
                Admin Demo
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 font-mono">
                /admin
              </span>
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
