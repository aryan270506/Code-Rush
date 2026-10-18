import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { rules } from "../data/competition";

export default function RulesSection() {
  return (
    <section id="rules" className="relative py-24 sm:py-32">
      <div className="bg-radial-glow absolute inset-0 pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-border bg-bg-card/60"
        >
          <div className="p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-primary/10 ring-1 ring-violet-primary/30">
                <Shield className="h-7 w-7 text-violet-light" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Rules &amp; <span className="text-gradient">Fair Play</span>
                </h2>
                <p className="mt-2 text-sm text-text-secondary sm:text-base">
                  Code Battle is committed to a transparent and fair competition
                  environment.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {rules.map((rule, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-light/70" />
                  <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                    {rule}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-center sm:justify-start">
              <button
                onClick={() => alert("Competition rules — coming soon")}
                className="group cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/50 px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:border-violet-primary/40 hover:bg-bg-card"
              >
                Read Competition Rules
                <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
