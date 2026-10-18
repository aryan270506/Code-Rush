import type {
  Competition,
  Participant,
  Round,
  Question,
  Submission,
  ScoringRule,
  QualificationCriteria,
  AuditLog,
  LeaderboardEntry,
  OverviewMetrics,
  RoundName,
} from '../types/admin';

// Initial Seed Data for Code Battle Hackathon
const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: 'comp-2026-spring',
    title: 'Code Battle 2026 — Spring Grand Prix',
    description: 'Premier national hackathon featuring 4 consecutive rounds: MCQ Speedrun, Algorithmic Blitz, Bug Hunt, and System Optimization.',
    startDate: '2026-10-18T09:00:00Z',
    endDate: '2026-10-19T21:00:00Z',
    registrationDeadline: '2026-10-17T23:59:59Z',
    rules: 'No unauthorized LLMs during live coding rounds. Max 3 submissions per problem without penalty. Plagiarism checks run automatically.',
    status: 'live',
    participantsCount: 1420,
    currentRound: 'Coding Battle',
    durationHours: 36,
    maxTeams: 1500,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'comp-2026-ai-duel',
    title: 'Algorithmic Clash: AI & Systems Duel',
    description: 'Specialized backend and distributed algorithms competition with heavy concurrency and cache debugging problems.',
    startDate: '2026-11-05T14:00:00Z',
    endDate: '2026-11-06T18:00:00Z',
    registrationDeadline: '2026-11-03T23:59:59Z',
    rules: 'Languages permitted: C++, Rust, Go, Python. Strict memory constraints of 256MB.',
    status: 'scheduled',
    participantsCount: 680,
    currentRound: 'Quiz Battle',
    durationHours: 28,
    maxTeams: 800,
    createdAt: '2026-09-20T12:00:00Z',
  },
  {
    id: 'comp-2026-rookie',
    title: 'Code Battle Collegiate Rookie Invitational',
    description: 'Freshman and sophomore collegiate tournament focused on fundamental data structures, rapid debugging, and clean code.',
    startDate: '2026-11-20T10:00:00Z',
    endDate: '2026-11-21T18:00:00Z',
    registrationDeadline: '2026-11-18T23:59:59Z',
    rules: 'Individual participants only. Time penalties applied to every failed compilation.',
    status: 'draft',
    participantsCount: 0,
    currentRound: 'Quiz Battle',
    durationHours: 32,
    maxTeams: 500,
    createdAt: '2026-10-01T15:00:00Z',
  },
  {
    id: 'comp-2026-winter-cup',
    title: 'Winter Cyber Blitz 2025',
    description: 'Concluded winter showdown with 2,100 competitors across 14 university chapters.',
    startDate: '2025-12-12T09:00:00Z',
    endDate: '2025-12-14T20:00:00Z',
    registrationDeadline: '2025-12-10T23:59:59Z',
    rules: 'Standard 4-round elimination rules. Final battle evaluated by peer judges.',
    status: 'completed',
    participantsCount: 2150,
    currentRound: 'Final Battle',
    durationHours: 48,
    createdAt: '2025-11-01T10:00:00Z',
  },
];

