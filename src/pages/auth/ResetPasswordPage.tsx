import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordField from "../../components/auth/PasswordField";
import {
  calculatePasswordStrength,
  validatePassword,
} from "../../utils/validation";
import { authService } from "../../services/authService";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get("oobCode") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  useEffect(() => {
    async function verifyCode() {
      if (!oobCode) {
        setValidatingCode(false);
        setCodeValid(false);
        setErrors({ general: "Invalid or missing password reset token. Please request a new link." });
        return;
      }

      try {
        await authService.verifyPasswordResetCode(oobCode);
        setCodeValid(true);
      } catch (err: unknown) {
        console.error("[ResetPassword] Code verification error:", err);
        setCodeValid(false);
        setErrors({ general: "This password reset link is invalid or has expired. Please request a new one." });
      } finally {
        setValidatingCode(false);
      }
    }

    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !codeValid) return;

    const newErrors: { password?: string; confirmPassword?: string; general?: string } = {};
    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await authService.confirmPasswordReset(oobCode, password);
      setResetSuccess(true);
      setTimeout(() => {
        navigate("/login?notice=" + encodeURIComponent("Your password has been reset successfully. Please sign in with your new password."), {
          replace: true,
        });
      }, 2000);
    } catch (err: unknown) {
      console.error("[ResetPassword] Confirmation error:", err);
      const msg = err instanceof Error ? err.message : "Failed to reset password. Please try again.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  if (validatingCode) {
    return (
      <AuthLayout
        badge="Security"
        title="Verifying Link"
        subtitle="Please wait while we validate your password reset link..."
      >
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-violet-light animate-spin" />
          <p className="mt-3 text-xs text-text-muted">Checking token validity...</p>
        </div>
      </AuthLayout>
    );
  }

  if (!codeValid) {
    return (
      <AuthLayout
        badge="Invalid Link"
        title="Reset Link Expired"
        subtitle="This password reset link is invalid, expired, or has already been used."
        footerText="Need help?"
        footerLinkText="Request a New Link"
        footerLinkHref="/forgot-password"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/15 ring-1 ring-danger/30 text-danger">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {errors.general || "Security tokens expire shortly after dispatch. Please request another reset link."}
          </p>
          <div className="pt-2">
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full rounded-xl bg-violet-primary py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-primary/25 hover:bg-violet-light transition-all"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      badge="Security"
      title="Create New Password"
      subtitle="Enter a new strong password to regain access to your account."
      footerText="Remember your credentials?"
      footerLinkText="Sign In"
      footerLinkHref="/login"
    >
      {resetSuccess ? (
        <div className="space-y-4 text-center py-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 ring-1 ring-success/30 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Password Successfully Reset</h3>
          <p className="text-xs text-text-secondary">
            Redirecting to login with your new credentials...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors.general && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger font-medium">
              {errors.general}
            </div>
          )}

          <PasswordField
            id="reset-new-password"
            label="New Password"
            autoComplete="new-password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            strength={strength}
            showStrengthMeter={true}
            disabled={loading}
          />

          <PasswordField
            id="reset-confirm-password"
            label="Confirm New Password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
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
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
