import {
  Brain,
  Code2,
  Bug,
  Trophy,
  UserPlus,
  Swords,
  TrendingUp,
  Award,
  BarChart3,
  Target,
  Scale,
} from "lucide-react";

/* ── Round Data ────────────────────────────────────────────────── */
export const rounds = [
  {
    number: 1,
    title: "Quiz Battle",
    icon: Brain,
    description:
      "Test programming fundamentals, logic and technical knowledge in a rapid-fire quiz format.",
    tags: ["MCQs", "Time Limits", "Auto Scoring"],
    color: "violet" as const,
  },
  {
    number: 2,
    title: "Coding Battle",
    icon: Code2,
    description:
      "Solve programming problems using algorithmic thinking and efficient code.",
    tags: ["Code Editor", "Test Cases", "Auto Evaluation"],
    color: "cyan" as const,
  },
  {
    number: 3,
    title: "Debugging Battle",
    icon: Bug,
    description:
      "Find and fix bugs under competition time pressure. Sharpen your debugging instincts.",
    tags: ["Error Detection", "Code Correction", "Validation"],
    color: "violet" as const,
  },
  {
    number: 4,
    title: "Final Battle",
    icon: Trophy,
    description:
      "Tackle advanced algorithmic challenges and compete for the championship title.",
    tags: ["Advanced Problems", "Final Scores", "Winner"],
    color: "cyan" as const,
  },
];

/* ── How It Works Steps ────────────────────────────────────────── */
export const steps = [
  {
    number: 1,
    title: "Register",
    description: "Create your participant account and join the competition.",
    icon: UserPlus,
  },
  {
    number: 2,
    title: "Compete",
    description: "Participate in timed challenges across four intense rounds.",
    icon: Swords,
  },
  {
    number: 3,
    title: "Qualify",
    description: "Advance according to competition rules and your scores.",
    icon: TrendingUp,
  },
  {
    number: 4,
    title: "Win",
    description: "Reach the final round and compete for the top rank.",
    icon: Award,
  },
];

/* ── Statistics (configurable demo values) ─────────────────────── */
export const stats = [
  { label: "Registered Participants", value: "500+", note: "demo" },
  { label: "Competition Rounds", value: "4", note: "" },
  { label: "Coding Challenges", value: "50+", note: "demo" },
  { label: "Winner's Prize", value: "Coming Soon", note: "" },
];

/* ── Leaderboard Demo Data ─────────────────────────────────────── */
export const leaderboardData = [
  { rank: 1, name: "Participant A", score: 980, status: "Qualified" as const },
  { rank: 2, name: "Participant B", score: 945, status: "Qualified" as const },
  { rank: 3, name: "Participant C", score: 920, status: "Qualified" as const },
  { rank: 4, name: "Participant D", score: 890, status: "Pending" as const },
  { rank: 5, name: "Participant E", score: 875, status: "Pending" as const },
];

/* ── Benefits ──────────────────────────────────────────────────── */
export const benefits = [
  {
    icon: Swords,
    title: "Competitive Coding Experience",
    description:
      "Battle through four challenging rounds designed to test your full range of programming skills.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Performance Tracking",
    description:
      "Monitor your scores, rankings and progress throughout the competition with live updates.",
  },
  {
    icon: Target,
    title: "Merit-Based Progression",
    description:
      "Advance through rounds based purely on your coding skills and problem-solving ability.",
  },
  {
    icon: Scale,
    title: "Transparent Scoring",
    description:
      "Clear, published scoring criteria and automated evaluation ensure fair competition for all.",
  },
];

/* ── Rules Summary ─────────────────────────────────────────────── */
export const rules = [
  "Participants must follow official competition rules.",
  "Challenges have defined time limits.",
  "Scores are determined according to the published scoring system.",
  "Qualification depends on configured competition rules.",
  "Final results are published by the administrators.",
];

/* ── Navigation Links ──────────────────────────────────────────── */
export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Competition", href: "#competition" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "Rules", href: "#rules" },
];

/* ── Footer Links ──────────────────────────────────────────────── */
export const footerSections = [
  {
    title: "Competition",
    links: [
      { label: "Rounds", href: "#competition" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Leaderboard", href: "#leaderboard" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Rules", href: "#rules" },
      { label: "FAQ", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];
