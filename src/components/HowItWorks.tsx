import { motion } from "framer-motion";
import { steps } from "../data/competition";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
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
            Process
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            From registration to victory — four simple steps to compete.
          </p>
        </motion.div>

        {/* Desktop: horizontal */}
        <div className="mt-16 hidden lg:block">
          <div className="relative grid grid-cols-4 gap-8">
            {/* Connecting line */}
            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-violet-primary/40 via-cyan-primary/40 to-violet-primary/40" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step circle */}
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-bg-card shadow-lg shadow-violet-primary/5">
                    <Icon className="h-8 w-8 text-violet-light" />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-primary text-xs font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="mt-12 lg:hidden">
          <div className="relative space-y-8 pl-10">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-primary/40 via-cyan-primary/40 to-violet-primary/40" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative"
                >
                  {/* Dot on line */}
                  <div className="absolute -left-10 top-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-card">
                    <Icon className="h-4 w-4 text-violet-light" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-primary text-[10px] font-bold text-white">
                        {step.number}
                      </span>
                      <h3 className="text-base font-bold text-text-primary">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