const INITIAL_ROUNDS: Round[] = [
  {
    id: 'round-1',
    name: 'Quiz Battle',
    type: 'quiz',
    sequenceOrder: 1,
    startDate: '2026-10-18T09:00:00Z',
    endDate: '2026-10-18T10:30:00Z',
    durationMinutes: 90,
    maxMarks: 100,
    qualificationRule: 'min_score',
    qualificationThreshold: 65,
    maxQualifiers: 700,
    penaltyPerWrong: 1,
    instructions: '40 multiple-choice questions on algorithms, time complexities, memory models, and systems. +2.5 marks for correct, -1 mark for incorrect.',
    status: 'completed',
    enabled: true,
    questionsCount: 40,
  },
  {
    id: 'round-2',
    name: 'Coding Battle',
    type: 'coding',
    sequenceOrder: 2,
    startDate: '2026-10-18T11:00:00Z',
    endDate: '2026-10-18T15:00:00Z',
    durationMinutes: 240,
    maxMarks: 300,
    qualificationRule: 'top_percent',
    qualificationThreshold: 40, // Top 40%
    maxQualifiers: 250,
    penaltyPerWrong: 5,
    instructions: '3 algorithmic problems ranging from Medium to Hard. Automated evaluation against hidden unit tests and time limits.',
    status: 'in_progress',
    enabled: true,
    questionsCount: 3,
  },
  {
    id: 'round-3',
    name: 'Debugging Battle',
    type: 'debugging',
    sequenceOrder: 3,
    startDate: '2026-10-18T16:00:00Z',
    endDate: '2026-10-18T19:00:00Z',
    durationMinutes: 180,
    maxMarks: 200,
    qualificationRule: 'top_n',
    qualificationThreshold: 60, // Top 60
    maxQualifiers: 60,
    penaltyPerWrong: 10,
    instructions: 'Participants receive 4 pre-written code snippets containing subtle race conditions, off-by-one errors, and memory leaks. Identify and commit minimal surgical fixes.',
    status: 'scheduled',
    enabled: true,
    questionsCount: 4,
  },
  {
    id: 'round-4',
    name: 'Final Battle',
    type: 'final',
    sequenceOrder: 4,
    startDate: '2026-10-19T10:00:00Z',
    endDate: '2026-10-19T18:00:00Z',
    durationMinutes: 480,
    maxMarks: 400,
    qualificationRule: 'top_n',
    qualificationThreshold: 10,
    maxQualifiers: 10,
    penaltyPerWrong: 0,
    instructions: 'Grand finale championship challenge: High-throughput distributed cache protocol implementation with extreme stress testing and deterministic replay benchmarks.',
    status: 'draft',
    enabled: true,
    questionsCount: 2,
  },
];

