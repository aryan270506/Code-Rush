#!/usr/bin/env node

/**
 * Code Battle — Push Participants, Rounds, Questions & Competition Data to Live Firebase Realtime Database
 * 
 * Target: https://code-rush-ca3dd-default-rtdb.firebaseio.com
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const RTDB_URL = "https://code-rush-ca3dd-default-rtdb.firebaseio.com";
const API_KEY = "AIzaSyBETyd9o2TPOH147ToJyHz2H8iImKVFfpM";
const COMPETITION_ID = "comp-2026-spring";
const now = new Date().toISOString();

export const PARTICIPANTS = [
  {
    databaseId: "seed-participant-01",
    name: "Aditi Sharma",
    email: "aditi.sharma@seed.example.com",
    username: "aditi_sharma",
    password: "Password@Aditi2026#",
    institution: "IIT Bombay",
    department: "Computer Science",
    academicYear: 4,
    scores: { quiz: 90, coding: 170, debugging: 150, final: 250 },
    qualification: { quiz: "qualified", coding: "qualified", debugging: "qualified", final: "qualified" },
  },
  {
    databaseId: "seed-participant-02",
    name: "Rohan Patil",
    email: "rohan.patil@seed.example.com",
    username: "rohan_patil",
    password: "Password@Rohan2026#",
    institution: "COEP Technological University",
    department: "Information Technology",
    academicYear: 3,
    scores: { quiz: 80, coding: 130, debugging: 90 },
    qualification: { quiz: "qualified", coding: "qualified", debugging: "qualified" },
  },
  {
    databaseId: "seed-participant-03",
    name: "Priya Kulkarni",
    email: "priya.kulkarni@seed.example.com",
    username: "priya_kulkarni",
    password: "Password@Priya2026#",
    institution: "VJTI Mumbai",
    department: "Computer Engineering",
    academicYear: 3,
    scores: { quiz: 60, coding: 112 },
    qualification: { quiz: "qualified", coding: "qualified" },
  },
  {
    databaseId: "seed-participant-04",
    name: "Aditya Deshmukh",
    email: "aditya.deshmukh@seed.example.com",
    username: "aditya_deshmukh",
    password: "Password@Aditya2026#",
    institution: "BITS Pilani, Goa Campus",
    department: "Computer Science",
    academicYear: 2,
    scores: { quiz: 48 },
    qualification: { quiz: "not_qualified" },
  },
  {
    databaseId: "seed-participant-05",
    name: "Sneha Joshi",
    email: "sneha.joshi@seed.example.com",
    username: "sneha_joshi",
    password: "Password@Sneha2026#",
    institution: "NIT Surathkal",
    department: "Artificial Intelligence",
    academicYear: 4,
    scores: { quiz: 75, coding: 105, debugging: 80 },
    qualification: { quiz: "qualified", coding: "qualified", debugging: "qualified" },
  },
  {
    databaseId: "seed-participant-06",
    name: "Rahul Verma",
    email: "rahul.verma@seed.example.com",
    username: "rahul_verma",
    password: "Password@Rahul2026#",
    institution: "IIT Delhi",
    department: "Mathematics and Computing",
    academicYear: 4,
    scores: { quiz: 82 },
    qualification: { quiz: "qualified" },
  },
  {
    databaseId: "seed-participant-07",
    name: "Ananya Iyer",
    email: "ananya.iyer@seed.example.com",
    username: "ananya_iyer",
    password: "Password@Ananya2026#",
    institution: "IIIT Hyderabad",
    department: "Computer Science",
    academicYear: 3,
    scores: { quiz: 56 },
    qualification: { quiz: "not_qualified" },
  },
  {
    databaseId: "seed-participant-08",
    name: "Karan Shah",
    email: "karan.shah@seed.example.com",
    username: "karan_shah",
    password: "Password@Karan2026#",
    institution: "DA-IICT Gandhinagar",
    department: "Information and Communication Technology",
    academicYear: 2,
    scores: { quiz: 68, coding: 72 },
    qualification: { quiz: "qualified", coding: "not_qualified" },
  },
  {
    databaseId: "demo-participant-uid",
    name: "Alex Rivera",
    email: "participant@codebattle.dev",
    username: "alex_rivera",
    password: "Password@123",
    institution: "Code Battle University",
    department: "Software Engineering",
    academicYear: 3,
    scores: { quiz: 70, coding: 120 },
    qualification: { quiz: "qualified", coding: "qualified" },
  },
  {
    databaseId: "demo-admin-uid",
    name: "Code Battle Administrator",
    email: "admin@codebattle.dev",
    username: "admin",
    password: "AdminPassword@123",
    institution: "Code Battle HQ",
    department: "Administration",
    academicYear: 0,
    role: "admin",
    scores: {},
    qualification: {},
  },
];

export const INITIAL_ROUNDS_DATA = {
  quiz: {
    id: 1,
    slug: "quiz",
    name: "Quiz Battle",
    type: "quiz",
    roundNumber: 1,
    status: "available",
    maxScore: 100,
    maxMarks: 100,
    durationMinutes: 20,
    questionCount: 10,
    qualificationCutoff: 60,
    qualificationThreshold: 60,
    requiresQualificationToAdvance: true,
    unlockConditionText: "Open to all registered participants.",
    shortDescription: "Rapid-fire algorithmic, data structure, and system MCQs.",
    description: "Test core computer science fundamentals, time complexity reasoning, and language quirks under pressure. 10 questions in 20 minutes.",
    startTime: "2026-10-18T10:00:00Z",
    endTime: "2026-10-18T12:00:00Z",
    rules: [
      "10 multiple-choice questions.",
      "+10 points per correct answer, -2 points negative marking for wrong answers.",
      "Timer starts immediately upon clicking 'Start Quiz Battle'.",
      "Auto-submits when the countdown reaches 00:00.",
      "Must score >= 60 points to qualify for Round 2: Coding Battle."
    ],
    iconName: "Brain",
    color: "violet",
    enabled: true,
  },
  coding: {
    id: 2,
    slug: "coding",
    name: "Coding Battle",
    type: "coding",
    roundNumber: 2,
    status: "locked",
    maxScore: 200,
    maxMarks: 200,
    durationMinutes: 60,
    questionCount: 2,
    qualificationCutoff: 100,
    qualificationThreshold: 100,
    requiresQualificationToAdvance: true,
    unlockConditionText: "Requires >= 60 points in Round 1: Quiz Battle.",
    shortDescription: "Algorithmic challenges with automated sandboxed test execution.",
    description: "Solve competitive algorithmic challenges using efficient data structures. Code against hidden and sample test cases with strict constraints.",
    startTime: "2026-10-18T12:30:00Z",
    endTime: "2026-10-18T14:30:00Z",
    rules: [
      "Supported languages: Python 3, JavaScript (ES2022), C++17, Java 17.",
      "Evaluation against sample and hidden boundary test cases.",
      "Time limit: 2.0s per test case; Memory limit: 256 MB.",
      "Must score >= 100 points to unlock Round 3: Debugging Battle."
    ],
    iconName: "Code2",
    color: "cyan",
    enabled: true,
  },
  debugging: {
    id: 3,
    slug: "debugging",
    name: "Debugging Battle",
    type: "debugging",
    roundNumber: 3,
    status: "locked",
    maxScore: 150,
    maxMarks: 150,
    durationMinutes: 45,
    questionCount: 2,
    qualificationCutoff: 75,
    qualificationThreshold: 75,
    requiresQualificationToAdvance: true,
    unlockConditionText: "Requires >= 100 points in Round 2: Coding Battle.",
    shortDescription: "Diagnose, isolate, and fix logic flaws and concurrency race conditions.",
    description: "You are handed real-world codebases with subtle bugs: off-by-one errors, recursion depth overflows, and broken invariant checks. Fix and verify all unit tests.",
    startTime: "2026-10-18T15:00:00Z",
    endTime: "2026-10-18T16:30:00Z",
    rules: [
      "Do not rewrite the entire algorithm; repair the flawed logic cleanly.",
      "All public and edge test cases must pass.",
      "Must score >= 75 points to unlock Round 4: Final Battle."
    ],
    iconName: "Bug",
    color: "amber",
    enabled: true,
  },
  final: {
    id: 4,
    slug: "final",
    name: "Final Battle",
    type: "final",
    roundNumber: 4,
    status: "locked",
    maxScore: 300,
    maxMarks: 300,
    durationMinutes: 90,
    questionCount: 2,
    qualificationCutoff: 150,
    qualificationThreshold: 150,
    requiresQualificationToAdvance: false,
    unlockConditionText: "Requires >= 75 points in Round 3: Debugging Battle.",
    shortDescription: "The Championship Arena — Advanced graph & distributed systems challenge.",
    description: "The ultimate championship proving ground for top competitors. Highly challenging algorithmic problems designed to test ultimate engineering prowess.",
    startTime: "2026-10-18T17:00:00Z",
    endTime: "2026-10-18T19:00:00Z",
    rules: [
      "Access unlocked only for participants qualified through Rounds 1–3.",
      "Strict zero-tolerance anti-cheating check.",
      "Official final standings published following organizer audit."
    ],
    iconName: "Trophy",
    color: "purple",
    enabled: true,
  },
};

export const INITIAL_QUESTIONS = {
  "quiz-q-01": {
    id: "quiz-q-01",
    competitionId: COMPETITION_ID,
    roundName: "Quiz Battle",
    type: "quiz",
    difficulty: "easy",
    title: "Amortized Dynamic Array Insertion",
    statement: "What is the amortized time complexity of inserting an element into a dynamic array (like std::vector or Python list) when resizing is required?",
    options: [
      { id: "opt_a", text: "O(1) amortized" },
      { id: "opt_b", text: "O(n) worst and amortized" },
      { id: "opt_c", text: "O(log n) amortized" },
      { id: "opt_d", text: "O(n log n)" }
    ],
    correctAnswer: "opt_a",
    points: 10,
    marks: 10,
    explanation: "While a resize takes O(n) copying time, doubling capacity amortizes to O(1) per insert.",
    status: "published",
    tags: ["complexity", "data-structures"]
  },
  "quiz-q-02": {
    id: "quiz-q-02",
    competitionId: COMPETITION_ID,
    roundName: "Quiz Battle",
    type: "quiz",
    difficulty: "easy",
    title: "Recursive Tree Call",
    statement: "Consider function solve(n): if n <= 1 return 1; return solve(n - 1) + 2 * solve(n - 2). What is the value returned for call solve(4)?",
    options: [
      { id: "opt_a", text: "9" },
      { id: "opt_b", text: "11" },
      { id: "opt_c", text: "15" },
      { id: "opt_d", text: "13" }
    ],
    correctAnswer: "opt_b",
    points: 10,
    marks: 10,
    explanation: "solve(0)=1, solve(1)=1; solve(2)=3; solve(3)=5; solve(4)=11.",
    status: "published",
    tags: ["recursion", "dynamic-programming"]
  },
  "quiz-q-03": {
    id: "quiz-q-03",
    competitionId: COMPETITION_ID,
    roundName: "Quiz Battle",
    type: "quiz",
    difficulty: "medium",
    title: "Graph Cycle Detection",
    statement: "Which data structure is fundamentally utilized to detect cycles in an undirected graph in near-constant time per edge?",
    options: [
      { id: "opt_a", text: "Disjoint Set Union (Union-Find) with path compression" },
      { id: "opt_b", text: "Fibonacci Heap" },
      { id: "opt_c", text: "Segment Tree with lazy propagation" },
      { id: "opt_d", text: "Trie of Radix 2" }
    ],
    correctAnswer: "opt_a",
    points: 10,
    marks: 10,
    explanation: "Disjoint Set Union checks connected components in α(V) ≈ O(1) time.",
    status: "published",
    tags: ["graphs", "dsu"]
  },
  "quiz-q-04": {
    id: "quiz-q-04",
    competitionId: COMPETITION_ID,
    roundName: "Quiz Battle",
    type: "quiz",
    difficulty: "easy",
    title: "Unweighted Graph Traversal",
    statement: "Which graph traversal algorithm guarantees finding the shortest path in an unweighted graph?",
    options: [
      { id: "opt_a", text: "Depth First Search (DFS)" },
      { id: "opt_b", text: "Breadth First Search (BFS)" },
      { id: "opt_c", text: "Kosaraju's Algorithm" },
      { id: "opt_d", text: "Tarjan's Bridge-Finding Algorithm" }
    ],
    correctAnswer: "opt_b",
    points: 10,
    marks: 10,
    explanation: "BFS visits vertices in non-decreasing order of distance from source, ensuring shortest path.",
    status: "published",
    tags: ["graphs", "bfs"]
  },
  "quiz-q-05": {
    id: "quiz-q-05",
    competitionId: COMPETITION_ID,
    roundName: "Quiz Battle",
    type: "quiz",
    difficulty: "medium",
    title: "JavaScript Microtask Order",
    statement: "In JavaScript / TypeScript, which queue takes precedence for execution after synchronous code: Microtasks (Promises) or Macrotasks (setTimeout)?",
    options: [
      { id: "opt_a", text: "Macrotasks execute first" },
      { id: "opt_b", text: "Microtasks execute before Macrotasks" },
      { id: "opt_c", text: "They execute in random order" },
      { id: "opt_d", text: "Both execute concurrently via Web Workers" }
    ],
    correctAnswer: "opt_b",
    points: 10,
    marks: 10,
    explanation: "Microtasks (Promise resolution) run before Macrotasks (setTimeout, setInterval).",
    status: "published",
    tags: ["javascript", "event-loop"]
  },
  "coding-p1": {
    id: "coding-p1",
    competitionId: COMPETITION_ID,
    roundName: "Coding Battle",
    type: "coding",
    difficulty: "medium",
    title: "Subarray with Maximum XOR Sum",
    statement: "You are given an array of N non-negative integers. Your task is to find the maximum possible XOR sum of any contiguous non-empty subarray.",
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "A single integer denoting the maximum XOR sum.",
    constraints: "1 <= N <= 100,000\n0 <= A[i] < 2^30\nTime Limit: 2.0s\nMemory Limit: 256MB",
    points: 100,
    marks: 100,
    sampleCases: [
      { id: "tc1", input: "4\n1 2 3 4", output: "7", explanation: "Subarray [3, 4] gives 3 XOR 4 = 7." },
      { id: "tc2", input: "3\n8 1 2", output: "11", explanation: "Subarray [8, 1, 2] yields 8 ^ 1 ^ 2 = 11." }
    ],
    starterCode: {
      python: "import sys\ndef solve():\n    pass\nif __name__ == '__main__':\n    solve()\n",
      javascript: "const fs = require('fs');\nfunction solve() {\n  // your code\n}\nsolve();\n",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  return 0;\n}\n"
    },
    status: "published",
    tags: ["arrays", "trie", "bit-manipulation"]
  },
  "debugging-d1": {
    id: "debugging-d1",
    competitionId: COMPETITION_ID,
    roundName: "Debugging Battle",
    type: "debugging",
    difficulty: "medium",
    title: "Repair Lower-Bound Binary Search",
    statement: "Fix the loop invariants, overflow conditions, and boundary updates in the provided binary search so lower_bound properly handles target matches and empty arrays without infinite loops.",
    inputFormat: "Line 1: N target. Line 2: N sorted space-separated integers.",
    outputFormat: "The 0-indexed first position whose value is >= target.",
    constraints: "0 <= N <= 100,000\n-10^9 <= target, A[i] <= 10^9",
    points: 75,
    marks: 75,
    sampleCases: [
      { id: "dbg_tc1", input: "5 4\n1 2 4 6 7", output: "2", explanation: "Element 4 is at index 2." },
      { id: "dbg_tc2", input: "4 8\n1 3 5 7", output: "4", explanation: "All elements are less than 8." }
    ],
    starterCode: {
      python: "import sys\ndef find_lower_bound(arr, target):\n    low = 0\n    high = len(arr)\n    while low < high:\n        mid = low + (high - low) // 2\n        if arr[mid] >= target:\n            high = mid\n        else:\n            low = mid + 1\n    return low\n",
      javascript: "function findLowerBound(arr, target) {\n  let low = 0;\n  let high = arr.length;\n  while (low < high) {\n    const mid = Math.floor(low + (high - low) / 2);\n    if (arr[mid] >= target) high = mid;\n    else low = mid + 1;\n  }\n  return low;\n}\n"
    },
    status: "published",
    tags: ["binary-search", "debugging", "invariants"]
  },
  "final-f1": {
    id: "final-f1",
    competitionId: COMPETITION_ID,
    roundName: "Final Battle",
    type: "final",
    difficulty: "expert",
    title: "Quantum Fault-Tolerant Network Routing",
    statement: "Given a quantum photonic network modeled as a directed graph G=(V,E) with latencies and error probabilities, determine the minimum-latency route between source S and destination T such that the total composite packet coherence is >= theta.",
    inputFormat: "N M S T theta followed by M edge definitions (u, v, latency, coherence).",
    outputFormat: "Minimal integer route latency or -1 if no route satisfies threshold.",
    constraints: "2 <= N <= 2,500\n1 <= M <= 10,000\n0.01 <= theta <= 1.00",
    points: 300,
    marks: 300,
    sampleCases: [
      { id: "fn_tc1", input: "4 4 1 4 0.50\n1 2 10 0.90\n2 4 15 0.80\n1 3 5 0.60\n3 4 30 0.70", output: "25", explanation: "Optimal path latency is 25." }
    ],
    starterCode: {
      python: "import sys\ndef solve():\n    pass\nif __name__ == '__main__':\n    solve()\n"
    },
    status: "published",
    tags: ["graphs", "dijkstra", "optimization"]
  }
};

async function ensureFirebaseAuthUser(p) {
  try {
    const signupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: p.email,
          password: p.password,
          returnSecureToken: true,
        }),
      }
    );
    const signupData = await signupRes.json();
    if (signupData.localId) {
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken: signupData.idToken,
            displayName: p.name,
            returnSecureToken: false,
          }),
        }
      );
      return signupData.localId;
    }
    if (signupData.error?.message === "EMAIL_EXISTS") {
      const signInRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: p.email,
            password: p.password,
            returnSecureToken: true,
          }),
        }
      );
      const signInData = await signInRes.json();
      if (signInData.localId) {
        return signInData.localId;
      }
    }
  } catch (err) {
    console.warn(`[Auth Provision Warning] for ${p.email}:`, err.message);
  }
  return p.databaseId;
}

async function main() {
  console.log("🚀 [Code Battle] Pushing participants, rounds, questions, and competition data to RTDB...");
  console.log(`📡 Target URL: ${RTDB_URL}\n`);

  const participantsNode = {};
  const usersNode = {};
  const userRolesNode = {};
  const registrationsNode = {};
  const scoresNode = {};
  const progressNode = {};
  const qualificationNode = {
    quiz: {},
    coding: {},
    debugging: {},
    final: {},
  };
  const leaderboardEntries = [];

  for (const p of PARTICIPANTS) {
    console.log(`Processing participant: ${p.name} (${p.email})...`);
    const authUid = await ensureFirebaseAuthUser(p);
    console.log(`  ✓ Auth UID: ${authUid}`);

    const totalScore = Object.values(p.scores || {}).reduce((a, b) => a + b, 0);
    const role = p.role || "participant";

    const participantRecord = {
      id: p.databaseId,
      uid: authUid,
      databaseId: p.databaseId,
      name: p.name,
      displayName: p.name,
      email: p.email,
      username: p.username,
      institution: p.institution,
      department: p.department,
      academicYear: p.academicYear,
      role,
      accountStatus: "active",
      emailVerified: true,
      totalScore,
      scores: p.scores,
      qualification: p.qualification,
      createdAt: now,
      updatedAt: now,
    };

    const userRecord = {
      uid: authUid,
      displayName: p.name,
      email: p.email,
      username: p.username,
      institution: p.institution,
      department: p.department,
      academicYear: p.academicYear,
      role,
      accountStatus: "active",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    };

    participantsNode[p.databaseId] = participantRecord;
    if (authUid !== p.databaseId) {
      participantsNode[authUid] = participantRecord;
    }

    usersNode[p.databaseId] = userRecord;
    usersNode[authUid] = userRecord;

    userRolesNode[p.databaseId] = role;
    userRolesNode[authUid] = role;

    if (role === "participant") {
      registrationsNode[p.databaseId] = {
        participantId: p.databaseId,
        competitionId: COMPETITION_ID,
        registeredAt: now,
        status: "registered",
      };
      if (authUid !== p.databaseId) {
        registrationsNode[authUid] = {
          participantId: authUid,
          competitionId: COMPETITION_ID,
          registeredAt: now,
          status: "registered",
        };
      }

      scoresNode[p.databaseId] = {
        ...p.scores,
        totalScore,
        userName: p.name,
        userEmail: p.email,
        institution: p.institution,
        lastUpdated: now,
      };
      if (authUid !== p.databaseId) {
        scoresNode[authUid] = {
          ...p.scores,
          totalScore,
          userName: p.name,
          userEmail: p.email,
          institution: p.institution,
          lastUpdated: now,
        };
      }

      const roundsCompleted = Object.keys(p.scores).length;
      progressNode[p.databaseId] = { currentRound: roundsCompleted, updatedAt: now };
      if (authUid !== p.databaseId) {
        progressNode[authUid] = { currentRound: roundsCompleted, updatedAt: now };
      }

      for (const [rSlug, status] of Object.entries(p.qualification)) {
        const sc = p.scores[rSlug] || 0;
        qualificationNode[rSlug][p.databaseId] = { status, score: sc, updatedAt: now };
        if (authUid !== p.databaseId) {
          qualificationNode[rSlug][authUid] = { status, score: sc, updatedAt: now };
        }
      }

      leaderboardEntries.push({
        rank: 0,
        participantId: p.databaseId,
        name: p.name,
        username: p.username,
        institution: p.institution,
        avatar: "",
        score: totalScore,
        roundScores: p.scores,
        status: "active",
      });
    }
  }

  leaderboardEntries.sort((a, b) => b.score - a.score);
  leaderboardEntries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  const competitionRecord = {
    id: COMPETITION_ID,
    title: "Code Battle 2026 — Spring Grand Prix",
    description: "The premier competitive programming championship. Conquer all four competitive arenas to claim victory.",
    status: "live",
    currentRound: "Coding Battle",
    startDate: "2026-10-18T09:00:00Z",
    endDate: "2026-10-19T21:00:00Z",
    registrationDeadline: "2026-10-18T23:59:59Z",
    durationHours: 36,
    maxTeams: 1500,
    createdAt: now,
    updatedAt: now,
  };

  const payload = {
    participants: participantsNode,
    users: usersNode,
    userRoles: userRolesNode,
    competitions: {
      [COMPETITION_ID]: competitionRecord,
    },
    rounds: {
      [COMPETITION_ID]: INITIAL_ROUNDS_DATA,
    },
    questions: {
      [COMPETITION_ID]: INITIAL_QUESTIONS,
    },
    registrations: {
      [COMPETITION_ID]: registrationsNode,
    },
    scores: {
      [COMPETITION_ID]: scoresNode,
    },
    participantProgress: {
      [COMPETITION_ID]: progressNode,
    },
    qualification: {
      [COMPETITION_ID]: qualificationNode,
    },
    leaderboard: {
      [COMPETITION_ID]: leaderboardEntries,
    },
  };

  console.log("\n📦 Sending payload to Firebase Realtime Database via REST API (PUT on rounds and PATCH on root)...");
  
  // Overwrite rounds cleanly so old corrupted round-1 / round-4 keys are replaced by proper quiz, coding, debugging, final
  await fetch(`${RTDB_URL}/rounds/${COMPETITION_ID}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(INITIAL_ROUNDS_DATA),
  });

  const res = await fetch(`${RTDB_URL}/.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update Firebase Realtime Database: ${res.status} ${res.statusText}\n${errorText}`);
  }

  console.log("✅ Successfully written full dataset to Firebase Realtime Database!");
  console.log("   - Cleaned and updated /rounds for all 4 stages (quiz, coding, debugging, final)");
  console.log("   - Added standard questions under /questions/" + COMPETITION_ID);
  console.log("   - Added /competitions/" + COMPETITION_ID);
  console.log("   - Added participant references under /participants and /users");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
