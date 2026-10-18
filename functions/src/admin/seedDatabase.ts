import * as admin from "firebase-admin";
import { recalculateLeaderboard } from "../competition/leaderboard";

const COMPETITION_ID = "comp-2026-spring";
const SEED_SOURCE = "development-seed-2026-10";

type SeedParticipant = {
  uid: string;
  name: string;
  email: string;
  institution: string;
  department: string;
  year: number;
  scores: Record<string, number>;
  qualification: Record<string, "qualified" | "not_qualified">;
};

const participants: SeedParticipant[] = [
  { uid: "seed-participant-01", name: "Aditi Sharma", email: "aditi.sharma@seed.example.com", institution: "IIT Bombay", department: "Computer Science", year: 4, scores: { quiz: 90, coding: 170, debugging: 150, final: 250 }, qualification: { quiz: "qualified", coding: "qualified", debugging: "qualified", final: "qualified" } },
  { uid: "seed-participant-02", name: "Rohan Patil", email: "rohan.patil@seed.example.com", institution: "COEP Technological University", department: "Information Technology", year: 3, scores: { quiz: 80, coding: 130, debugging: 90 }, qualification: { quiz: "qualified", coding: "qualified", debugging: "qualified" } },
  { uid: "seed-participant-03", name: "Priya Kulkarni", email: "priya.kulkarni@seed.example.com", institution: "VJTI Mumbai", department: "Computer Engineering", year: 3, scores: { quiz: 60, coding: 112 }, qualification: { quiz: "qualified", coding: "qualified" } },
  { uid: "seed-participant-04", name: "Aditya Deshmukh", email: "aditya.deshmukh@seed.example.com", institution: "BITS Pilani, Goa Campus", department: "Computer Science", year: 2, scores: { quiz: 48 }, qualification: { quiz: "not_qualified" } },
  { uid: "seed-participant-05", name: "Sneha Joshi", email: "sneha.joshi@seed.example.com", institution: "NIT Surathkal", department: "Artificial Intelligence", year: 4, scores: { quiz: 75, coding: 105, debugging: 80 }, qualification: { quiz: "qualified", coding: "qualified", debugging: "qualified" } },
  { uid: "seed-participant-06", name: "Rahul Verma", email: "rahul.verma@seed.example.com", institution: "IIT Delhi", department: "Mathematics and Computing", year: 4, scores: { quiz: 82 }, qualification: { quiz: "qualified" } },
  { uid: "seed-participant-07", name: "Ananya Iyer", email: "ananya.iyer@seed.example.com", institution: "IIIT Hyderabad", department: "Computer Science", year: 3, scores: { quiz: 56 }, qualification: { quiz: "not_qualified" } },
  { uid: "seed-participant-08", name: "Karan Shah", email: "karan.shah@seed.example.com", institution: "DA-IICT Gandhinagar", department: "Information and Communication Technology", year: 2, scores: { quiz: 68, coding: 72 }, qualification: { quiz: "qualified", coding: "not_qualified" } },
];

const questions = {
  "quiz-q-01": { id: "quiz-q-01", competitionId: COMPETITION_ID, roundName: "quiz", title: "Amortized Dynamic Array Insertion", difficulty: "easy", type: "mcq", points: 10, status: "published", tags: ["complexity", "data-structures"], statement: "What is the amortized complexity of appending to a dynamically growing array?", options: [{ id: "opt-a", text: "O(1) amortized" }, { id: "opt-b", text: "O(n) amortized" }, { id: "opt-c", text: "O(log n) amortized" }, { id: "opt-d", text: "O(n log n)" }] },
  "quiz-q-02": { id: "quiz-q-02", competitionId: COMPETITION_ID, roundName: "quiz", title: "Shortest Path in an Unweighted Graph", difficulty: "easy", type: "mcq", points: 10, status: "published", tags: ["graphs", "bfs"], statement: "Which traversal finds shortest paths in an unweighted graph?", options: [{ id: "opt-a", text: "Depth-first search" }, { id: "opt-b", text: "Breadth-first search" }, { id: "opt-c", text: "Floyd-Warshall" }, { id: "opt-d", text: "Topological sort" }] },
  "coding-q-01": { id: "coding-q-01", competitionId: COMPETITION_ID, roundName: "coding", title: "Longest Distinct Subarray", difficulty: "medium", type: "coding", points: 100, status: "published", tags: ["arrays", "hash-maps", "sliding-window"], statement: "Given an integer array, return the length of the longest contiguous subarray containing no repeated value.", inputFormat: "N followed by N integers.", outputFormat: "The maximum distinct-window length.", constraints: "1 <= N <= 100000", starterCode: { python: "def solve(values):\n    pass\n" }, sampleCases: [{ input: "5\n1 2 1 3 4", output: "4", explanation: "The longest window is 2, 1, 3, 4." }] },
  "debugging-q-01": { id: "debugging-q-01", competitionId: COMPETITION_ID, roundName: "debugging", title: "Repair Lower-Bound Search", difficulty: "medium", type: "debugging", points: 90, status: "published", tags: ["binary-search", "invariants"], statement: "Fix the loop invariant and boundary updates so lower_bound handles empty arrays and upper-bound targets.", inputFormat: "N, target, and a sorted integer array.", outputFormat: "The first index whose value is at least target.", constraints: "0 <= N <= 100000", starterCode: { python: "def lower_bound(values, target):\n    low = 0\n    high = len(values) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid\n        else:\n            high = mid - 1\n    return low\n" }, sampleCases: [{ input: "5 4\n1 2 4 6 7", output: "2", explanation: "The target is already present at index 2." }] },
  "final-q-01": { id: "final-q-01", competitionId: COMPETITION_ID, roundName: "final", title: "Resilient Route Planning", difficulty: "expert", type: "final", points: 300, status: "published", tags: ["graphs", "optimization"], statement: "Find the minimum-latency route that satisfies a minimum reliability threshold across a directed network.", inputFormat: "N, M, source, destination, threshold, followed by edges.", outputFormat: "The minimum valid route latency or -1.", constraints: "2 <= N <= 2500", starterCode: { python: "def solve(data):\n    pass\n" }, sampleCases: [{ input: "3 2 1 3 0.8\n1 2 5 0.95\n2 3 7 0.95", output: "12", explanation: "The route reliability is 0.9025." }] },
};

