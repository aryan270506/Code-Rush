import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import OTPInput from "../../components/auth/OTPInput";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const COOLDOWN_SECONDS = 60;
const EXPIRATION_SECONDS = 300; // 5 minutes

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const emailParam = queryParams.get("email") || user?.email || "";
  const uidParam = queryParams.get("uid") || user?.uid || "";
  const noticeParam = queryParams.get("notice");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Cooldown countdown
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  // Expiration countdown
  const [expiresIn, setExpiresIn] = useState(EXPIRATION_SECONDS);

  // Countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVerify = async (submittedOtp?: string) => {
    const code = submittedOtp || otp;
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (expiresIn <= 0) {
      setError("This verification code has expired. Please request a new one.");
      return;
    }

    setError(null);
    setIsVerifying(true);

    try {
      const res = await authService.verifyOtp(emailParam, code, uidParam);
      if (res.verified) {
        setSuccess("Email successfully verified! Redirecting to login...");
        await refreshProfile();
        setTimeout(() => {
          navigate("/login?notice=" + encodeURIComponent("Email verified successfully! You may now sign in."), {
            replace: true,
          });
        }, 1500);
      } else {
        setError(res.message || "Invalid verification code.");
      }
    } catch (err: unknown) {
      console.error("[VerifyEmail] Verification error:", err);
      const msg = err instanceof Error ? err.message : "Failed to verify code. Please try again.";
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setError(null);
    setSuccess(null);
    setIsResending(true);

    try {
      const res = await authService.resendOtp(emailParam, uidParam);
      setSuccess(res.message || "A new 6-digit verification code has been sent to your email.");
      setCooldown(COOLDOWN_SECONDS);
      setExpiresIn(EXPIRATION_SECONDS);
      setOtp("");
    } catch (err: unknown) {
      console.error("[VerifyEmail] Resend error:", err);
      const msg = err instanceof Error ? err.message : "Could not resend code. Please try again later.";
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      badge="Verification"
      title="Verify Your Email"
      subtitle={`Enter the 6-digit code sent to ${emailParam || "your email address"} to activate your account.`}
      footerText="Need to use a different email?"
      footerLinkText="Back to Registration"
      footerLinkHref="/signup"
    >
      <div className="space-y-6">
        {/* Email banner */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-secondary/60 p-3 text-xs text-text-secondary">
          <Mail className="h-4 w-4 text-violet-light shrink-0" />
          <span className="truncate font-mono">{emailParam || "No email specified"}</span>
        </div>

        {noticeParam && !error && !success && (
          <div className="rounded-xl border border-violet-primary/30 bg-violet-primary/10 p-3.5 text-xs text-violet-light">
            {noticeParam}
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 p-3.5 text-xs text-danger font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div className="flex items-start gap-2.5 rounded-xl border border-success/40 bg-success/10 p-3.5 text-xs text-success font-medium">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* 6-digit OTP Input */}
        <div className="py-2">
          <OTPInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (error) setError(null);
            }}
            disabled={isVerifying}
            onComplete={(code) => handleVerify(code)}
            error={Boolean(error)}
          />
        </div>

        {/* Expiration status */}
        <div className="text-center text-xs text-text-muted">
          {expiresIn > 0 ? (
            <span>
              Code expires in{" "}
              <span className="font-mono font-medium text-text-primary">
                {formatTime(expiresIn)}
              </span>
            </span>
          ) : (
            <span className="text-danger font-medium">
              Code has expired. Please request a new verification code.
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={otp.length !== 6 || isVerifying}
            className="group cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-violet-primary py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-primary/25 transition-all hover:bg-violet-light hover:shadow-violet-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <span>Verify Email</span>
            )}
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="inline-flex items-center gap-1.5 font-medium text-violet-light hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>

            <Link
              to="/login"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
