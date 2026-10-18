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

// Built-in test cases if not yet configured in DB
const DEFAULT_TEST_CASES: Record<string, Array<{ id: string; input: string; expectedOutput: string; isHidden?: boolean; points: number }>> = {
  // Coding Battle: Subarray Sum / XOR
  "prob-subarray-sum": [
    { id: "tc-1", input: "5 12\n1 2 3 7 5", expectedOutput: "2 4", isHidden: false, points: 20 },
    { id: "tc-2", input: "10 15\n1 2 3 4 5 6 7 8 9 10", expectedOutput: "1 5", isHidden: false, points: 20 },
    { id: "tc-3", input: "4 0\n1 2 3 4", expectedOutput: "-1", isHidden: true, points: 20 },
    { id: "tc-4", input: "1 5\n5", expectedOutput: "1 1", isHidden: true, points: 20 },
    { id: "tc-5", input: "6 33\n1 4 20 3 10 5", expectedOutput: "3 5", isHidden: true, points: 20 },
  ],
  "p1": [
    { id: "tc-1", input: "4\n1 2 3 4", expectedOutput: "7", isHidden: false, points: 25 },
    { id: "tc-2", input: "3\n8 1 2", expectedOutput: "11", isHidden: false, points: 25 },
    { id: "tc-3", input: "5\n2 5 8 1 3", expectedOutput: "15", isHidden: true, points: 25 },
    { id: "tc-4", input: "1\n42", expectedOutput: "42", isHidden: true, points: 25 },
  ],
  "p2": [
    { id: "tc-1", input: "6 2\nA A A B B B", expectedOutput: "8", isHidden: false, points: 50 },
    { id: "tc-2", input: "6 0\nA A A B B B", expectedOutput: "6", isHidden: true, points: 50 },
  ],
  // Debugging Battle: Binary Search & LRU Cache
  "debug-lru-cache": [
    { id: "dbg-1", input: "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2", expectedOutput: "1\n-1", isHidden: false, points: 35 },
    { id: "dbg-2", input: "1\nput 2 1\nget 2\nput 3 2\nget 2\nget 3", expectedOutput: "1\n-1\n2", isHidden: true, points: 40 },
  ],
  "dbg1": [
    { id: "dbg-1", input: "5 4\n1 2 4 6 7", expectedOutput: "2", isHidden: false, points: 35 },
    { id: "dbg-2", input: "5 8\n1 2 4 6 7", expectedOutput: "5", isHidden: false, points: 20 },
    { id: "dbg-3", input: "0 5\n", expectedOutput: "0", isHidden: true, points: 20 },
  ],
  "dbg2": [
    { id: "dbg-1", input: "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2", expectedOutput: "1\n-1", isHidden: false, points: 35 },
    { id: "dbg-2", input: "1\nput 2 1\nget 2\nput 3 2\nget 2\nget 3", expectedOutput: "1\n-1\n2", isHidden: true, points: 40 },
  ],
  // Final Battle: Distributed Graph Consensus & Quantum Routing
  "final-consensus-tree": [
    { id: "fn-1", input: "4 3\n1 2 5\n2 3 10\n3 4 15", expectedOutput: "30", isHidden: false, points: 100 },
    { id: "fn-2", input: "5 4\n1 2 2\n2 3 3\n3 4 4\n4 5 5", expectedOutput: "14", isHidden: true, points: 100 },
    { id: "fn-3", input: "3 3\n1 2 1\n2 3 2\n1 3 3", expectedOutput: "3", isHidden: true, points: 100 },
  ],
  "fn1": [
    { id: "fn-1", input: "4 3 1 4 0.5\n1 2 5 0.9\n2 3 10 0.9\n3 4 15 0.9", expectedOutput: "30", isHidden: false, points: 75 },
    { id: "fn-2", input: "3 2 1 3 0.9\n1 2 10 0.8\n2 3 10 0.8", expectedOutput: "-1", isHidden: true, points: 75 },
  ],
};

const ROUND_CUTOFFS: Record<string, { cutoff: number; maxScore: number }> = {
  coding: { cutoff: 100, maxScore: 200 },
  debugging: { cutoff: 75, maxScore: 180 },
  final: { cutoff: 150, maxScore: 300 },
};

export async function evaluateCodeSubmission(
  payload: CodeSubmissionPayload
): Promise<CodeEvaluationResponse> {
  const competitionId = payload.competitionId || "comp-2026-spring";
  const db = admin.database();
  const submissionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const submittedAt = new Date().toISOString();

  // 1. Fetch test cases from /questionPrivate/{competitionId}/{roundSlug}/{problemId}
  let testCases = DEFAULT_TEST_CASES[payload.problemId];
  if (!testCases) {
    try {
      const snap = await db.ref(`questionPrivate/${competitionId}/${payload.roundSlug}/${payload.problemId}`).once("value");
      testCases = snap.val() || DEFAULT_TEST_CASES["prob-subarray-sum"];
    } catch {
      testCases = DEFAULT_TEST_CASES["prob-subarray-sum"];
    }
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

  const roundConfig = ROUND_CUTOFFS[payload.roundSlug] || { cutoff: 100, maxScore: 200 };
  const isQualified = totalScoreEarned >= roundConfig.cutoff;

  const response: CodeEvaluationResponse = {
    submissionId,
    status: overallStatus,
    score: totalScoreEarned,
    maxScore: roundConfig.maxScore,
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
    codeLength: payload.code.length,
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
