export type RoundStatus =
  | "upcoming"
  | "locked"
  | "available"
  | "in_progress"
  | "submitted"
  | "under_evaluation"
  | "awaiting_evaluation"
  | "qualified"
  | "not_qualified"
  | "completed"
  | "expired";

export interface CompetitionRoundConfig {
  id: number;
  slug: "quiz" | "coding" | "debugging" | "final";
  name: string;
  shortDescription: string;
  description: string;
  status: RoundStatus;
  maxScore: number;
  currentScore?: number;
  durationMinutes: number;
  questionCount: number;
  qualificationCutoff: number;
  requiresQualificationToAdvance: boolean;
  unlockConditionText: string;
  startTime?: string;
  endTime?: string;
  rules: string[];
  iconName: string;
  color: "violet" | "cyan" | "amber" | "purple";
  isQualified?: boolean;
}

export type CompetitionRound = CompetitionRoundConfig;

export interface CompetitionPipelineInfo {
  id: string;
  name: string;
  status: "upcoming" | "active" | "under_evaluation" | "completed";
  startTime: string;
  endTime: string;
  currentRoundNumber: number;
  overallProgressPercentage: number;
  totalScore: number;
  maxScore: number;
  roundsCompleted: number;
  totalRounds: number;
  nextAction: {
    label: string;
    roundSlug: string;
    description: string;
    isAvailable: boolean;
  };
  rounds: CompetitionRoundConfig[];
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  statement: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
  }[];
  points: number;
  negativePoints: number;
  // correctOptionId and explanation are kept server-side or revealed only post-evaluation
  correctOptionId?: string;
  explanation?: string;
}

export interface QuizSubmission {
  roundId: number;
  answers: Record<string, string>; // questionId -> optionId
  markedForReview: string[];
  startedAt: string;
  submittedAt?: string;
  score?: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount?: number;
  incorrectCount?: number;
  accuracy?: number;
  status: "in_progress" | "submitted" | "evaluated";
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Championship";
  points: number;
  timeLimitSeconds: number;
  memoryLimitMB: number;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  sampleTestCases: TestCase[];
  starterCode: Record<string, string>; // language -> code
  buggyCode?: Record<string, string>; // for debugging round
  bugExplanation?: string;
}

export type SubmissionStatus =
  | "Pending"
  | "Running"
  | "Accepted"
  | "Wrong Answer"
  | "Compilation Error"
  | "Runtime Error"
  | "Time Limit Exceeded"
  | "Failed";

export interface CodeSubmission {
  id: string;
  participantId: string;
  participantName: string;
  roundId: number;
  roundName: string;
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  score: number;
  maxScore: number;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  memoryUsedMB: number;
  submittedAt: string;
  compilerOutput?: string;
  testCaseResults?: {
    id: string;
    passed: boolean;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
    timeMs?: number;
    error?: string;
    isHidden?: boolean;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  institution?: string;
  roundScores: {
    round1: number; // Quiz
    round2: number; // Coding
    round3: number; // Debugging
    round4: number; // Final
  };
  totalScore: number;
  status: "Qualified" | "In Competition" | "Pending" | "Finalist";
  isCurrentParticipant?: boolean;
  lastActive: string;
}

export interface ParticipantStats {
  totalScore: number;
  currentRank: number | null;
  totalParticipants: number;
  roundsCompleted: number;
  totalRounds: number;
  qualificationStatus: "Qualified" | "In Progress" | "Pending Review" | "Not Qualified";
  accuracy: number;
  codePassRate: number;
  quizScore: number;
  codingScore: number;
  debuggingScore: number;
  finalScore: number;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  priority: "high" | "normal" | "urgent";
  publishedAt: string;
  category: "competition" | "round_schedule" | "maintenance" | "general";
  isPinned?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "round" | "submission" | "announcement" | "alert";
  link?: string;
}

export interface ParticipantProfileData {
  displayName: string;
  email: string;
  uid: string;
  institution: string;
  avatarUrl?: string;
  bio?: string;
  github?: string;
  createdAt: string;
  emailVerified: boolean;
  role: string;
  contestStatus: "active" | "disqualified" | "completed";
}
