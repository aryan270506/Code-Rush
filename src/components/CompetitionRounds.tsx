import { motion } from "framer-motion";
import { rounds } from "../data/competition";
import type { LucideIcon } from "lucide-react";

export default function CompetitionRounds() {
  return (
    <section id="competition" className="relative py-24 sm:py-32">
      <div className="bg-radial-glow absolute inset-0 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="mb-3 inline-block rounded-full border border-violet-primary/30 bg-violet-primary/10 px-4 py-1 text-xs font-semibold tracking-widest text-violet-light uppercase">
            Competition
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Four Rounds.{" "}
            <span className="text-gradient">One Champion.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            Each round tests a different dimension of your programming ability.
            Only the best advance.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rounds.map((round, i) => (
            <RoundCard key={round.number} round={round} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface RoundCardProps {
  round: {
    number: number;
    title: string;
    icon: LucideIcon;
    description: string;
    tags: string[];
    color: "violet" | "cyan";
  };
  index: number;
}

function RoundCard({ round, index }: RoundCardProps) {
  const Icon = round.icon;
  const isViolet = round.color === "violet";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-bg-card/60 p-6 transition-all duration-300 hover:border-violet-primary/30 hover:bg-bg-card-hover/80 hover:shadow-xl hover:shadow-violet-primary/5"
    >
      {/* Round number */}
      <span className="absolute -top-3 right-5 rounded-full border border-border bg-bg-secondary px-3 py-0.5 text-xs font-bold text-text-muted">
        Round {round.number}
      </span>

      {/* Icon */}
      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
          isViolet
            ? "bg-violet-primary/10 group-hover:bg-violet-primary/20"
            : "bg-cyan-primary/10 group-hover:bg-cyan-primary/20"
        }`}
      >
        <Icon
          className={`h-6 w-6 ${
            isViolet ? "text-violet-light" : "text-cyan-light"
          }`}
        />
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-text-primary">{round.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
        {round.description}
      </p>

      {/* Tags */}
      <div className="mt-5 flex flex-wrap gap-2">
        {round.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
              isViolet
                ? "bg-violet-primary/10 text-violet-light"
                : "bg-cyan-primary/10 text-cyan-light"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
