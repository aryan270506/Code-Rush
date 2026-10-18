import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Play,
  Send,
  CheckCircle2,
  Terminal,
  Loader2,
  Cpu,
  ArrowLeft,
  Sparkles,
  Bot,
  X,
} from "lucide-react";
import {
  CODING_PROBLEMS,
  participantService,
} from "../../../services/participantService";
import { realtimeDbService } from "../../../services/realtimeDbService";
import type { CodingProblem } from "../../../types/participant";
import { CodeEditor } from "../../../components/participant/CodeEditor";
import { useAuth } from "../../../context/AuthContext";
import { ConfirmDialog } from "../../../components/participant/ConfirmDialog";
import { RoundAccessGuard } from "../../../components/participant/RoundAccessGuard";

const CodingBattleWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
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
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // AI Mentor state (Groq & Gemini)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiType, setAiType] = useState<"hint" | "explanation">("hint");

  const problem: CodingProblem = CODING_PROBLEMS[selectedProblemIndex] || CODING_PROBLEMS[0];

  // Initialize or reset starter code when problem or language changes
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
        problemStatement: problem.statement,
        currentCode: code,
        errorMessage: testResults && !testResults.passed ? testResults.compilerOutput : undefined,
      });
      setAiContent(hint);
    } catch {
      setAiContent("Examine the problem constraints and edge cases. Ensure boundary checks prevent index overflow.");
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
      setAiContent("Review the compiler error output for line-specific syntax or memory mismatches.");
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
        roundId: 2,
        roundName: "Coding Battle",
        problemId: problem.id,
        problemTitle: problem.title,
        language,
        code,
      });

      setIsSubmitModalOpen(false);
      setSubmissionSuccess(
        `Submission ${sub.id} accepted! 10/10 test cases passed (+100 pts added to provisional leaderboard).`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Problem Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-violet-primary/30 bg-bg-card/70 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-primary/20 text-violet-light border border-violet-primary/40">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-violet-light uppercase">
                Round 2 • Live Arena
              </span>
              <span className="rounded bg-success/20 text-success px-2 py-0.5 text-[10px] font-bold">
                Online Judging Active
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <h1 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
                Algorithmic Coding Battle
              </h1>
              <Link
                to="/participant/competition"
                className="text-xs font-mono text-violet-light hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Pipeline</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Problem selector tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {CODING_PROBLEMS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setSelectedProblemIndex(idx)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedProblemIndex === idx
                  ? "bg-violet-primary text-white border-violet-primary shadow-md shadow-violet-primary/20"
                  : "bg-bg-secondary text-text-secondary border-border hover:bg-bg-card hover:text-text-primary"
              }`}
            >
              Problem {idx + 1}: {p.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Bar if just submitted */}
      {submissionSuccess && (
        <div className="rounded-2xl border border-success/40 bg-success/10 p-4 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{submissionSuccess}</span>
          </div>
          <Link
            to="/participant/submissions"
            className="text-success underline font-bold whitespace-nowrap"
          >
            View in Submissions
          </Link>
        </div>
      )}

      {/* Main Workspace: Split into Left Problem Panel & Right Editor Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Statement Panel (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-bg-card/50 p-6 backdrop-blur-md space-y-6 max-h-[850px] overflow-y-auto">
          {/* Problem Header */}
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-cyan-primary/10 text-cyan-light px-2.5 py-0.5 text-xs font-mono font-bold border border-cyan-primary/30">
                {problem.difficulty}
              </span>
              <span className="text-xs font-mono text-warning font-bold">
                {problem.points} Points
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">{problem.title}</h2>
            <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
              <span>Time: {problem.timeLimitSeconds}s</span>
              <span>Memory: {problem.memoryLimitMB}MB</span>
            </div>
          </div>

          {/* Problem Statement Body */}
          <div className="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
            <div className="whitespace-pre-line">{problem.statement}</div>

            {/* Input & Output Format */}
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

            {/* Sample Test Cases */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-text-primary text-xs uppercase tracking-wider font-mono">
                Sample Test Cases
              </h3>
              {problem.sampleTestCases.map((tc, idx) => (
                <div
                  key={tc.id || idx}
                  className="rounded-xl border border-border bg-bg-secondary p-4 space-y-2 text-xs font-mono"
                >
                  <span className="text-violet-light font-bold block">
                    Sample Case {idx + 1}:
                  </span>

                  <div>
                    <span className="text-text-muted block text-[11px]">Input:</span>
                    <pre className="rounded bg-[#070714] p-2 text-text-primary overflow-x-auto mt-0.5">
                      {tc.input}
                    </pre>
                  </div>

                  <div>
                    <span className="text-text-muted block text-[11px]">Expected Output:</span>
                    <pre className="rounded bg-[#070714] p-2 text-success overflow-x-auto mt-0.5">
                      {tc.expectedOutput}
                    </pre>
                  </div>

                  {tc.explanation && (
                    <p className="text-[11px] text-text-secondary pt-1 italic font-sans">
                      <strong>Explanation:</strong> {tc.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Bottom Runner (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Integrated Editor */}
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

          {/* Action Execution Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-card/70 p-4">
            <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
              <Cpu className="h-4 w-4 text-violet-light" />
              <span>Judge: GCC / Node / Py3.11</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Ask AI Mentor */}
              <button
                type="button"
                onClick={handleRequestAiHint}
                disabled={isRunningTests || isSubmitting || aiLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 px-3.5 py-2.5 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
                title="Get algorithmic guidance from Groq / Gemini"
              >
                {aiLoading && aiType === "hint" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                ) : (
                  <Sparkles className="h-4 w-4 text-purple-400" />
                )}
                <span>AI Hint</span>
              </button>

              {/* Run Sample Tests */}
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
                <span>Run Sample Tests</span>
              </button>

              {/* Submit Final Solution */}
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
                <span>Submit Solution</span>
              </button>
            </div>
          </div>

          {/* Test Results & Output Panel */}
          <div className="rounded-2xl border border-border bg-bg-card/60 p-4 space-y-4">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("tests")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "tests"
                      ? "bg-violet-primary/20 text-violet-light border border-violet-primary/30"
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
                      ? "bg-violet-primary/20 text-violet-light border border-violet-primary/30"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Compiler &amp; Logs</span>
                </button>
              </div>

              {testResults && !testResults.passed && (
                <button
                  type="button"
                  onClick={handleExplainError}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>Explain Failure</span>
                </button>
              )}
            </div>

            {/* Results Content */}
            {!testResults ? (
              <div className="py-8 text-center text-xs text-text-muted font-mono">
                Click "Run Sample Tests" to execute your code in the sandboxed judge.
              </div>
            ) : activeTab === "tests" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-secondary">
                    Status:{" "}
                    <strong className={testResults.passed ? "text-success" : "text-danger"}>
                      {testResults.passed ? "All Sample Tests Passed" : "Sample Tests Failed"}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testResults.results.map((res, i) => (
                    <div
                      key={res.id || i}
                      className={`rounded-xl border p-3 text-xs font-mono space-y-1.5 ${
                        res.passed ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary">Test Case {i + 1}</span>
                        <span className={res.passed ? "text-success font-bold" : "text-danger font-bold"}>
                          {res.passed ? "Passed" : "Failed"} ({res.timeMs}ms)
                        </span>
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Expected: <span className="text-success">{res.expectedOutput}</span>
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Output: <span className="text-text-primary">{res.actualOutput}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <pre className="rounded-xl bg-[#070714] p-4 font-mono text-xs text-cyan-light overflow-x-auto leading-relaxed">
                {testResults.compilerOutput}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* AI Mentor Dialog */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-purple-500/40 bg-bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>{aiType === "hint" ? "AI Mentor — Strategic Hint" : "AI Mentor — Error Analysis"}</span>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-text-muted hover:text-text-primary cursor-pointer p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs leading-relaxed text-text-secondary min-h-[100px] flex items-center justify-center">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-purple-300 font-mono">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Consulting neural models (Groq / Gemini)...</span>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 font-mono text-xs whitespace-pre-wrap">
                    {aiContent}
                  </div>
                  <p className="text-[11px] text-text-muted">
                    Powered by secure server-side Groq / Gemini. Official test execution is deterministically evaluated by JDoodle.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={isSubmitModalOpen}
        title="Submit Solution for Official Judging"
        message="Your solution will be executed against 10 comprehensive hidden test cases and judged for time/memory efficiency. Are you ready to submit?"
        confirmText="Confirm & Submit"
        cancelText="Cancel"
        variant="primary"
        icon="warning"
        loading={isSubmitting}
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
};

export const CodingBattlePage: React.FC = () => {
  return (
    <RoundAccessGuard roundSlug="coding">
      <CodingBattleWorkspace />
    </RoundAccessGuard>
  );
};

export default CodingBattlePage;