const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'usr-101',
    name: 'Devin Vance',
    email: 'devin.vance@stanford.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    registrationDate: '2026-09-15T14:22:00Z',
    currentRound: 'Coding Battle',
    totalScore: 382,
    roundScores: { quiz: 95, coding: 287, debugging: 0, final: 0 },
    accountStatus: 'active',
    qualificationStatus: 'qualified',
    submissionsCount: 14,
    lastActive: '5 mins ago',
  },
  {
    id: 'usr-102',
    name: 'Aria Takahashi',
    email: 'aria.t@tokyo-tech.ac.jp',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    registrationDate: '2026-09-18T09:12:00Z',
    currentRound: 'Coding Battle',
    totalScore: 374,
    roundScores: { quiz: 92, coding: 282, debugging: 0, final: 0 },
    accountStatus: 'active',
    qualificationStatus: 'qualified',
    submissionsCount: 11,
    lastActive: '12 mins ago',
  },
  {
    id: 'usr-103',
    name: 'Marcus Sterling',
    email: 'm.sterling@cambridge.ac.uk',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    registrationDate: '2026-09-12T11:45:00Z',
    currentRound: 'Coding Battle',
    totalScore: 366,
    roundScores: { quiz: 88, coding: 278, debugging: 0, final: 0 },
    accountStatus: 'active',
    qualificationStatus: 'qualified',
    submissionsCount: 16,
    lastActive: '1 min ago',
  },
  {
    id: 'usr-104',
    name: 'Priya Sharma',
    email: 'priya.sharma@iitb.ac.in',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    registrationDate: '2026-09-22T16:30:00Z',
    currentRound: 'Coding Battle',
    totalScore: 358,
    roundScores: { quiz: 94, coding: 264, debugging: 0, final: 0 },
    accountStatus: 'active',
    qualificationStatus: 'qualified',
    submissionsCount: 9,
    lastActive: '18 mins ago',
  },
  {
    id: 'usr-105',
    name: 'Liam Chen',
    email: 'liam.chen@berkeley.edu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    registrationDate: '2026-09-25T08:15:00Z',
    currentRound: 'Coding Battle',
    totalScore: 345,
    roundScores: { quiz: 85, coding: 260, debugging: 0, final: 0 },
    accountStatus: 'active',
    qualificationStatus: 'qualified',
    submissionsCount: 12,
    lastActive: '32 mins ago',
  },
  {
    id: 'usr-106',
    name: 'Elena Rostova',
    email: 'elena.rostova@ethz.ch',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    registrationDate: '2026-09-28T19:04:00Z',
    currentRound: 'Coding Battle',
    totalScore: 328,
    roundScores: { quiz: 86, coding: 242, debugging: 0, final: 0 },
    accountStatus: 'active',
    qualificationStatus: 'in_review',
    submissionsCount: 15,
    lastActive: '45 mins ago',
  },
  {
    id: 'usr-107',
    name: 'Kofi Mensah',
    email: 'k.mensah@knust.edu.gh',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    registrationDate: '2026-10-02T13:20:00Z',
    currentRound: 'Quiz Battle',
    totalScore: 62,
    roundScores: { quiz: 62, coding: 0, debugging: 0, final: 0 },
    accountStatus: 'active',
    qualificationStatus: 'knocked_out',
    submissionsCount: 4,
    lastActive: '2 hours ago',
  },
  {
    id: 'usr-108',
    name: 'Zane Gallagher',
    email: 'zane.g@toronto.edu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    registrationDate: '2026-10-04T10:11:00Z',
    currentRound: 'Quiz Battle',
    totalScore: 48,
    roundScores: { quiz: 48, coding: 0, debugging: 0, final: 0 },
    accountStatus: 'suspended',
    qualificationStatus: 'disqualified',
    submissionsCount: 3,
    lastActive: '3 hours ago',
  },
];

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-quiz-01',
    title: 'Amortized Time Complexity of Dynamic Array Doubling',
    round: 'Quiz Battle',
    type: 'quiz',
    difficulty: 'easy',
    marks: 2.5,
    description: 'When appending N items to a dynamic array that doubles its capacity whenever it is full, what is the amortized cost per single append operation?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctAnswer: 'O(1)',
    explanation: 'Although individual resizing operations cost O(N), they happen infrequently enough (at powers of 2) that the total work for N insertions is bounded by 2N + N = 3N, making the amortized cost O(1).',
    createdAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'q-code-01',
    title: 'Hyperlane Routing: Minimum Latency Path with Dynamic Obstacles',
    round: 'Coding Battle',
    type: 'coding',
    difficulty: 'hard',
    marks: 100,
    description: 'Given an undirected weighted graph representing hyperlane relays between planetary sectors, find the shortest path from Source to Destination when relay nodes experience periodic interference pulses.',
    inputDescription: 'First line contains N nodes and M edges. Following M lines contain u, v, weight, and pulse_interval.',
    outputDescription: 'Single integer representing the minimum arrival time, or -1 if unreachable within max timestamp.',
    constraints: '1 <= N <= 10^5, 1 <= M <= 3 * 10^5, Weights in [1, 10^6]. Time limit: 2000ms. Memory limit: 512MB.',
    sampleTestCases: [
      { id: 'tc-01', input: '4 4\n1 2 5 3\n2 3 4 5\n1 3 12 2\n3 4 2 1\n1 4', expectedOutput: '11', isHidden: false, weight: 20 },
      { id: 'tc-02', input: '3 2\n1 2 10 2\n2 3 10 2\n1 3', expectedOutput: '22', isHidden: false, weight: 20 },
    ],
    hiddenTestCases: [
      { id: 'tc-03', input: '1000 5000\n[Large dense topology with cyclical resonance]', expectedOutput: '48291', isHidden: true, weight: 30 },
      { id: 'tc-04', input: '50000 120000\n[Extreme stress graph with disconnected components]', expectedOutput: '-1', isHidden: true, weight: 30 },
    ],
    supportedLanguages: ['C++', 'Python', 'Go', 'Rust', 'Java'],
    executionTimeLimitMs: 2000,
    memoryLimitMb: 512,
    partialScoring: true,
    solutionCode: `// Authoritative Solution in C++20 using Modified Dijkstra with Periodic Modulo Hold
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

struct Edge { int to; long long w, pulse; };
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Algorithm details protected for admin view
    return 0;
}`,
    createdAt: '2026-09-12T14:30:00Z',
  },
  {
    id: 'q-debug-01',
    title: 'Fix Race Condition in Lock-Free Concurrent Ring Buffer',
    round: 'Debugging Battle',
    type: 'debugging',
    difficulty: 'medium',
    marks: 50,
    description: 'The provided C++ implementation of a single-producer single-consumer lock-free circular queue drops packets under high frequency enqueue/dequeue operations due to improper memory order semantics on atomic tail pointer.',
    buggyCode: `// Buggy RingBuffer snippet
template <typename T, size_t Cap>
class RingBuffer {
    std::atomic<size_t> head{0};
    std::atomic<size_t> tail{0};
    T buffer[Cap];
public:
    bool push(const T& item) {
        size_t currentTail = tail.load(std::memory_order_relaxed);
        size_t nextTail = (currentTail + 1) % Cap;
        if (nextTail == head.load(std::memory_order_relaxed)) return false; // BUG: Race condition
        buffer[currentTail] = item;
        tail.store(nextTail, std::memory_order_relaxed); // BUG: Weak memory order
        return true;
    }
};`,
    solutionCode: `// Fix: Change tail.store to memory_order_release and head.load to memory_order_acquire
tail.store(nextTail, std::memory_order_release);
size_t currentHead = head.load(std::memory_order_acquire);`,
    supportedLanguages: ['C++', 'Rust'],
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'q-final-01',
    title: 'Consensus Quorum Protocol with Byzantine Node Detection',
    round: 'Final Battle',
    type: 'final',
    difficulty: 'expert',
    marks: 200,
    description: 'Implement a zero-loss deterministic transaction validator handling up to 33% faulty or malicious validator peers under variable network partitions.',
    constraints: 'Max latency 50ms per round. Zero false consensus rounds allowed. Peak TPS >= 8000.',
    supportedLanguages: ['Go', 'Rust', 'C++'],
    createdAt: '2026-10-01T11:00:00Z',
  },
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-8001',
    participantId: 'usr-101',
    participantName: 'Devin Vance',
    participantEmail: 'devin.vance@stanford.edu',
    questionId: 'q-code-01',
    questionTitle: 'Hyperlane Routing: Minimum Latency Path',
    round: 'Coding Battle',
    language: 'C++',
    submittedAt: '2026-10-18T11:42:10Z',
    status: 'accepted',
    score: 100,
    maxScore: 100,
    executionTimeMs: 142,
    memoryMb: 34.2,
    code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<tuple<int, long long, long long>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v; long long w, p;
        cin >> u >> v >> w >> p;
        adj[u].emplace_back(v, w, p);
        adj[v].emplace_back(u, w, p);
    }
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    vector<long long> dist(n + 1, 1e18);
    dist[1] = 0;
    pq.emplace(0, 1);
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w, p] : adj[u]) {
            long long wait = (p > 0) ? (p - (d % p)) % p : 0;
            if (d + wait + w < dist[v]) {
                dist[v] = d + wait + w;
                pq.emplace(dist[v], v);
            }
        }
    }
    cout << (dist[n] >= 1e18 ? -1 : dist[n]) << "\\n";
    return 0;
}`,
    testCaseResults: [
      { testCaseId: 'tc-01', name: 'Sample Case #1', passed: true, isHidden: false, executionTimeMs: 12, memoryMb: 8.4 },
      { testCaseId: 'tc-02', name: 'Sample Case #2', passed: true, isHidden: false, executionTimeMs: 14, memoryMb: 8.5 },
      { testCaseId: 'tc-03', name: 'Hidden Test #1 (Dense Graph)', passed: true, isHidden: true, executionTimeMs: 65, memoryMb: 24.1 },
      { testCaseId: 'tc-04', name: 'Hidden Test #2 (Partition Stress)', passed: true, isHidden: true, executionTimeMs: 142, memoryMb: 34.2 },
    ],
    compilerOutput: 'Gnu C++20 (GCC 13.2.0): Compilation succeeded with 0 warnings.',
  },
  {
    id: 'sub-8002',
    participantId: 'usr-102',
    participantName: 'Aria Takahashi',
    participantEmail: 'aria.t@tokyo-tech.ac.jp',
    questionId: 'q-code-01',
    questionTitle: 'Hyperlane Routing: Minimum Latency Path',
    round: 'Coding Battle',
    language: 'Rust',
    submittedAt: '2026-10-18T11:48:50Z',
    status: 'accepted',
    score: 100,
    maxScore: 100,
    executionTimeMs: 98,
    memoryMb: 21.6,
    code: `use std::cmp::Reverse;
