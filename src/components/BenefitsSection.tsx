import { motion } from "framer-motion";
import { benefits } from "../data/competition";

export default function BenefitsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="mb-3 inline-block rounded-full border border-cyan-primary/30 bg-cyan-primary/10 px-4 py-1 text-xs font-semibold tracking-widest text-cyan-light uppercase">
            Benefits
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Why <span className="text-gradient">Code Battle?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            A platform designed for serious competitive programmers.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col items-center rounded-2xl border border-border bg-bg-card/60 p-6 text-center transition-all duration-300 hover:border-cyan-primary/30 hover:bg-bg-card-hover/80 hover:shadow-xl hover:shadow-cyan-primary/5 sm:items-start sm:text-left"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-primary/10 transition-colors group-hover:bg-cyan-primary/20">
                  <Icon className="h-6 w-6 text-cyan-light" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
