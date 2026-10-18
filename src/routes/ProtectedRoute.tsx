import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireVerified?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireVerified = true,
}: ProtectedRouteProps) {
  const { user, profile, loading, isEmailVerified } = useAuth();
  const location = useLocation();

  // Show futuristic loader while loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-violet-primary/20 border-t-violet-primary animate-spin" />
          <Loader2 className="h-6 w-6 text-violet-light absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-mono tracking-wider text-text-muted uppercase">
          Verifying Security Credentials...
        </p>
      </div>
    );
  }

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if email verification is required and unverified
  if (requireVerified && !isEmailVerified) {
    return (
      <Navigate
        to={`/verify-email?email=${encodeURIComponent(user.email || "")}&uid=${user.uid}`}
        replace
      />
    );
  }

  // 3. Role authorization check based on trusted server-side profile
  const userRole: UserRole = profile?.role || "participant";
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