use std::collections::BinaryHeap;
use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    // High performance Rust zero-alloc graph traversal
}`,
    testCaseResults: [
      { testCaseId: 'tc-01', name: 'Sample Case #1', passed: true, isHidden: false, executionTimeMs: 8, memoryMb: 6.2 },
      { testCaseId: 'tc-02', name: 'Sample Case #2', passed: true, isHidden: false, executionTimeMs: 10, memoryMb: 6.3 },
      { testCaseId: 'tc-03', name: 'Hidden Test #1 (Dense Graph)', passed: true, isHidden: true, executionTimeMs: 44, memoryMb: 18.0 },
      { testCaseId: 'tc-04', name: 'Hidden Test #2 (Partition Stress)', passed: true, isHidden: true, executionTimeMs: 98, memoryMb: 21.6 },
    ],
    compilerOutput: 'rustc 1.77.0: Zero warnings, opt-level=3.',
  },
  {
    id: 'sub-8003',
    participantId: 'usr-106',
    participantName: 'Elena Rostova',
    participantEmail: 'elena.rostova@ethz.ch',
    questionId: 'q-code-01',
    questionTitle: 'Hyperlane Routing: Minimum Latency Path',
    round: 'Coding Battle',
    language: 'Python',
    submittedAt: '2026-10-18T12:02:15Z',
    status: 'time_limit_exceeded',
    score: 40,
    maxScore: 100,
    executionTimeMs: 2012,
    memoryMb: 88.4,
    code: `import heapq
