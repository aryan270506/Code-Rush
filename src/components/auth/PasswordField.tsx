import React, { useState } from "react";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import type { PasswordStrength } from "../../types/auth";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  strength?: PasswordStrength;
  showStrengthMeter?: boolean;
}

export default function PasswordField({
  id,
  label,
  error,
  strength,
  showStrengthMeter = false,
  disabled,
  className = "",
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Strength score bar color
  const getBarColor = (score: number) => {
    switch (score) {
      case 1:
        return "bg-danger";
      case 2:
        return "bg-warning";
      case 3:
        return "bg-cyan-primary";
      case 4:
        return "bg-success";
      default:
        return "bg-border";
    }
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
      >
        {label}
      </label>

      <div className="relative rounded-xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
          <Lock className="h-4 w-4" />
        </div>

        <input
          id={id}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          className={`block w-full rounded-xl border bg-bg-secondary/90 pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/25"
              : "border-border hover:border-border-glow focus:border-violet-primary focus:ring-violet-primary/30"
          } ${className}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <p className="text-xs text-danger font-medium flex items-center gap-1 mt-1">
          <span>•</span> {error}
        </p>
      )}

      {/* Password Strength Meter */}
      {showStrengthMeter && strength && (
        <div className="mt-2.5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-muted">Password Strength</span>
            <span
              className={`font-semibold ${
                strength.score === 4
                  ? "text-success"
                  : strength.score === 3
                  ? "text-cyan-primary"
                  : strength.score === 2
                  ? "text-warning"
                  : strength.score === 1
                  ? "text-danger"
                  : "text-text-muted"
              }`}
            >
              {getStrengthLabel(strength.score)}
            </span>
          </div>

          {/* 4 segments */}
          <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-full rounded-full transition-all duration-300 ${
                  strength.score >= step ? getBarColor(strength.score) : "bg-border/60"
                }`}
              />
            ))}
          </div>

          {/* Checklist criteria */}
          <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
            <div
              className={`flex items-center gap-1.5 ${
                strength.hasMinLength ? "text-success" : "text-text-muted"
              }`}
            >
              {strength.hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>8+ characters</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                strength.hasUppercase ? "text-success" : "text-text-muted"
              }`}
            >
              {strength.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>Uppercase letter</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                strength.hasNumber ? "text-success" : "text-text-muted"
              }`}
            >
              {strength.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>One number</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                strength.hasSpecialChar ? "text-success" : "text-text-muted"
              }`}
            >
              {strength.hasSpecialChar ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>Special symbol</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
