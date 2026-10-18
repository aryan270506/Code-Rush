import * as admin from "firebase-admin";
import { recalculateLeaderboard } from "./leaderboard";

export interface QuizSubmissionRequest {
  competitionId?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  answers: Record<string, string>;
  timeSpentSeconds?: number;
}

export interface QuizEvaluationResult {
  userId: string;
  roundId: string;
  score: number;
  maxScore: number;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  isQualified: boolean;
  qualificationCutoff: number;
  submittedAt: string;
}

// Fallback authoritative keys if database keys not yet seeded (mirrors QUIZ_QUESTIONS)
const DEFAULT_QUIZ_KEYS: Record<string, string> = {
  q1: "opt_a",
  q2: "opt_b",
  q3: "opt_a",
  q4: "opt_b",
  q5: "opt_c",
  q6: "opt_b",
  q7: "opt_b",
  q8: "opt_a",
  q9: "opt_b",
  q10: "opt_c",
};

export async function evaluateQuizSubmission(
  req: QuizSubmissionRequest
): Promise<QuizEvaluationResult> {
  const competitionId = req.competitionId || "comp-2026-spring";
  const db = admin.database();

  // 1. Fetch private answer keys from /questionPrivate/{competitionId}/quiz
  let answerKeys: Record<string, string> = {};
  try {
    const keysSnap = await db.ref(`questionPrivate/${competitionId}/quiz`).once("value");
    answerKeys = keysSnap.val() || DEFAULT_QUIZ_KEYS;
  } catch {
    answerKeys = DEFAULT_QUIZ_KEYS;
  }

  // 2. Compute correct answers and score
  const questionIds = Object.keys(answerKeys);
  const totalQuestions = questionIds.length || 10;
  const pointsPerQuestion = 10;
  const maxScore = totalQuestions * pointsPerQuestion;
  const cutoff = 60; // Cutoff to qualify for Round 2 Coding Battle

  const normalizeOption = (val?: string) => (val || "").trim().toLowerCase().replace(/^opt_/, "");

  let correctCount = 0;
  for (const qid of questionIds) {
    const submittedAnswer = normalizeOption(req.answers[qid]);
    const expectedAnswer = normalizeOption(answerKeys[qid]);
    if (submittedAnswer && expectedAnswer && submittedAnswer === expectedAnswer) {
      correctCount++;
    }
  }

  const score = correctCount * pointsPerQuestion;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isQualified = score >= cutoff;
  const submittedAt = new Date().toISOString();

  const result: QuizEvaluationResult = {
    userId: req.userId,
    roundId: "quiz",
    score,
    maxScore,
    accuracy,
    totalQuestions,
    correctAnswers: correctCount,
    isQualified,
    qualificationCutoff: cutoff,
    submittedAt,
  };

  // 3. Atomically persist to Realtime Database
  const updates: Record<string, unknown> = {};
  updates[`roundAttempts/${competitionId}/quiz/${req.userId}`] = result;
  updates[`scores/${competitionId}/${req.userId}/quiz`] = score;
  updates[`scores/${competitionId}/${req.userId}/userName`] = req.userName || "Competitor";
  updates[`scores/${competitionId}/${req.userId}/userEmail`] = req.userEmail || "";
  updates[`scores/${competitionId}/${req.userId}/lastUpdated`] = submittedAt;
  updates[`qualification/${competitionId}/quiz/${req.userId}`] = {
    status: isQualified ? "qualified" : "not_qualified",
    score,
    cutoff,
    updatedAt: submittedAt,
  };

  await db.ref().update(updates);

  // 4. Update leaderboard asynchronously
  try {
    await recalculateLeaderboard(competitionId);
  } catch (err) {
    console.error("[evaluateQuizSubmission] Leaderboard recalculation error:", err);
  }

  return result;
}
