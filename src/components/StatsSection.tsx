import { motion } from "framer-motion";
import { stats } from "../data/competition";

export default function StatsSection() {
  return (
    <section className="relative z-10 -mt-6">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl"
        >
          <div className="grid grid-cols-2 divide-x divide-border lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="px-4 py-6 text-center sm:px-6 sm:py-8">
                <p className="text-2xl font-bold text-text-primary sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-text-muted sm:text-sm">
                  {stat.label}
                </p>
                {stat.note && (
                  <span className="mt-1.5 inline-block rounded-full bg-violet-primary/10 px-2 py-0.5 text-[10px] font-medium text-violet-light">
                    {stat.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