const privateQuestions = {
  quiz: { "quiz-q-01": { answer: "opt-a" }, "quiz-q-02": { answer: "opt-b" } },
  coding: { "coding-q-01": [{ id: "coding-q-01-hidden", input: "4\n1 2 3 4", expectedOutput: "4", points: 100, isHidden: true }] },
  debugging: { "debugging-q-01": [{ id: "debugging-q-01-hidden", input: "4 8\n1 3 5 7", expectedOutput: "4", points: 90, isHidden: true }] },
  final: { "final-q-01": [{ id: "final-q-01-hidden", input: "2 1 1 2 0.8\n1 2 4 0.9", expectedOutput: "4", points: 300, isHidden: true }] },
};

export async function seedCompetitionData(): Promise<{ success: boolean; message: string }> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Development seed data cannot run in production.");
  }

  const db = admin.database();
  const firestore = admin.firestore();
  const now = "2026-10-18T08:00:00.000Z";
  const updates: Record<string, unknown> = {
    [`competitions/${COMPETITION_ID}`]: { id: COMPETITION_ID, title: "Code Battle 2026 — Spring Grand Prix", description: "Synthetic development competition for testing the complete four-round pipeline.", rules: "Development-only seeded records. Scores and identities are synthetic.", startDate: "2026-10-18T09:00:00Z", endDate: "2026-10-19T21:00:00Z", registrationDeadline: "2026-10-18T23:59:59Z", status: "live", currentRound: "coding", durationHours: 36, maxTeams: participants.length, createdAt: now, updatedAt: now, seedSource: SEED_SOURCE },
    [`rounds/${COMPETITION_ID}/quiz`]: { id: 1, slug: "quiz", name: "Round 1: Quiz Battle", status: "available", maxScore: 100, durationMinutes: 20, questionCount: 2, qualificationCutoff: 60, shortDescription: "Fundamentals and algorithmic reasoning.", description: "A scored multiple-choice round.", startTime: "2026-10-18T10:00:00Z", endTime: "2026-10-18T12:00:00Z", requiresQualificationToAdvance: true, unlockConditionText: "Open to registered participants.", rules: ["Two questions in the seeded development dataset."], iconName: "Brain", color: "violet", seedSource: SEED_SOURCE },
    [`rounds/${COMPETITION_ID}/coding`]: { id: 2, slug: "coding", name: "Round 2: Coding Battle", status: "locked", maxScore: 200, durationMinutes: 90, questionCount: 1, qualificationCutoff: 100, shortDescription: "Algorithmic problem solving.", description: "A code-evaluation round.", startTime: "2026-10-18T12:30:00Z", endTime: "2026-10-18T14:00:00Z", requiresQualificationToAdvance: true, unlockConditionText: "Requires qualification in Quiz Battle.", rules: ["Source code is evaluated by the server."], iconName: "Code2", color: "cyan", seedSource: SEED_SOURCE },
    [`rounds/${COMPETITION_ID}/debugging`]: { id: 3, slug: "debugging", name: "Round 3: Debugging Battle", status: "locked", maxScore: 180, durationMinutes: 45, questionCount: 1, qualificationCutoff: 75, shortDescription: "Repair flawed algorithms.", description: "A debugging and invariant round.", startTime: "2026-10-18T15:00:00Z", endTime: "2026-10-18T16:30:00Z", requiresQualificationToAdvance: true, unlockConditionText: "Requires qualification in Coding Battle.", rules: ["Submit a minimal correction."], iconName: "Bug", color: "amber", seedSource: SEED_SOURCE },
    [`rounds/${COMPETITION_ID}/final`]: { id: 4, slug: "final", name: "Round 4: Final Battle", status: "locked", maxScore: 300, durationMinutes: 90, questionCount: 1, qualificationCutoff: 150, shortDescription: "The championship challenge.", description: "The final development challenge.", startTime: "2026-10-18T17:00:00Z", endTime: "2026-10-18T19:00:00Z", requiresQualificationToAdvance: false, unlockConditionText: "Requires qualification in Debugging Battle.", rules: ["Final results are published after evaluation."], iconName: "Trophy", color: "purple", seedSource: SEED_SOURCE },
    [`questions/${COMPETITION_ID}`]: questions,
    [`questionPrivate/${COMPETITION_ID}`]: privateQuestions,
    [`announcements/${COMPETITION_ID}/seed-announcement`]: { id: "seed-announcement", title: "Development dataset loaded", content: "This competition contains synthetic seed records for development and QA only.", author: "Code Battle Development", timestamp: now, priority: "medium", seedSource: SEED_SOURCE },
  };

  const batch = firestore.batch();
  for (const participant of participants) {
    batch.set(firestore.collection("users").doc(participant.uid), { uid: participant.uid, displayName: participant.name, email: participant.email, institution: participant.institution, department: participant.department, academicYear: participant.year, role: "participant", accountStatus: "active", emailVerified: true, seedSource: SEED_SOURCE, createdAt: now, updatedAt: now }, { merge: true });
    updates[`users/${participant.uid}`] = { uid: participant.uid, displayName: participant.name, email: participant.email, institution: participant.institution, role: "participant", status: "active", createdAt: now, seedSource: SEED_SOURCE };
    updates[`registrations/${COMPETITION_ID}/${participant.uid}`] = { participantId: participant.uid, competitionId: COMPETITION_ID, registeredAt: now, status: "registered", seedSource: SEED_SOURCE };
    updates[`scores/${COMPETITION_ID}/${participant.uid}`] = { ...participant.scores, userName: participant.name, userEmail: participant.email, lastUpdated: now, seedSource: SEED_SOURCE };
    updates[`participantProgress/${COMPETITION_ID}/${participant.uid}`] = { currentRound: Object.keys(participant.scores).length, seedSource: SEED_SOURCE, updatedAt: now };
    for (const [roundSlug, status] of Object.entries(participant.qualification)) {
      const score = participant.scores[roundSlug] || 0;
      const maxScore = roundSlug === "quiz" ? 100 : roundSlug === "coding" ? 200 : roundSlug === "debugging" ? 180 : 300;
      const attemptId = `seed-attempt-${participant.uid}-${roundSlug}`;
      updates[`qualification/${COMPETITION_ID}/${roundSlug}/${participant.uid}`] = { status, score, updatedAt: now, seedSource: SEED_SOURCE };
      updates[`roundAttempts/${COMPETITION_ID}/${roundSlug}/${participant.uid}/${attemptId}`] = { id: attemptId, attemptNumber: 1, status: "evaluated", startedAt: now, submittedAt: now, evaluatedAt: now, score, maxScore, seedSource: SEED_SOURCE };
      if (roundSlug === "quiz") {
        updates[`roundAttempts/${COMPETITION_ID}/${roundSlug}/${participant.uid}/${attemptId}/answers`] = { "quiz-q-01": score >= 60 ? "opt-a" : "opt-d", "quiz-q-02": score >= 60 ? "opt-b" : "opt-a" };
      } else if (score > 0) {
        const problemId = `${roundSlug}-q-01`;
        const submissionId = `seed-submission-${participant.uid}-${roundSlug}`;
        const code = roundSlug === "debugging" ? "def lower_bound(values, target):\n    return 0\n" : "def solve(values):\n    return len(values)\n";
        const evaluation = { status: score >= maxScore / 2 ? "accepted" : "wrong_answer", score, maxScore, passedTests: score >= maxScore / 2 ? 1 : 0, totalTests: 1, evaluatorType: "development-fixture", evaluatedAt: now };
        updates[`submissions/${COMPETITION_ID}/${roundSlug}/${participant.uid}/${submissionId}`] = { id: submissionId, participantId: participant.uid, competitionId: COMPETITION_ID, roundId: roundSlug, attemptId, questionId: problemId, submissionType: "code", code, language: "python", submittedAt: now, status: evaluation.status, score, maxScore, evaluation, seedSource: SEED_SOURCE };
      }
    }
  }

  await db.ref().update(updates);
  await batch.commit();
  await recalculateLeaderboard(COMPETITION_ID);
  return { success: true, message: `Development seed ${SEED_SOURCE} is installed idempotently for ${participants.length} synthetic participants.` };
}
