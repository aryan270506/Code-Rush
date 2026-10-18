import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { participantService } from "../../../services/participantService";
import type { QuizQuestion, QuizSubmission } from "../../../types/participant";
import { ConfirmDialog } from "../../../components/participant/ConfirmDialog";

export const QuizBattlePage: React.FC = () => {
  // Quiz states: 'intro' | 'active' | 'results'
  const [gameState, setGameState] = useState<"intro" | "active" | "results">("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number>(20 * 60); // 20 minutes in seconds
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    accuracy: number;
    correct: number;
    incorrect: number;
  } | null>(null);

  // Check for previous submission on mount
  useEffect(() => {
    participantService.getQuizQuestions().then((qList) => {
      setQuestions(qList);
    });

    const pastSub = participantService.getQuizSubmission();
    if (pastSub && pastSub.status === "evaluated") {
      setAnswers(pastSub.answers || {});
      setEvaluationResult({
        score: pastSub.score || 120,
        accuracy: pastSub.accuracy || 80,
        correct: pastSub.correctCount || 8,
        incorrect: pastSub.incorrectCount || 2,
      });
      setGameState("results");
    }
  }, []);

  // Timer interval during active quiz
  useEffect(() => {
    if (gameState !== "active") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, answers]);

  const handleStartQuiz = () => {
    setGameState("active");
    setTimeLeft(20 * 60);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleToggleReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleAutoSubmit = async () => {
    await performSubmission();
  };

  const performSubmission = async () => {
    setIsSubmitting(true);
    try {
      const submission: QuizSubmission = {
        roundId: 1,
        answers,
        markedForReview: Array.from(markedForReview),
        startedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        answeredCount: Object.keys(answers).length,
        status: "submitted",
      };

      const res = await participantService.submitQuiz(submission);

      const pastSub = participantService.getQuizSubmission();
      setEvaluationResult({
        score: res.score,
        accuracy: res.accuracy,
        correct: pastSub?.correctCount || Math.round((res.score / (questions.length * 10)) * questions.length),
        incorrect: pastSub?.incorrectCount || 0,
      });

      setIsSubmitModalOpen(false);
      setGameState("results");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex] || questions[0];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);

  // ─────────────────────────────────────────────────────────────────────
  // VIEW 1: INTRO SCREEN
  // ─────────────────────────────────────────────────────────────────────
  if (gameState === "intro") {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-6">
        {/* Header Banner */}
        <div className="rounded-3xl border border-violet-primary/30 bg-gradient-to-br from-[#0c0c24] via-[#101032] to-[#070719] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-primary/10 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 text-xs font-mono font-semibold uppercase tracking-wider text-violet-light mb-3">
            <Brain className="h-4 w-4" />
            <span>Round 1 • Core Fundamentals</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Quiz Battle Arena
          </h1>

          <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl">
            Test your command of algorithms, asymptotic complexity, asynchronous paradigms, and
            operating systems under competitive speed conditions.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono">
            <div className="rounded-xl border border-border bg-bg-card/70 px-4 py-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-light" />
              <span>Time Limit: 20 Minutes</span>
            </div>
            <div className="rounded-xl border border-border bg-bg-card/70 px-4 py-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-light" />
              <span>10 Algorithmic Questions</span>
            </div>
            <div className="rounded-xl border border-border bg-bg-card/70 px-4 py-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" />
              <span>Max Score: 100 Points</span>
            </div>
          </div>
        </div>

        {/* Rules & Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-bg-card/60 p-6 space-y-4">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" />
              <span>Scoring Rules</span>
            </h3>
            <ul className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-success font-bold font-mono">+10 pts</span>
                <span>Awarded for every correctly chosen answer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-danger font-bold font-mono">-2 pts</span>
                <span>Negative marking applied for incorrect answer submissions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-muted font-bold font-mono">0 pts</span>
                <span>No penalty for questions left unanswered.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-light font-bold font-mono">Qualification</span>
                <span>Score at least 60 points to unlock Round 2 Coding Battle.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card/60 p-6 space-y-4">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-light" />
              <span>Session & Proctoring</span>
            </h3>
            <ul className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-light mt-1.5 shrink-0" />
                <span>Timer begins immediately when you click Start Quiz Battle.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-light mt-1.5 shrink-0" />
                <span>You can freely navigate between questions before submitting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-light mt-1.5 shrink-0" />
                <span>Auto-submission is triggered instantly when the countdown reaches 00:00.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-light mt-1.5 shrink-0" />
                <span>Answers are saved automatically as you make your selections.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={handleStartQuiz}
            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-primary to-cyan-dark px-8 py-4 text-sm font-bold text-white shadow-xl shadow-violet-primary/25 hover:opacity-95 hover:scale-102 transition-all cursor-pointer"
          >
            <Brain className="h-5 w-5" />
            <span>Start Quiz Battle</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // VIEW 2: ACTIVE QUIZ WORKSPACE
  // ─────────────────────────────────────────────────────────────────────
  if (gameState === "active" && currentQ) {
    const isCurrentMarked = markedForReview.has(currentQ.id);

    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Top Floating Control Bar */}
        <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-[#0b0b20]/95 backdrop-blur-md p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-violet-primary/20 px-3 py-1 font-mono text-xs font-bold text-violet-light border border-violet-primary/40">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
              <span>{answeredCount} Answered</span>
              <span>•</span>
              <span>{unansweredCount} Left</span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 font-mono text-sm font-bold px-4 py-1.5 rounded-xl border ${
              timeLeft < 180
                ? "bg-danger/20 text-danger border-danger/40 animate-pulse"
                : "bg-bg-card text-cyan-light border-cyan-primary/30"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          {/* Finish / Submit Trigger */}
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-primary px-4 py-2 text-xs font-bold text-white hover:bg-violet-light transition-all shadow-md shadow-violet-primary/30 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Submit Quiz</span>
          </button>
        </div>

        {/* Main Quiz Body: Question Area (Left) + Navigator Grid (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel (3 cols) */}
          <div className="lg:col-span-3 rounded-3xl border border-border bg-bg-card/60 p-6 sm:p-8 backdrop-blur-md flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold font-mono uppercase text-violet-light">
                  {currentQ.points} Points • {currentQ.negativePoints} Penalty
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleReview(currentQ.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    isCurrentMarked
                      ? "bg-warning/20 text-warning border-warning/40"
                      : "bg-bg-secondary text-text-muted border-border hover:text-text-primary"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>{isCurrentMarked ? "Marked for Review" : "Mark for Review"}</span>
                </button>
              </div>

              {/* Statement */}
              <h2 className="text-base sm:text-lg font-bold text-text-primary leading-relaxed">
                {currentQ.statement}
              </h2>

              {/* Code Snippet if present */}
              {currentQ.codeSnippet && (
                <div className="rounded-xl border border-border bg-[#070714] p-4 font-mono text-xs sm:text-sm text-cyan-light overflow-x-auto selection:bg-violet-primary/30">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-violet-primary/20 border-violet-primary text-white shadow-lg shadow-violet-primary/10"
                          : "bg-bg-secondary/70 border-border text-text-secondary hover:bg-bg-card hover:text-text-primary hover:border-violet-primary/30"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-violet-primary text-white"
                            : "bg-bg-card border border-border text-text-muted"
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="text-sm font-medium leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Question Navigation (Prev / Next) */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-bg-card-hover hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-bg-card-hover hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Question Navigator Palette (Right 1 col) */}
          <div className="rounded-3xl border border-border bg-bg-card/50 p-6 backdrop-blur-md space-y-5">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <span>Question Palette</span>
            </h3>

            {/* Grid of numbers */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q.id]);
                const isMarked = markedForReview.has(q.id);

                let btnStyles = "bg-bg-secondary text-text-muted border-border";
                if (isAnswered) {
                  btnStyles = "bg-violet-primary/20 text-violet-light border-violet-primary/50";
                }
                if (isMarked) {
                  btnStyles = "bg-warning/20 text-warning border-warning/50";
                }
                if (isCurrent) {
                  btnStyles += " ring-2 ring-cyan-primary";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-mono text-xs font-bold border transition-all hover:scale-105 cursor-pointer flex items-center justify-center relative ${btnStyles}`}
                  >
                    <span>{idx + 1}</span>
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-bg-secondary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div className="space-y-2 pt-4 border-t border-border text-[11px] font-mono text-text-muted">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-violet-primary/30 border border-violet-primary/60" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-bg-secondary border border-border" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-warning/30 border border-warning/60" />
                <span>Marked for Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isSubmitModalOpen}
          title="Finalize & Submit Quiz Battle"
          message={`You have answered ${answeredCount} of ${questions.length} questions (${unansweredCount} remaining unanswered). Once submitted, answers are final and cannot be modified.`}
          confirmText="Submit Answers"
          cancelText="Continue Test"
          variant="primary"
          icon="warning"
          loading={isSubmitting}
          onConfirm={performSubmission}
          onCancel={() => setIsSubmitModalOpen(false)}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // VIEW 3: RESULTS & EVALUATION
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-6">
      {/* Result Hero Card */}
      <div className="rounded-3xl border border-success/30 bg-gradient-to-br from-[#0b1c1b] via-[#0d162d] to-[#070717] p-8 shadow-2xl relative overflow-hidden text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>Round 1 Evaluated • Qualified</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Quiz Battle Completed!
            </h1>

            <p className="text-sm text-text-secondary max-w-lg leading-relaxed">
              Congratulations! Your answers have been recorded and scored. You have exceeded the
              qualification threshold and unlocked Round 2: Coding Battle.
            </p>
          </div>

          {/* Big Score Dial */}
          <div className="shrink-0 flex flex-col items-center justify-center h-36 w-36 rounded-full border-2 border-violet-primary/40 bg-gradient-to-tr from-violet-primary/20 to-cyan-primary/20 shadow-xl">
            <span className="font-mono text-3xl font-extrabold text-white">
              {evaluationResult?.score ?? 120}
            </span>
            <span className="font-mono text-xs text-text-muted">/ 150 Points</span>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
          <div className="rounded-xl bg-bg-card/70 p-4 border border-border">
            <span className="text-xs text-text-muted block font-mono">Accuracy</span>
            <span className="text-xl font-bold text-cyan-light font-mono mt-0.5 block">
              {evaluationResult?.accuracy ?? 80}%
            </span>
          </div>
          <div className="rounded-xl bg-bg-card/70 p-4 border border-border">
            <span className="text-xs text-text-muted block font-mono">Correct Answers</span>
            <span className="text-xl font-bold text-success font-mono mt-0.5 block">
              {evaluationResult?.correct ?? 8} questions
            </span>
          </div>
          <div className="rounded-xl bg-bg-card/70 p-4 border border-border">
            <span className="text-xs text-text-muted block font-mono">Status</span>
            <span className="text-xl font-bold text-violet-light font-mono mt-0.5 block">
              Qualified
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Link
          to="/participant/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-5 py-3 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>

        <Link
          to="/participant/rounds/coding"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-primary to-cyan-primary px-6 py-3 text-xs font-bold text-white shadow-lg shadow-violet-primary/25 hover:opacity-95 transition-all"
        >
          <span>Advance to Coding Battle (Round 2)</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Review Questions & Explanations */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-text-primary">Question Review &amp; Official Solutions</h3>

        {questions.map((q, idx) => {
          const userAns = answers[q.id];
          const isCorrect = userAns === q.correctOptionId;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-5 space-y-3 ${
                isCorrect ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-text-primary">Question {idx + 1}</span>
                <span className={isCorrect ? "text-success font-bold" : "text-danger font-bold"}>
                  {isCorrect ? "+10 Points" : "-2 Points"}
                </span>
              </div>

              <p className="text-sm font-semibold text-text-primary">{q.statement}</p>

              {q.codeSnippet && (
                <div className="rounded-xl bg-[#070714] p-3 font-mono text-xs text-cyan-light overflow-x-auto">
                  <pre>{q.codeSnippet}</pre>
                </div>
              )}

              {/* Explanation note */}
              {q.explanation && (
                <div className="rounded-xl bg-bg-card p-3 border border-border text-xs text-text-secondary leading-relaxed">
                  <strong className="text-violet-light font-mono block mb-1">Official Explanation:</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizBattlePage;