import sys

def solve():
    input = sys.stdin.read
    # Naive Dijkstra implementation without sys.setrecursionlimit
`,
    testCaseResults: [
      { testCaseId: 'tc-01', name: 'Sample Case #1', passed: true, isHidden: false, executionTimeMs: 180, memoryMb: 28.1 },
      { testCaseId: 'tc-02', name: 'Sample Case #2', passed: true, isHidden: false, executionTimeMs: 210, memoryMb: 29.0 },
      { testCaseId: 'tc-03', name: 'Hidden Test #1 (Dense Graph)', passed: false, isHidden: true, executionTimeMs: 2012, memoryMb: 88.4, error: 'Time Limit Exceeded (> 2000ms)' },
      { testCaseId: 'tc-04', name: 'Hidden Test #2 (Partition Stress)', passed: false, isHidden: true, executionTimeMs: 0, memoryMb: 0, error: 'Skipped due to prior timeout' },
    ],
    compilerOutput: 'Python 3.12: Process terminated by watchdog timer after 2012ms.',
  },
  {
    id: 'sub-8004',
    participantId: 'usr-104',
    participantName: 'Priya Sharma',
    participantEmail: 'priya.sharma@iitb.ac.in',
    questionId: 'q-debug-01',
    questionTitle: 'Fix Race Condition in Lock-Free Concurrent Ring Buffer',
    round: 'Debugging Battle',
    language: 'C++',
    submittedAt: '2026-10-18T12:15:33Z',
    status: 'evaluating',
    score: 0,
    maxScore: 50,
    executionTimeMs: 0,
    memoryMb: 0,
    code: `// Patch committed by Priya Sharma
#include <atomic>
// Applying memory barriers...`,
    testCaseResults: [],
    compilerOutput: 'Evaluation queued in Sandbox Worker #4...',
  },
];

const INITIAL_SCORING_RULES: Record<RoundName, ScoringRule> = {
  'Quiz Battle': {
    roundName: 'Quiz Battle',
    marksPerQuestion: 2.5,
    partialScoring: false,
    incorrectPenalty: 1.0,
    submissionAttemptPenalty: 0,
    maxMarks: 100,
  },
  'Coding Battle': {
    roundName: 'Coding Battle',
    marksPerQuestion: 100,
    partialScoring: true,
    incorrectPenalty: 5,
    submissionAttemptPenalty: 2,
    maxMarks: 300,
  },
  'Debugging Battle': {
    roundName: 'Debugging Battle',
    marksPerQuestion: 50,
    partialScoring: true,
    incorrectPenalty: 10,
    submissionAttemptPenalty: 5,
    maxMarks: 200,
  },
  'Final Battle': {
    roundName: 'Final Battle',
    marksPerQuestion: 200,
    partialScoring: true,
    incorrectPenalty: 0,
    submissionAttemptPenalty: 0,
    maxMarks: 400,
  },
};

