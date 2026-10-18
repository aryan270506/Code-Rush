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

export async function evaluateQuizSubmission(
  req: QuizSubmissionRequest
): Promise<QuizEvaluationResult> {
  const competitionId = req.competitionId || "comp-2026-spring";
  const db = admin.database();

  // 1. Fetch private answer keys from /questionPrivate/{competitionId}/quiz
  const keysSnap = await db.ref(`questionPrivate/${competitionId}/quiz`).once("value");
  const answerKeys = keysSnap.val() as Record<string, { answer: string } | string> | null;
  if (!answerKeys || Object.keys(answerKeys).length === 0) {
    throw new Error("Quiz answer keys are not configured for this competition.");
  }

  // 2. Compute correct answers and score
  const questionIds = Object.keys(answerKeys);
  const questionsSnapshot = await db.ref(`questions/${competitionId}`).once("value");
  const questions = questionsSnapshot.val() || {};
  const totalQuestions = questionIds.length;
  const pointsPerQuestion = Number(questions[questionIds[0]]?.points || 10);
  const maxScore = questionIds.reduce(
    (sum, questionId) => sum + Number(questions[questionId]?.points || pointsPerQuestion),
    0
  );
  const roundSnapshot = await db.ref(`rounds/${competitionId}/quiz`).once("value");
  const cutoff = Number(roundSnapshot.val()?.qualificationCutoff);
  if (!Number.isFinite(cutoff)) {
    throw new Error("Quiz qualification cutoff is not configured for this competition.");
  }

  const normalizeOption = (val?: string) => (val || "").trim().toLowerCase().replace(/^opt_/, "");

  let correctCount = 0;
  for (const qid of questionIds) {
    const submittedAnswer = normalizeOption(req.answers[qid]);
    const configuredAnswer = answerKeys[qid];
    const expectedAnswer = normalizeOption(
      typeof configuredAnswer === "string" ? configuredAnswer : configuredAnswer?.answer
    );
    if (submittedAnswer && expectedAnswer && submittedAnswer === expectedAnswer) {
      correctCount++;
    }
  }

  const score = questionIds.reduce(
    (sum, questionId) => sum + (normalizeOption(req.answers[questionId]) === normalizeOption(
      typeof answerKeys[questionId] === "string" ? answerKeys[questionId] : answerKeys[questionId]?.answer
    ) ? Number(questions[questionId]?.points || pointsPerQuestion) : 0),
    0
  );
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
