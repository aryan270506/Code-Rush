import React from "react";
type IconType = React.ComponentType<{ className?: string }>;

interface AuthFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: IconType;
  error?: string;
  helperText?: string;
}

export default function AuthFormField({
  id,
  label,
  icon: Icon,
  error,
  helperText,
  disabled,
  className = "",
  ...props
}: AuthFormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          {label}
        </label>
      </div>

      <div className="relative rounded-xl">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          id={id}
          disabled={disabled}
          className={`block w-full rounded-xl border bg-bg-secondary/90 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            Icon ? "pl-10" : ""
          } ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/25"
              : "border-border hover:border-border-glow focus:border-violet-primary focus:ring-violet-primary/30"
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-danger font-medium flex items-center gap-1 mt-1">
          <span>•</span> {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-text-muted mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