const INITIAL_QUAL_RULES: Record<RoundName, QualificationCriteria> = {
  'Quiz Battle': {
    roundName: 'Quiz Battle',
    type: 'min_score',
    threshold: 65,
    maxQualifiers: 700,
    tieBreakers: ['Quiz Completion Speed', 'Lowest Incorrect Count', 'Registration Order'],
  },
  'Coding Battle': {
    roundName: 'Coding Battle',
    type: 'top_percent',
    threshold: 40,
    maxQualifiers: 250,
    tieBreakers: ['Fastest Correct Submission', 'Fewest Submissions', 'Quiz Battle Score'],
  },
  'Debugging Battle': {
    roundName: 'Debugging Battle',
    type: 'top_n',
    threshold: 60,
    maxQualifiers: 60,
    tieBreakers: ['Execution Efficiency', 'Minimal AST Diff', 'Cumulative Score'],
  },
  'Final Battle': {
    roundName: 'Final Battle',
    type: 'top_n',
    threshold: 10,
    maxQualifiers: 10,
    tieBreakers: ['Benchmark TPS Performance', 'Peer Review Audit Score', 'Zero Memory Leaks'],
  },
};

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-10-18T11:45:00Z',
    adminName: 'Alex Chen (Admin)',
    adminEmail: 'alex.chen@codebattle.dev',
    category: 'competition',
    action: 'Live Round Shift',
    details: 'Initiated Round 2 (Coding Battle) execution environment across all worker clusters.',
  },
  {
    id: 'log-02',
    timestamp: '2026-10-18T10:35:12Z',
    adminName: 'Sarah Jenkins (Judge)',
    adminEmail: 'sarah.j@codebattle.dev',
    category: 'scoring',
    action: 'Scoring Recalculation',
    details: 'Validated automated evaluation results for Quiz Battle. 700 competitors qualified.',
  },
  {
    id: 'log-03',
    timestamp: '2026-10-18T09:15:30Z',
    adminName: 'Alex Chen (Admin)',
    adminEmail: 'alex.chen@codebattle.dev',
    category: 'security',
    action: 'Participant Account Suspended',
    details: 'Suspended user usr-108 (Zane Gallagher) due to multi-IP collision during Quiz Battle.',
  },
  {
    id: 'log-04',
    timestamp: '2026-10-17T23:59:59Z',
    adminName: 'System Automation',
    adminEmail: 'daemon@codebattle.dev',
    category: 'competition',
    action: 'Registration Closed',
    details: 'Locked registrations for Code Battle 2026 with 1,420 confirmed competitors.',
  },
];

