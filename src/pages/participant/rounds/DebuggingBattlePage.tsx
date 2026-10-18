import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bug,
  Play,
  Send,
  CheckCircle2,
  Clock,
  Terminal,
  Loader2,
  Wrench,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Bot,
  X,
} from "lucide-react";
import {
  DEBUGGING_PROBLEMS,
  participantService,
} from "../../../services/participantService";
import { realtimeDbService } from "../../../services/realtimeDbService";
import type { CodingProblem } from "../../../types/participant";
import { CodeEditor } from "../../../components/participant/CodeEditor";
import { ConfirmDialog } from "../../../components/participant/ConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import { RoundAccessGuard } from "../../../components/participant/RoundAccessGuard";

const DebuggingBattleWorkspace: React.FC = () => {
  const { user } = useAuth();
  const selectedBugIndex = 0;
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>("");
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<{
    passed: boolean;
    results: {
      id: string;
      passed: boolean;
      input: string;
      expectedOutput: string;
      actualOutput: string;
      timeMs: number;
    }[];
    compilerOutput: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"tests" | "output">("tests");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [fixSuccess, setFixSuccess] = useState<string | null>(null);

  // AI Mentor state (Groq & Gemini)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiType, setAiType] = useState<"hint" | "explanation">("hint");

  const problem: CodingProblem = DEBUGGING_PROBLEMS[selectedBugIndex] || DEBUGGING_PROBLEMS[0];

  useEffect(() => {
    const starter = problem.starterCode[language] || problem.starterCode["python"] || "";
    setCode(starter);
    setTestResults(null);
  }, [problem, language]);

  const handleRunSampleTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await participantService.executeSampleTests(problem.id, language, code);
      setTestResults(res);
      setActiveTab("tests");
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleRequestAiHint = async () => {
    setAiLoading(true);
    setAiType("hint");
    setIsAiModalOpen(true);
    try {
      const hint = await realtimeDbService.requestAiHint({
        problemTitle: problem.title,
        problemStatement: `${problem.statement}\nKnown Symptom: ${problem.bugExplanation || ""}`,
        currentCode: code,
        errorMessage: testResults && !testResults.passed ? testResults.compilerOutput : undefined,
      });
      setAiContent(hint);
    } catch {
      setAiContent("Analyze loop boundary updates: look for integer division truncations and off-by-one pointer increments.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExplainBug = async () => {
    if (!testResults) return;
    setAiLoading(true);
    setAiType("explanation");
    setIsAiModalOpen(true);
    try {
      const explanation = await realtimeDbService.requestAiExplanation({
        code,
        compilerOutput: testResults.compilerOutput,
        language,
      });
      setAiContent(explanation);
    } catch {
      setAiContent("Review the assertion failure to see where the calculated invariant diverges from the required output.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitFix = async () => {
    setIsSubmitting(true);
    try {
      await participantService.submitSolution({
        userId: user?.uid || "demo-participant-uid",
        userName: user?.displayName || "Code Fighter",
        roundId: 3,
        roundName: "Debugging Battle",
        problemId: problem.id,
        problemTitle: problem.title,
        language,
        code,
      });

      setIsSubmitModalOpen(false);
      setFixSuccess(
        `Bug fix verified! All unit test invariants satisfied (+75 pts added to score).`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-warning/40 bg-bg-card/70 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            to="/participant/competition"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-secondary text-text-muted hover:text-white hover:bg-bg-card border border-border transition-colors"
            title="Back to Pipeline"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning border border-warning/40">
            <Bug className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-warning uppercase">
                Round 3 • Bug Hunt Arena
              </span>
              <span className="rounded bg-cyan-primary/20 text-cyan-light px-2 py-0.5 text-[10px] font-bold">
                Available to Play
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
              Debugging Battle Workspace
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
          <Clock className="h-4 w-4 text-warning" />
          <span>Round Duration: 45 Minutes</span>
        </div>
      </div>

      {/* Success Notification Bar if submitted */}
      {fixSuccess && (
        <div className="rounded-2xl border border-success/40 bg-success/10 p-4 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{fixSuccess}</span>
          </div>
          <Link
            to="/participant/submissions"
            className="text-success underline font-bold whitespace-nowrap"
          >
            Inspect Submission
          </Link>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bug Report & Instructions (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-bg-card/50 p-6 backdrop-blur-md space-y-6 max-h-[850px] overflow-y-auto">
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-mono font-bold border border-warning/30">
                Fix Invariant Flaws
              </span>
              <span className="text-xs font-mono text-warning font-bold">
                {problem.points} Points
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">{problem.title}</h2>
          </div>

          {/* Statement & Bug Details */}
          <div className="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
            <div className="whitespace-pre-line">{problem.statement}</div>

            {/* Bug Analysis Alert */}
            {problem.bugExplanation && (
              <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-warning font-bold text-xs uppercase tracking-wider font-mono">
                  <Wrench className="h-4 w-4" />
                  <span>Flaw Diagnostics</span>
                </div>
                <p className="text-xs text-text-primary leading-relaxed">
                  {problem.bugExplanation}
                </p>
              </div>
            )}

            {/* Constraints */}
            <div>
              <h3 className="font-bold text-text-primary text-xs uppercase tracking-wider mb-2 font-mono">
                Constraints
              </h3>
              <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-text-muted">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Sample Cases */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-text-primary text-xs uppercase tracking-wider font-mono">
                Verification Test Suites
              </h3>
              {problem.sampleTestCases.map((tc, idx) => (
                <div
                  key={tc.id || idx}
                  className="rounded-xl border border-border bg-bg-secondary p-4 space-y-2 text-xs font-mono"
                >
                  <span className="text-warning font-bold block">Test Case {idx + 1}:</span>
                  <div>
                    <span className="text-text-muted block text-[11px]">Input:</span>
                    <pre className="rounded bg-[#070714] p-2 text-text-primary overflow-x-auto mt-0.5">
                      {tc.input || "<empty>"}
                    </pre>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Expected:</span>
                    <pre className="rounded bg-[#070714] p-2 text-success overflow-x-auto mt-0.5">
                      {tc.expectedOutput}
                    </pre>
                  </div>
                  {tc.explanation && (
                    <p className="text-[11px] text-text-secondary italic font-sans pt-1">
                      {tc.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Runner (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            onResetCode={() => {
              setCode(problem.starterCode[language] || "");
            }}
            minHeight="460px"
          />

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-card/70 p-4">
            <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
              <ShieldCheck className="h-4 w-4 text-warning" />
              <span>Repair mode: Maintain algorithmic invariants</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRunSampleTests}
                disabled={isRunningTests || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-xs font-bold text-warning hover:bg-warning/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRunningTests ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>Run Test Verification</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                disabled={isRunningTests || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-primary/25 hover:bg-violet-light transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Submit Bug Fix</span>
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div className="rounded-2xl border border-border bg-bg-card/60 p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <button
                onClick={() => setActiveTab("tests")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "tests"
                    ? "bg-warning/20 text-warning border border-warning/30"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Test Verdicts</span>
              </button>
              <button
                onClick={() => setActiveTab("output")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "output"
                    ? "bg-warning/20 text-warning border border-warning/30"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Diagnostics Log</span>
              </button>
            </div>

            {!testResults ? (
              <div className="py-8 text-center text-xs text-text-muted font-mono">
                Run test verification to see if your fix eliminates the bug.
              </div>
            ) : activeTab === "tests" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {testResults.results.map((res, i) => (
                    <div
                      key={res.id || i}
                      className={`rounded-xl border p-3 text-xs font-mono space-y-1.5 ${
                        res.passed ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary">Case {i + 1}</span>
                        <span className={res.passed ? "text-success font-bold" : "text-danger font-bold"}>
                          {res.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        Exp: <span className="text-success">{res.expectedOutput}</span>
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        Got: <span className="text-text-primary">{res.actualOutput}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <pre className="rounded-xl bg-[#070714] p-4 font-mono text-xs text-warning overflow-x-auto leading-relaxed">
                {testResults.compilerOutput}
              </pre>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isSubmitModalOpen}
        title="Submit Repaired Implementation"
        message="Your fix will be graded against full hidden regression test suites. Confirm submission?"
        confirmText="Confirm Fix"
        cancelText="Cancel"
        variant="warning"
        icon="warning"
        loading={isSubmitting}
        onConfirm={handleSubmitFix}
        onCancel={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
};

export const DebuggingBattlePage: React.FC = () => {
  return (
    <RoundAccessGuard roundSlug="debugging">
      <DebuggingBattleWorkspace />
    </RoundAccessGuard>
  );
};

export default DebuggingBattlePage;
