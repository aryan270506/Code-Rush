export type RoundName = 'Quiz Battle' | 'Coding Battle' | 'Debugging Battle' | 'Final Battle';

export type RoundType = 'quiz' | 'coding' | 'debugging' | 'final';

export type CompetitionStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  rules: string;
  status: CompetitionStatus;
  participantsCount: number;
  currentRound: RoundName;
  durationHours: number;
  maxTeams?: number;
  createdAt: string;
}

export type AccountStatus = 'active' | 'inactive' | 'suspended';
export type QualificationStatus = 'qualified' | 'in_review' | 'disqualified' | 'knocked_out';

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  registrationDate: string;
  currentRound: RoundName;
  totalScore: number;
  roundScores: {
    quiz: number;
    coding: number;
    debugging: number;
    final: number;
  };
  accountStatus: AccountStatus;
  qualificationStatus: QualificationStatus;
  submissionsCount: number;
  lastActive: string;
}

export type QualificationRuleType = 'min_score' | 'top_percent' | 'top_n';

export interface Round {
  id: string;
  name: RoundName;
  type: RoundType;
  sequenceOrder: number;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  maxMarks: number;
  qualificationRule: QualificationRuleType;
  qualificationThreshold: number;
  maxQualifiers: number;
  penaltyPerWrong: number;
  instructions: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed';
  enabled: boolean;
  questionsCount: number;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;
  explanation?: string;
}

export interface Question {
  id: string;
  title: string;
  round: RoundName;
  type: RoundType;
  difficulty: QuestionDifficulty;
  marks: number;
  description: string;
  options?: string[]; // For Quiz Battle
  correctAnswer?: string | number; // For Quiz Battle (hidden from participants)
  explanation?: string;
  inputDescription?: string;
  outputDescription?: string;
  constraints?: string;
  sampleTestCases?: TestCase[];
  hiddenTestCases?: TestCase[]; // Admin only
  buggyCode?: string; // For Debugging Battle
  solutionCode?: string; // Admin Only official solution
  supportedLanguages?: string[];
  executionTimeLimitMs?: number;
  memoryLimitMb?: number;
  partialScoring?: boolean;
  createdAt: string;
}

export type SubmissionStatus =
  | 'pending'
  | 'evaluating'
  | 'accepted'
  | 'partial'
  | 'wrong_answer'
  | 'compilation_error'
  | 'runtime_error'
  | 'time_limit_exceeded';

export interface TestCaseOutcome {
  testCaseId: string;
  name: string;
  passed: boolean;
  isHidden: boolean;
  executionTimeMs: number;
  memoryMb: number;
  error?: string;
}

export interface Submission {
  id: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  questionId: string;
  questionTitle: string;
  round: RoundName;
  language: string;
  submittedAt: string;
  status: SubmissionStatus;
  score: number;
  maxScore: number;
  executionTimeMs: number;
  memoryMb: number;
  code: string;
  testCaseResults: TestCaseOutcome[];
  compilerOutput?: string;
}

export interface ScoringRule {
  roundName: RoundName;
  marksPerQuestion: number;
  partialScoring: boolean;
  incorrectPenalty: number;
  submissionAttemptPenalty: number;
  maxMarks: number;
}

export interface QualificationCriteria {
  roundName: RoundName;
  type: QualificationRuleType;
  threshold: number; // e.g. min 75 points or top 30% or top 50 participants
  maxQualifiers: number;
  tieBreakers: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  action: string;
  category: 'competition' | 'participant' | 'round' | 'question' | 'scoring' | 'results' | 'security';
  details: string;
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  name: string;
  email: string;
  avatar: string;
  totalScore: number;
  quizScore: number;
  codingScore: number;
  debuggingScore: number;
  finalScore: number;
  qualificationStatus: QualificationStatus;
  submissionTime: string;
  tieBreakerNote?: string;
}

export interface OverviewMetrics {
  totalParticipants: number;
  participantsTrend: string;
  activeCompetitions: number;
  competitionsTrend: string;
  totalSubmissions: number;
  submissionsTrend: string;
  qualifiedParticipants: number;
  qualifiedRate: string;
}
