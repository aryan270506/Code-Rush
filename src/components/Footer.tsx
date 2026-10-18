import { Zap, Globe, MessageCircle, Users } from "lucide-react";
import { footerSections } from "../data/competition";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#home" className="group inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-primary/15 ring-1 ring-violet-primary/30">
                <Zap className="h-5 w-5 text-violet-light" />
              </div>
              <span className="text-lg font-bold tracking-tight text-text-primary">
                Code<span className="text-violet-light">Battle</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              An online competitive programming platform. Four rounds of intense
              challenges. One champion.
            </p>

            {/* Social — placeholder icons */}
            <div className="mt-5 flex gap-3">
              {[Globe, MessageCircle, Users].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link placeholder"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-card/50 text-text-muted transition-colors hover:border-violet-primary/30 hover:text-violet-light"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-text-primary">
                {section.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 text-center text-xs text-text-muted">
          © {year} Code Battle. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
