import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  Mail,
  Scale,
  LifeBuoy,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does scoring and automated judging work?",
    answer:
      "Quiz Battle is scored automatically (+10 pts per correct, -2 pts negative marking). Coding and Debugging battles execute solutions against pre-compiled hidden and boundary test cases within a sandboxed Docker container. Points are awarded proportionally based on passing test suites.",
  },
  {
    question: "What happens if my network disconnects or browser closes during a round?",
    answer:
      "All multiple-choice selections and code editor states are persisted in real-time. If you refresh or reconnect, your progress will be restored. Note that the countdown clock is anchored to the server deadline and does not pause during local disconnects.",
  },
  {
    question: "What programming languages and compiler versions are supported?",
    answer:
      "Code Battle supports Python 3.11, JavaScript (Node.js 20 LTS), C++ (GCC 12 with C++17 flags), and Java (OpenJDK 17). Solutions must use standard input (stdin) and standard output (stdout).",
  },
  {
    question: "How are leaderboard ties resolved?",
    answer:
      "In the event of a tie in total score, the competitor with the earlier cumulative submission timestamp across all rounds is ranked higher.",
  },
  {
    question: "What are the rules regarding code plagiarism and external AI assistance?",
    answer:
      "Submissions must be written independently. Automated code similarity algorithms (AST tree diffing) inspect all code after round close. Using external generative AI during live coding rounds is strictly prohibited and results in immediate disqualification.",
  },
];

export const HelpSupportPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="rounded-3xl border border-violet-primary/30 bg-bg-card/70 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-light uppercase tracking-wider mb-2">
          <HelpCircle className="h-4 w-4" />
          <span>Participant Support Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Rules, Guidelines &amp; FAQs
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Everything you need to know about round navigation, scoring criteria, and contest
          mechanics.
        </p>
      </div>

      {/* ── FAQ ACCORDION ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-cyan-primary" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-bg-card/50 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-text-primary hover:bg-bg-card-hover transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-violet-light" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/50 bg-bg-secondary/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FAIR PLAY & INTEGRITY ────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-bg-card/50 p-6 sm:p-7 space-y-4 text-xs sm:text-sm text-text-secondary">
        <div className="flex items-center gap-2 pb-3 border-b border-border text-text-primary">
          <Scale className="h-5 w-5 text-warning" />
          <h2 className="font-bold text-base">Fair Play &amp; Code of Conduct</h2>
        </div>

        <p className="leading-relaxed">
          Code Battle is a test of individual problem solving and computer engineering skill. Every
          participant is expected to compete with integrity.
        </p>

        <ul className="list-disc pl-5 space-y-2 text-text-muted font-mono text-xs">
          <li>One account per participant. Multi-accounting is actively tracked and flagged.</li>
          <li>Never share solutions or test case findings while a round is live.</li>
          <li>Attacking the judging infrastructure or attempting denial-of-service triggers automatic disqualification.</li>
        </ul>
      </div>

      {/* ── SUPPORT CONTACT CARD ────────────────────────────────────── */}
      <div className="rounded-3xl border border-violet-primary/40 bg-gradient-to-r from-violet-primary/10 to-cyan-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-base text-text-primary">Need Live Proctor Assistance?</h3>
          <p className="text-xs text-text-secondary">
            Our technical support committee is active during live contest hours.
          </p>
        </div>

        <a
          href="mailto:support@codebattle.dev"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-violet-light transition-all"
        >
          <Mail className="h-4 w-4" />
          <span>support@codebattle.dev</span>
        </a>
      </div>
    </div>
  );
};

export default HelpSupportPage;
