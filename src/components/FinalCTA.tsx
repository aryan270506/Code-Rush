import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function FinalCTA() {
  const handleScroll = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="cta" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-primary/10 via-bg-card/80 to-cyan-primary/5" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-violet-primary/8 blur-[80px]" />

          <div className="relative px-8 py-16 text-center sm:px-12 sm:py-20 lg:px-20 lg:py-24">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Ready to Prove Your{" "}
              <span className="text-gradient">Coding Skills?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg"
            >
              Join the competition, solve challenging problems, and battle your
              way to the top.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <button
                onClick={() => alert("Registration — coming soon")}
                className="group cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-primary px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-primary/25 transition-all hover:bg-violet-light hover:shadow-violet-primary/40 hover:gap-3"
              >
                Join the Battle
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => handleScroll("#competition")}
                className="group cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/50 px-8 py-4 text-sm font-semibold text-text-primary transition-all hover:border-violet-primary/40 hover:bg-bg-card"
              >
                Explore Competition
                <ChevronRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
