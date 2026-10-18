import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  badge?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export default function AuthLayout({
  badge,
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-bg-primary overflow-x-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-violet-primary selection:text-white">
      {/* Background decorations matching landing page */}
      <div className="bg-grid absolute inset-0 pointer-events-none opacity-40" />
      <div className="bg-radial-glow absolute inset-0 pointer-events-none" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute right-10 bottom-10 h-[300px] w-[300px] rounded-full bg-cyan-primary/5 blur-[120px]" />

      {/* Top bar with Back to Home button */}
      <div className="relative z-10 mx-auto w-full max-w-md px-4 sm:px-0 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-text-muted hover:text-text-primary transition-colors py-1.5 px-3 rounded-lg border border-border/60 bg-bg-card/40 hover:bg-bg-card/80"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-primary/20 ring-1 ring-violet-primary/40 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5 text-violet-light" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-primary">
              Code<span className="text-violet-light">Battle</span>
            </span>
          </Link>

          {badge && (
            <div className="mt-4">
              <span className="inline-block rounded-full border border-violet-primary/30 bg-violet-primary/10 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-violet-light uppercase">
                {badge}
              </span>
            </div>
          )}

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            {title}
          </h1>
          <p className="mt-2 text-sm text-text-secondary max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="glass-strong rounded-2xl p-6 sm:p-8 shadow-2xl shadow-violet-primary/5 border border-border"
        >
          {children}

          {footerText && footerLinkText && footerLinkHref && (
            <div className="mt-6 pt-5 border-t border-border/80 text-center text-xs sm:text-sm text-text-muted">
              {footerText}{" "}
              <Link
                to={footerLinkHref}
                className="font-semibold text-violet-light hover:text-white transition-colors hover:underline underline-offset-4"
              >
                {footerLinkText}
              </Link>
            </div>
          )}
        </motion.div>

        {/* Bottom copyright */}
        <div className="mt-8 text-center text-xs text-text-muted/60">
          © {new Date().getFullYear()} Code Battle Hackathon. All rights reserved.
        </div>
      </div>
    </div>
  );
}
