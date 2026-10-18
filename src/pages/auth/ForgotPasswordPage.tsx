import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthFormField from "../../components/auth/AuthFormField";
import { validateEmail } from "../../utils/validation";
import { authService } from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authService.sendPasswordReset(email);
      // Always show success message to prevent email enumeration
      setSubmitted(true);
    } catch (err: unknown) {
      console.warn("[ForgotPassword] Reset request response:", err);
      // To prevent email enumeration, we still display success unless Firebase is unconfigured
      if (err instanceof Error && err.message.includes("Firebase is not configured")) {
        setError(err.message);
      } else {
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Recovery"
      title="Reset Password"
      subtitle="Enter the email associated with your account and we'll send you a password reset link."
      footerText="Remembered your password?"
      footerLinkText="Back to Sign In"
      footerLinkHref="/login"
    >
      {submitted ? (
        <div className="space-y-5 text-center py-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 ring-1 ring-success/30 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-text-primary">
              Password Reset Link Dispatched
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              If an account is registered for <strong className="text-text-primary">{email}</strong>, you will receive an email containing a link to reset your password.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full rounded-xl bg-violet-primary/20 hover:bg-violet-primary/30 border border-violet-primary/40 py-2.5 px-4 text-xs font-semibold text-violet-light hover:text-white transition-colors"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger font-medium">
              {error}
            </div>
          )}

          <AuthFormField
            id="forgot-email"
            label="Account Email"
            type="email"
            autoComplete="email"
            icon={Mail}
            placeholder="coder@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            error={error || undefined}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="group cursor-pointer mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-violet-primary py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-primary/25 transition-all hover:bg-violet-light hover:shadow-violet-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
