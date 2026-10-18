import React, { useEffect } from "react";
import { AlertTriangle, LogOut, CheckCircle2, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  icon?: "logout" | "warning" | "success";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  icon = "warning",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const getVariantButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-danger text-white hover:bg-danger/90 shadow-lg shadow-danger/20 border-transparent";
      case "warning":
        return "bg-warning text-black hover:bg-warning/90 shadow-lg shadow-warning/20 border-transparent";
      case "primary":
      default:
        return "bg-violet-primary text-white hover:bg-violet-light shadow-lg shadow-violet-primary/20 border-transparent";
    }
  };

  const renderIcon = () => {
    if (icon === "logout") {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/15 text-danger ring-1 ring-danger/30">
          <LogOut className="h-6 w-6" />
        </div>
      );
    }
    if (icon === "success") {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 text-success ring-1 ring-success/30">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      );
    }
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/15 text-warning ring-1 ring-warning/30">
        <AlertTriangle className="h-6 w-6" />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onCancel()}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg-secondary p-6 shadow-2xl transition-all">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          {renderIcon()}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-border bg-bg-card px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${getVariantButtonStyles()}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
