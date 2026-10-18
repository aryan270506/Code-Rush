import * as admin from "firebase-admin";
import { executeCodeWithJDoodle } from "../execution/jdoodle";
import { recalculateLeaderboard } from "./leaderboard";

export interface CodeSubmissionPayload {
  competitionId?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  roundSlug: "coding" | "debugging" | "final";
  problemId: string;
  problemTitle?: string;
  language: string;
  code: string;
}

export interface TestCaseResult {
  id: string;
  passed: boolean;
  timeMs: number;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  isHidden?: boolean;
}

export interface CodeEvaluationResponse {
  submissionId: string;
  status: "accepted" | "wrong_answer" | "time_limit_exceeded" | "runtime_error" | "compilation_error";
  score: number;
  maxScore: number;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  compilerOutput: string;
  testCaseResults: TestCaseResult[];
  isQualified: boolean;
  submittedAt: string;
}

export async function evaluateCodeSubmission(
  payload: CodeSubmissionPayload
): Promise<CodeEvaluationResponse> {
  const competitionId = payload.competitionId || "comp-2026-spring";
  const db = admin.database();
  const submissionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const submittedAt = new Date().toISOString();

  // 1. Fetch test cases from /questionPrivate/{competitionId}/{roundSlug}/{problemId}
  const testCasesSnapshot = await db.ref(`questionPrivate/${competitionId}/${payload.roundSlug}/${payload.problemId}`).once("value");
  const testCases = testCasesSnapshot.val() as Array<{ id: string; input: string; expectedOutput: string; isHidden?: boolean; points: number }> | null;
  if (!testCases || testCases.length === 0) {
    throw new Error("Evaluation test cases are not configured for this challenge.");
  }

  const results: TestCaseResult[] = [];
  let passedCount = 0;
  let totalScoreEarned = 0;
  let totalExecutionTime = 0;
  let overallCompilerOutput = "";
  let overallStatus: CodeEvaluationResponse["status"] = "accepted";

  // 2. Execute against test cases
  for (const tc of testCases) {
    const jdoodleRes = await executeCodeWithJDoodle({
      script: payload.code,
      language: payload.language,
      stdin: tc.input,
    });

    const executionTimeMs = jdoodleRes.cpuTime ? Math.round(parseFloat(jdoodleRes.cpuTime) * 1000) : 120;
    totalExecutionTime += executionTimeMs;
    overallCompilerOutput = jdoodleRes.output;

    if (jdoodleRes.statusCode === 408) {
      overallStatus = "time_limit_exceeded";
    } else if (jdoodleRes.statusCode !== 200 && jdoodleRes.error) {
      overallStatus = "runtime_error";
    }

    const actualTrimmed = (jdoodleRes.output || "").trim();
    const expectedTrimmed = (tc.expectedOutput || "").trim();
    const isPassed = actualTrimmed === expectedTrimmed;

    if (isPassed) {
      passedCount++;
      totalScoreEarned += tc.points || 20;
    } else if (overallStatus === "accepted") {
      overallStatus = "wrong_answer";
    }

    // Sanitize for response: do NOT expose hidden test inputs/outputs to participants!
    results.push({
      id: tc.id,
      passed: isPassed,
      timeMs: executionTimeMs,
      input: tc.isHidden ? undefined : tc.input,
      expectedOutput: tc.isHidden ? undefined : tc.expectedOutput,
      actualOutput: tc.isHidden ? (isPassed ? "Output matches expected" : "Output mismatch on hidden test case") : actualTrimmed,
      isHidden: tc.isHidden,
    });
  }

  const roundSnapshot = await db.ref(`rounds/${competitionId}/${payload.roundSlug}`).once("value");
  const roundConfig = roundSnapshot.val();
  if (!roundConfig) {
    throw new Error("Round evaluation configuration is missing.");
  }
  const qualificationCutoff = Number(roundConfig.qualificationCutoff);
  const maxScore = Number(roundConfig.maxScore);
  if (!Number.isFinite(qualificationCutoff) || !Number.isFinite(maxScore)) {
    throw new Error("Round score configuration is invalid.");
  }
  const isQualified = totalScoreEarned >= qualificationCutoff;

  const response: CodeEvaluationResponse = {
    submissionId,
    status: overallStatus,
    score: totalScoreEarned,
    maxScore,
    passedTests: passedCount,
    totalTests: testCases.length,
    executionTimeMs: Math.round(totalExecutionTime / (testCases.length || 1)),
    compilerOutput: overallCompilerOutput,
    testCaseResults: results,
    isQualified,
    submittedAt,
  };

  // 3. Atomically persist to Realtime Database
  const updates: Record<string, unknown> = {};
  updates[`submissions/${competitionId}/${payload.roundSlug}/${payload.userId}/${submissionId}`] = {
    ...response,
    problemId: payload.problemId,
    problemTitle: payload.problemTitle || payload.problemId,
    language: payload.language,
    code: payload.code,
    codeLength: payload.code.length,
    evaluation: response,
  };

  // Update round score if higher than previous attempt
  const currentScoreSnap = await db.ref(`scores/${competitionId}/${payload.userId}/${payload.roundSlug}`).once("value");
  const previousScore = Number(currentScoreSnap.val() || 0);
  if (totalScoreEarned > previousScore) {
    updates[`scores/${competitionId}/${payload.userId}/${payload.roundSlug}`] = totalScoreEarned;
  }
  updates[`scores/${competitionId}/${payload.userId}/userName`] = payload.userName || "Competitor";
  updates[`scores/${competitionId}/${payload.userId}/userEmail`] = payload.userEmail || "";
  updates[`scores/${competitionId}/${payload.userId}/lastUpdated`] = submittedAt;

  // Qualification status
  updates[`qualification/${competitionId}/${payload.roundSlug}/${payload.userId}`] = {
    status: isQualified ? "qualified" : "not_qualified",
    score: totalScoreEarned,
    cutoff: roundConfig.cutoff,
    updatedAt: submittedAt,
  };

  await db.ref().update(updates);

  // 4. Update leaderboard
  try {
    await recalculateLeaderboard(competitionId);
  } catch (err) {
    console.error("[evaluateCodeSubmission] Leaderboard recalculation error:", err);
  }

  return response;
}
