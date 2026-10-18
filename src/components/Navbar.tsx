import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, User, LogOut } from "lucide-react";
import { navLinks } from "../data/competition";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + href);
      return;
    }
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const dashboardRoute = profile?.role === "admin" ? "/admin/dashboard" : "/participant/dashboard";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong shadow-lg shadow-violet-primary/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-18">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => {
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-primary/15 ring-1 ring-violet-primary/30 transition-all group-hover:bg-violet-primary/25 group-hover:ring-violet-primary/50">
              <Zap className="h-5 w-5 text-violet-light" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary">
              Code<span className="text-violet-light">Battle</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(link.href);
                }}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-violet-primary/10 hover:text-text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth State / CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardRoute}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-card/60 px-3.5 py-2 text-xs font-semibold text-text-primary hover:border-violet-primary/40 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-violet-light" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="cursor-pointer rounded-lg p-2 text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="cursor-pointer rounded-lg bg-violet-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-primary/25 transition-all hover:bg-violet-light hover:shadow-violet-primary/40"
                >
                  Join the Battle
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer rounded-lg p-2 text-text-secondary transition-colors hover:bg-violet-primary/10 hover:text-text-primary lg:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-strong overflow-hidden border-t border-border lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(link.href);
                  }}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-violet-primary/10 hover:text-text-primary"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                {user ? (
                  <>
                    <Link
                      to={dashboardRoute}
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer rounded-lg bg-violet-primary/20 border border-violet-primary/40 px-4 py-3 text-sm font-semibold text-violet-light text-center"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="cursor-pointer rounded-lg px-4 py-2.5 text-xs font-medium text-danger text-center"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer rounded-lg px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary text-center border border-border bg-bg-card/40"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer rounded-lg bg-violet-primary px-4 py-3 text-sm font-semibold text-white text-center"
                    >
                      Join the Battle
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
