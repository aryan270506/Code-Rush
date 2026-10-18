import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Zap, Clock, BarChart3 } from "lucide-react";

export default function HeroSection() {
  const handleScroll = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden pt-20 lg:pt-0"
    >
      {/* Background effects */}
      <div className="bg-grid absolute inset-0" />
      <div className="bg-radial-glow absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-[300px] w-[300px] rounded-full bg-cyan-primary/5 blur-[100px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-primary/30 bg-violet-primary/10 px-4 py-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-violet-light" />
              <span className="text-xs font-semibold tracking-widest text-violet-light uppercase">
                Online Hackathon Competition
              </span>
            </motion.div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Think Fast.{" "}
              <span className="text-gradient">Code Smart.</span>
              <br />
              Battle to Win.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg mx-auto lg:mx-0">
              Compete in four intense rounds — Quiz, Coding, Debugging and the
              Final Battle. Prove your skills, climb the leaderboard and claim
              the top rank.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                to="/signup"
                className="group cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-primary/25 transition-all hover:bg-violet-light hover:shadow-violet-primary/40 hover:gap-3"
              >
                Join the Battle
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                onClick={() => handleScroll("#competition")}
                className="group cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/50 px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-violet-primary/40 hover:bg-bg-card"
              >
                Explore Rounds
                <ChevronRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              {[
                { icon: Zap, text: "Competitive Coding" },
                { icon: Clock, text: "Timed Challenges" },
                { icon: BarChart3, text: "Live Rankings" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-xs font-medium text-text-muted"
                >
                  <Icon className="h-3.5 w-3.5 text-violet-light/70" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Code editor illustration */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Main editor window */}
            <div className="glass rounded-2xl p-1 shadow-2xl shadow-violet-primary/10">
              <div className="rounded-xl bg-bg-secondary/80 overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-danger/80" />
                    <div className="h-3 w-3 rounded-full bg-warning/80" />
                    <div className="h-3 w-3 rounded-full bg-success/80" />
                  </div>
                  <span className="ml-2 text-xs font-medium text-text-muted font-mono">
                    solution.ts
                  </span>
                </div>
                {/* Code content */}
                <div className="p-5 font-mono text-sm leading-7">
                  <CodeLine n={1}>
                    <Kw>function</Kw> <Fn>solveBattle</Fn>
                    <Br>(</Br>
                    <Pr>challenge</Pr>
                    <Cm>:</Cm> <Tp>Problem</Tp>
                    <Br>)</Br> <Br>{"{"}</Br>
                  </CodeLine>
                  <CodeLine n={2}>
                    {"  "}
                    <Kw>const</Kw> <Pr>solution</Pr> <Cm>=</Cm>{" "}
                    <Fn>analyze</Fn>
                    <Br>(</Br>
                    <Pr>challenge</Pr>
                    <Br>)</Br>
                    <Cm>;</Cm>
                  </CodeLine>
                  <CodeLine n={3}>
                    {"  "}
                    <Kw>const</Kw> <Pr>optimized</Pr> <Cm>=</Cm>{" "}
                    <Fn>optimize</Fn>
                    <Br>(</Br>
                    <Pr>solution</Pr>
                    <Br>)</Br>
                    <Cm>;</Cm>
                  </CodeLine>
                  <CodeLine n={4}>
                    <span className="text-text-muted">{"  // "}</span>
                    <span className="text-text-muted italic">
                      Execute &amp; validate
                    </span>
                  </CodeLine>
                  <CodeLine n={5}>
                    {"  "}
                    <Kw>return</Kw> <Fn>submit</Fn>
                    <Br>(</Br>
                    <Pr>optimized</Pr>
                    <Br>)</Br>
                    <Cm>;</Cm>
                  </CodeLine>
                  <CodeLine n={6}>
                    <Br>{"}"}</Br>
                  </CodeLine>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              className="glass absolute -right-4 top-8 rounded-xl px-4 py-3 shadow-lg animate-float"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15">
                  <BarChart3 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Score</p>
                  <p className="text-sm font-bold text-success">980 / 1000</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="glass absolute -left-6 bottom-24 rounded-xl px-4 py-3 shadow-lg animate-float-delayed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-primary/15">
                  <Zap className="h-4 w-4 text-violet-light" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Rank</p>
                  <p className="text-sm font-bold text-violet-light">#1</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="glass absolute -right-2 bottom-8 rounded-xl px-4 py-3 shadow-lg animate-float"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              style={{ animationDelay: "1s" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-primary/15">
                  <Clock className="h-4 w-4 text-cyan-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Tests Passed</p>
                  <p className="text-sm font-bold text-cyan-light">12 / 12</p>
                </div>
              </div>
            </motion.div>

            {/* Decorative elements */}
            <div className="pointer-events-none absolute -bottom-6 -left-6 font-mono text-7xl font-black text-violet-primary/5 select-none">
              {"</>"}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Syntax highlight helpers ──────────────────────────────────── */
function CodeLine({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex">
      <span className="mr-5 inline-block w-4 text-right text-text-muted/40 select-none">
        {n}
      </span>
      <span>{children}</span>
    </div>
  );
}
function Kw({ children }: { children: React.ReactNode }) {
  return <span className="text-violet-light">{children}</span>;
}
function Fn({ children }: { children: React.ReactNode }) {
  return <span className="text-cyan-light">{children}</span>;
}
function Pr({ children }: { children: React.ReactNode }) {
  return <span className="text-text-primary">{children}</span>;
}
function Tp({ children }: { children: React.ReactNode }) {
  return <span className="text-warning">{children}</span>;
}
function Br({ children }: { children: React.ReactNode }) {
  return <span className="text-text-muted">{children}</span>;
}
function Cm({ children }: { children: React.ReactNode }) {
  return <span className="text-text-muted">{children}</span>;
}
