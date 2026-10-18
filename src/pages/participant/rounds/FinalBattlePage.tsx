import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Send,
  Clock,
  Crown,
  Cpu,
  Loader2,
  ArrowLeft,
  Sparkles,
  Bot,
  X,
} from "lucide-react";
import {
  participantService,
} from "../../../services/participantService";
import { realtimeDbService } from "../../../services/realtimeDbService";
import type { CodingProblem } from "../../../types/participant";
import { CodeEditor } from "../../../components/participant/CodeEditor";
import { ConfirmDialog } from "../../../components/participant/ConfirmDialog";
import { RoundAccessGuard } from "../../../components/participant/RoundAccessGuard";
import { useAuth } from "../../../context/AuthContext";

const FinalBattleWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState(true);
  const [problemError, setProblemError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>("");
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // AI Mentor state (Groq & Gemini)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiType, setAiType] = useState<"hint" | "explanation">("hint");

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

  useEffect(() => {
    participantService.getRoundProblems("final")
      .then(setProblems)
      .catch(() => setProblemError("Final challenges are unavailable right now."))
      .finally(() => setIsLoadingProblems(false));
  }, []);

  const problem = problems[0] as CodingProblem | undefined;

  useEffect(() => {
    if (!problem) return;
    setCode(problem.starterCode[language] || problem.starterCode["python"] || "");
  }, [problem, language]);

  if (isLoadingProblems) {
    return <div className="flex min-h-[40vh] items-center justify-center text-text-secondary">Loading final challenges...</div>;
  }

  if (problemError || !problem) {
    return <div className="flex min-h-[40vh] items-center justify-center text-text-secondary">{problemError || "No final challenges are published."}</div>;
  }

  const handleRunSampleTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await participantService.executeSampleTests(problem.id, language, code);
      setTestResults(res);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleAskAiHint = async () => {
    if (!problem) return;
    setAiLoading(true);
    setAiType("hint");
    setIsAiModalOpen(true);
    try {
      const hint = await realtimeDbService.requestAiHint({
        problemTitle: problem.title,
        problemStatement: problem.statement,
        currentCode: code,
      });
      setAiContent(hint);
    } catch {
      setAiContent("Focus on optimal sub-structure, dynamic programming state compression, or segment trees.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExplainError = async () => {
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
      setAiContent("Check compiler trace for index bounds, integer overflow, or asymptotic complexity violations.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const sub = await participantService.submitSolution({
        userId: user?.uid || "demo-participant-uid",
        userName: user?.displayName || "Code Fighter",
        roundId: 4,
        roundName: "Final Battle",
        problemId: problem.id,
        problemTitle: problem.title,
        language,
        code,
      });
      setIsSubmitModalOpen(false);
      setSubmissionSuccess(`Championship submission ${sub.id} received and recorded! Leaderboard updated.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Championship Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-primary/50 bg-gradient-to-r from-[#170a36] via-[#100d2e] to-[#041d3b] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 h-60 w-60 rounded-full bg-violet-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute right-36 bottom-0 h-40 w-40 rounded-full bg-cyan-primary/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/participant/competition"
                className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Pipeline</span>
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-light/40 bg-violet-primary/25 px-3 py-1 text-xs font-semibold text-violet-light">
                <Crown className="h-3.5 w-3.5 text-warning animate-pulse" />
                <span>Championship Arena • Final Stage</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Round 4: The Final Battle
            </h1>

            <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
              The ultimate proving ground for top competitors. Solve high-dimensional graph optimization
              and fault-tolerant photonic routing with strict sub-second performance requirements.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-xs font-mono font-bold text-warning flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Time Remaining: 01:29:40</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Statement (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-bg-card/50 p-6 backdrop-blur-md space-y-6 max-h-[850px] overflow-y-auto">
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-purple-500/20 text-violet-light px-3 py-1 text-xs font-mono font-bold border border-purple-500/40">
                Championship Tier
              </span>
              <span className="text-xs font-mono text-warning font-bold">
                {problem.points} Points
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">{problem.title}</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
            <div className="whitespace-pre-line">{problem.statement}</div>

            {/* Input & Output */}
            <div className="rounded-xl border border-border bg-bg-secondary p-4 space-y-3 font-mono text-xs">
              <div>
                <strong className="text-violet-light block mb-1">Input Format:</strong>
                <p className="text-text-primary">{problem.inputFormat}</p>
              </div>
              <div className="pt-2 border-t border-border">
                <strong className="text-cyan-light block mb-1">Output Format:</strong>
                <p className="text-text-primary">{problem.outputFormat}</p>
              </div>
            </div>

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

            {/* Sample Case */}
            {problem.sampleTestCases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                className="rounded-xl border border-border bg-bg-secondary p-4 space-y-2 text-xs font-mono"
              >
                <span className="text-cyan-light font-bold block">Championship Sample:</span>
                <div>
                  <span className="text-text-muted block text-[11px]">Input:</span>
                  <pre className="rounded bg-[#070714] p-2 text-text-primary overflow-x-auto mt-0.5 whitespace-pre">
                    {tc.input}
                  </pre>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Expected:</span>
                  <pre className="rounded bg-[#070714] p-2 text-success overflow-x-auto mt-0.5">
                    {tc.expectedOutput}
                  </pre>
                </div>
              </div>
            ))}
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

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-card/70 p-4">
            <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
              <Cpu className="h-4 w-4 text-violet-light" />
              <span>Championship Cluster 8-Core Node</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAskAiHint}
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-primary/40 bg-violet-primary/10 px-3.5 py-2.5 text-xs font-semibold text-violet-light hover:bg-violet-primary/20 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-violet-light" />
                <span>AI Hint</span>
              </button>

              <button
                type="button"
                onClick={handleRunSampleTests}
                disabled={isRunningTests || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-primary/40 bg-cyan-primary/10 px-4 py-2.5 text-xs font-bold text-cyan-light hover:bg-cyan-primary/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRunningTests ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>Run Sample Cases</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                disabled={isRunningTests || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-primary to-cyan-dark px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-primary/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Submit Final Solution</span>
              </button>
            </div>
          </div>

          {/* Test Results Output */}
          {testResults && (
            <div className="rounded-2xl border border-border bg-bg-card/60 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">Execution Results:</span>
                <div className="flex items-center gap-3">
                  {!testResults.passed && (
                    <button
                      type="button"
                      onClick={handleExplainError}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-light bg-violet-primary/20 px-2.5 py-1 rounded-lg border border-violet-primary/40 hover:bg-violet-primary/30 transition-all"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Explain Failure (AI)</span>
                    </button>
                  )}
                  <span className={testResults.passed ? "text-success font-bold" : "text-danger font-bold"}>
                    {testResults.passed ? "All Tests Passed" : "Sample Tests Failed"}
                  </span>
                </div>
              </div>
              <pre className="rounded-xl bg-[#070714] p-3 text-cyan-light overflow-x-auto">
                {testResults.compilerOutput}
              </pre>
            </div>
          )}

          {submissionSuccess && (
            <div className="rounded-2xl border border-success/40 bg-success/10 p-4 text-xs font-mono text-success flex items-center justify-between">
              <span>{submissionSuccess}</span>
              <button
                type="button"
                onClick={() => setSubmissionSuccess(null)}
                className="text-text-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isSubmitModalOpen}
        title="Submit Championship Solution"
        message="This is your final algorithmic submission for Code Battle 2026. Once evaluated, your score will be added to the final audit. Confirm submission?"
        confirmText="Confirm Final Submission"
        cancelText="Cancel"
        variant="primary"
        icon="warning"
        loading={isSubmitting}
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsSubmitModalOpen(false)}
      />

      {/* AI Mentor Dialog Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-violet-primary/40 bg-[#0c0d21] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#272B49]">
              <div className="flex items-center gap-2 text-violet-light font-bold text-sm">
                <Bot className="h-5 w-5" />
                <span>{aiType === "hint" ? "Championship AI Hint" : "AI Failure Analysis"}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="text-text-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-text-secondary leading-relaxed max-h-64 overflow-y-auto font-sans whitespace-pre-wrap">
              {aiLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-violet-light">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Consulting Groq & Gemini models...</span>
                </div>
              ) : (
                aiContent
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#272B49]">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="rounded-xl bg-violet-primary/20 hover:bg-violet-primary/30 text-violet-light border border-violet-primary/40 px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const FinalBattlePage: React.FC = () => {
  return (
    <RoundAccessGuard roundSlug="final">
      <FinalBattleWorkspace />
    </RoundAccessGuard>
  );
};

export default FinalBattlePage;
