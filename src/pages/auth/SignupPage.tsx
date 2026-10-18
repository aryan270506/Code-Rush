import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthFormField from "../../components/auth/AuthFormField";
import PasswordField from "../../components/auth/PasswordField";
import {
  calculatePasswordStrength,
  validateRegistration,
} from "../../utils/validation";
import { authService } from "../../services/authService";

export default function SignupPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Compute password strength dynamically
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Strict validation
    const validationErrors = validateRegistration(
      fullName,
      email,
      password,
      confirmPassword,
      agreeTerms
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Register participant (strictly role 'participant')
      const { user, message, devOtp } = await authService.register(email, password, fullName);

      // Navigate to OTP verification page
      const devOtpQuery = devOtp ? `&devOtp=${encodeURIComponent(devOtp)}` : "";
      navigate(
        `/verify-email?email=${encodeURIComponent(user.email || email)}&uid=${user.uid}&notice=${encodeURIComponent(
          message
        )}${devOtpQuery}`,
        { replace: true }
      );
    } catch (err: unknown) {
      console.error("[Signup] Registration error:", err);
      let errorMsg = "Unable to create your account. Please try again.";

      if (err instanceof Error) {
        if (err.message.includes("auth/email-already-in-use")) {
          errorMsg = "An account is already registered with this email address.";
        } else if (err.message.includes("auth/invalid-email")) {
          errorMsg = "The provided email address is invalid.";
        } else if (err.message.includes("auth/weak-password")) {
          errorMsg = "Password is too weak. Please meet all complexity criteria.";
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
      badge="Registration"
      title="Join the Battle"
      subtitle="Register as a participant to compete across 4 intense hackathon rounds."
      footerText="Already have an account?"
      footerLinkText="Sign In"
      footerLinkHref="/login"
    >
      {errors.general && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 p-3.5 text-xs text-danger font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthFormField
          id="signup-name"
          label="Full Name"
          type="text"
          autoComplete="name"
          icon={UserIcon}
          placeholder="Ada Lovelace"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
          }}
          error={errors.fullName}
          disabled={loading}
        />

        <AuthFormField
          id="signup-email"
          label="Email Address"
          type="email"
          autoComplete="email"
          icon={Mail}
          placeholder="coder@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          error={errors.email}
          disabled={loading}
        />

        <PasswordField
          id="signup-password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
          }}
          error={errors.password}
          strength={strength}
          showStrengthMeter={true}
          disabled={loading}
        />

        <PasswordField
          id="signup-confirm-password"
          label="Confirm Password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          error={errors.confirmPassword}
          disabled={loading}
        />

        {/* Terms and Privacy Policy */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-secondary select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: "" }));
              }}
              disabled={loading}
              className="mt-0.5 h-4 w-4 rounded border-border bg-bg-secondary text-violet-primary focus:ring-1 focus:ring-violet-primary"
            />
            <span>
              I agree to the official{" "}
              <a href="#rules" className="text-violet-light hover:underline">
                Competition Rules
              </a>
              , Fair Play Policy, and Code of Conduct.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-xs text-danger font-medium mt-1">
              • {errors.agreeTerms}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group cursor-pointer mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-violet-primary py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-primary/25 transition-all hover:bg-violet-light hover:shadow-violet-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Register &amp; Verify Email</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