class AdminDataService {
  private getStorage<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(`cb_admin_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`cb_admin_${key}`, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  // --- Overview & Metrics ---
  getOverviewMetrics(): OverviewMetrics {
    const participants = this.getParticipants();
    const competitions = this.getCompetitions();
    const submissions = this.getSubmissions();
    const qualified = participants.filter((p) => p.qualificationStatus === 'qualified').length;

    return {
      totalParticipants: participants.length * 175 + 20, // Scaled for hackathon realism
      participantsTrend: '+18.4% vs last event',
      activeCompetitions: competitions.filter((c) => c.status === 'live').length || 1,
      competitionsTrend: '3 total scheduled',
      totalSubmissions: 8945 + submissions.length,
      submissionsTrend: '+24% peak load',
      qualifiedParticipants: qualified * 40,
      qualifiedRate: `${((qualified / participants.length) * 100).toFixed(1)}% qualification rate`,
    };
  }

  getRegistrationTrends() {
    return [
      { date: 'Oct 01', registrations: 120, submissions: 0 },
      { date: 'Oct 05', registrations: 290, submissions: 15 },
      { date: 'Oct 09', registrations: 540, submissions: 80 },
      { date: 'Oct 12', registrations: 890, submissions: 420 },
      { date: 'Oct 15', registrations: 1180, submissions: 1850 },
      { date: 'Oct 17', registrations: 1390, submissions: 4200 },
      { date: 'Oct 18', registrations: 1420, submissions: 8945 },
    ];
  }

  getRoundParticipation() {
    return [
      { name: 'Quiz Battle', value: 1420, color: '#7C3AED' },
      { name: 'Coding Battle', value: 700, color: '#6D28D9' },
      { name: 'Debugging Battle', value: 250, color: '#4F20D8' },
      { name: 'Final Battle', value: 60, color: '#8B5CF6' },
    ];
  }

  // --- Competitions ---
  getCompetitions(): Competition[] {
    return this.getStorage<Competition[]>('competitions', INITIAL_COMPETITIONS);
  }

  createCompetition(comp: Omit<Competition, 'id' | 'createdAt'>): Competition {
    const list = this.getCompetitions();
    const newComp: Competition = {
      ...comp,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newComp);
    this.setStorage('competitions', list);
    this.addAuditLog('Created Competition', 'competition', `Created '${newComp.title}'`);
    return newComp;
  }

  updateCompetition(id: string, updates: Partial<Competition>): Competition | null {
    const list = this.getCompetitions();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.setStorage('competitions', list);
    this.addAuditLog('Updated Competition', 'competition', `Updated details for ${list[idx].title}`);
    return list[idx];
  }

  deleteCompetition(id: string): boolean {
    let list = this.getCompetitions();
    const target = list.find((c) => c.id === id);
    list = list.filter((c) => c.id !== id);
    this.setStorage('competitions', list);
    if (target) {
      this.addAuditLog('Deleted Competition', 'competition', `Deleted ${target.title}`);
    }
    return true;
  }

  // --- Participants ---
  getParticipants(): Participant[] {
    return this.getStorage<Participant[]>('participants', INITIAL_PARTICIPANTS);
  }

  updateParticipantStatus(id: string, accountStatus: 'active' | 'inactive' | 'suspended'): void {
    const list = this.getParticipants();
    const p = list.find((item) => item.id === id);
    if (p) {
      p.accountStatus = accountStatus;
      this.setStorage('participants', list);
      this.addAuditLog('Updated Account Status', 'participant', `Set status of ${p.name} (${p.email}) to ${accountStatus}`);
    }
  }

  bulkUpdateParticipants(ids: string[], accountStatus: 'active' | 'inactive' | 'suspended'): void {
    const list = this.getParticipants();
    list.forEach((p) => {
      if (ids.includes(p.id)) {
        p.accountStatus = accountStatus;
      }
    });
    this.setStorage('participants', list);
    this.addAuditLog('Bulk Participant Update', 'participant', `Updated ${ids.length} participants to status: ${accountStatus}`);
  }

  // --- Rounds ---
  getRounds(): Round[] {
    return this.getStorage<Round[]>('rounds', INITIAL_ROUNDS);
  }

  updateRound(id: string, updates: Partial<Round>): Round | null {
    const list = this.getRounds();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.setStorage('rounds', list);
    this.addAuditLog('Updated Round', 'round', `Updated parameters for ${list[idx].name}`);
    return list[idx];
  }

  // --- Questions ---
  getQuestions(): Question[] {
    return this.getStorage<Question[]>('questions', INITIAL_QUESTIONS);
  }

  addQuestion(q: Omit<Question, 'id' | 'createdAt'>): Question {
    const list = this.getQuestions();
    const newQ: Question = {
      ...q,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newQ);
    this.setStorage('questions', list);
    this.addAuditLog('Created Question', 'question', `Added question '${newQ.title}' to ${newQ.round}`);
    return newQ;
  }

  updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const list = this.getQuestions();
    const idx = list.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.setStorage('questions', list);
    this.addAuditLog('Updated Question', 'question', `Updated question '${list[idx].title}'`);
    return list[idx];
  }

  deleteQuestion(id: string): boolean {
    let list = this.getQuestions();
    const target = list.find((q) => q.id === id);
    list = list.filter((q) => q.id !== id);
    this.setStorage('questions', list);
    if (target) {
      this.addAuditLog('Deleted Question', 'question', `Removed question '${target.title}'`);
    }
    return true;
  }

  // --- Submissions ---
  getSubmissions(): Submission[] {
    return this.getStorage<Submission[]>('submissions', INITIAL_SUBMISSIONS);
  }

  // --- Scoring & Qualification Rules ---
  getScoringRules(): Record<RoundName, ScoringRule> {
    return this.getStorage<Record<RoundName, ScoringRule>>('scoring_rules', INITIAL_SCORING_RULES);
  }

  updateScoringRule(round: RoundName, rule: ScoringRule): void {
    const rules = this.getScoringRules();
    rules[round] = rule;
    this.setStorage('scoring_rules', rules);
    this.addAuditLog('Updated Scoring Rules', 'scoring', `Updated scoring policy for ${round}`);
  }

  getQualificationRules(): Record<RoundName, QualificationCriteria> {
    return this.getStorage<Record<RoundName, QualificationCriteria>>('qual_rules', INITIAL_QUAL_RULES);
  }

  updateQualificationRule(round: RoundName, criteria: QualificationCriteria): void {
    const rules = this.getQualificationRules();
    rules[round] = criteria;
    this.setStorage('qual_rules', rules);
    this.addAuditLog('Updated Qualification Rule', 'scoring', `Updated qualification criteria for ${round}`);
  }

  // --- Leaderboard & Publication ---
  getLeaderboard(): LeaderboardEntry[] {
    const participants = this.getParticipants();
    const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);

    return sorted.map((p, index) => ({
      rank: index + 1,
      participantId: p.id,
      name: p.name,
      email: p.email,
      avatar: p.avatar || '',
      totalScore: p.totalScore,
      quizScore: p.roundScores.quiz,
      codingScore: p.roundScores.coding,
      debuggingScore: p.roundScores.debugging,
      finalScore: p.roundScores.final,
      qualificationStatus: p.qualificationStatus,
      submissionTime: '11:42:10Z',
      tieBreakerNote: index === 0 ? 'Fastest solve on Round 2 #1' : index === 1 ? 'Zero compiler errors' : undefined,
    }));
  }

  getPublicationStatus(): { published: boolean; publishedAt?: string; publisher?: string } {
    return this.getStorage('publication_status', {
      published: false,
      publishedAt: undefined,
      publisher: undefined,
    });
  }

  publishResults(): { published: boolean; publishedAt: string; publisher: string } {
    const status = {
      published: true,
      publishedAt: new Date().toISOString(),
      publisher: 'Alex Chen (Super Admin)',
    };
    this.setStorage('publication_status', status);
    this.addAuditLog('Published Final Results', 'results', 'Published authoritative final leaderboard to all participants.');
    return status;
  }

  unpublishResults(): void {
    this.setStorage('publication_status', { published: false });
    this.addAuditLog('Unpublished Results', 'results', 'Withdrew published leaderboard back to draft state.');
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.getStorage<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }

  addAuditLog(action: string, category: AuditLog['category'], details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: 'Alex Chen (Chief Admin)',
      adminEmail: 'alex.chen@codebattle.dev',
      category,
      action,
      details,
    };
    logs.unshift(newLog);
    this.setStorage('audit_logs', logs.slice(0, 50));
  }

  // --- CSV Export Helper ---
  generateCSV(type: 'participants' | 'competitions' | 'leaderboard' | 'submissions'): string {
    if (type === 'participants') {
      const p = this.getParticipants();
      const headers = 'ID,Name,Email,Current Round,Total Score,Quiz,Coding,Debugging,Final,Status,Qualification\n';
      const rows = p
        .map(
          (u) =>
            `"${u.id}","${u.name}","${u.email}","${u.currentRound}",${u.totalScore},${u.roundScores.quiz},${u.roundScores.coding},${u.roundScores.debugging},${u.roundScores.final},"${u.accountStatus}","${u.qualificationStatus}"`
        )
        .join('\n');
      return headers + rows;
    }

    if (type === 'leaderboard') {
      const lb = this.getLeaderboard();
      const headers = 'Rank,Name,Email,Total Score,Quiz,Coding,Debugging,Final,Status\n';
      const rows = lb
        .map(
          (u) =>
            `${u.rank},"${u.name}","${u.email}",${u.totalScore},${u.quizScore},${u.codingScore},${u.debuggingScore},${u.finalScore},"${u.qualificationStatus}"`
        )
        .join('\n');
      return headers + rows;
    }

    if (type === 'competitions') {
      const c = this.getCompetitions();
      const headers = 'ID,Title,Status,Start Date,End Date,Participants\n';
      const rows = c.map((item) => `"${item.id}","${item.title}","${item.status}","${item.startDate}","${item.endDate}",${item.participantsCount}`).join('\n');
      return headers + rows;
    }

    const s = this.getSubmissions();
    const headers = 'ID,Participant,Question,Round,Language,Status,Score,Execution Time(ms)\n';
    const rows = s.map((item) => `"${item.id}","${item.participantName}","${item.questionTitle}","${item.round}","${item.language}","${item.status}",${item.score},${item.executionTimeMs}`).join('\n');
    return headers + rows;
  }
}

export const adminDataService = new AdminDataService();
