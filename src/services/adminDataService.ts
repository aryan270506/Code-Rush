import {
  type Competition,
  type Participant,
  type Round,
  type Question,
  type Submission,
  type ScoringRule,
  type QualificationCriteria,
  type AuditLog,
  type LeaderboardEntry,
  type OverviewMetrics,
  type RoundName,
  type RoundType,
  type SubmissionStatus,
} from '../types/admin';
import { realtimeDbService, DEFAULT_COMPETITION_ID } from './realtimeDbService';

class AdminDataService {
  private competitionsCache: Competition[] = [];
  private questionsCache: Question[] = [];
  private submissionsCache: Submission[] = [];
  private participantsCache: Participant[] = [];
  private auditLogsCache: AuditLog[] = [];
  private initialized: boolean = false;

  constructor() {
    this.initRealtimeSubscriptions();
  }

  private initRealtimeSubscriptions(): void {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Subscribe to Competitions
    realtimeDbService.subscribeCompetitions((comps) => {
      if (comps && comps.length > 0) {
        this.competitionsCache = comps.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          startDate: c.startDate,
          endDate: c.endDate,
          registrationDeadline: c.registrationDeadline,
          rules: (c as any).rules || '',
          status: (c.status as any) || "live",
          currentRound: (c.currentRound as any) || "Coding Battle",
          durationHours: c.durationHours || 36,
          maxTeams: c.maxTeams || 1500,
          createdAt: c.createdAt || new Date().toISOString(),
          participantsCount: c.participantsCount || 0,
        }));
      }
    });

    // 2. Subscribe to Questions
    realtimeDbService.subscribeQuestions(DEFAULT_COMPETITION_ID, (qs) => {
      if (qs && qs.length > 0) {
        this.questionsCache = qs.map((q) => ({
          id: q.id,
          title: q.title,
          round: (q.roundName as any) || "Coding Battle",
          difficulty: q.difficulty || "medium",
          type: (q.type === 'mcq' ? 'quiz' : q.type === 'sql' ? 'coding' : q.type) as RoundType,
          marks: q.points || 100,
          description: q.statement || "",
          points: q.points || 100,
          timeLimitSeconds: 120,
          status: q.status || "published",
          createdAt: new Date().toISOString(),
          submissionsCount: 0,
          accuracyRate: "65%",
          tags: q.tags || ["algorithms"],
          problemStatement: q.statement || "",
          starterCode: q.starterCode || {},
          sampleCases: (q.sampleCases || []).map((sc, i) => ({
            id: `sc-${i}`,
            input: sc.input,
            output: sc.output,
            explanation: sc.explanation,
          })),
          testCases: [],
        }));
      }
    });

    // 3. Load initial participants & submissions
    this.syncDatabaseRecords();
  }

  public async syncDatabaseRecords(): Promise<void> {
    try {
      const parts = await realtimeDbService.getParticipants();
      if (parts && parts.length > 0) {
        this.participantsCache = parts.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          currentRound: "Coding Battle",
          totalScore: p.score || 0,
          roundScores: { quiz: 0, coding: 0, debugging: 0, final: 0 },
          accountStatus: p.status || "active",
          qualificationStatus: "qualified",
          registrationDate: p.registrationDate || new Date().toISOString(),
          submissionsCount: 0,
          lastActive: new Date().toISOString(),
        }));
      }

      const subs = await realtimeDbService.getAllSubmissions(DEFAULT_COMPETITION_ID);
      if (subs && subs.length > 0) {
        this.submissionsCache = subs.map((s) => ({
          id: s.id,
          participantId: s.userId,
          participantName: s.userName || "Competitor",
          participantEmail: "",
          questionId: s.problemId || "",
          questionTitle: s.problemTitle || "Algorithmic Challenge",
          round: s.roundSlug === "quiz" ? "Quiz Battle" : s.roundSlug === "debugging" ? "Debugging Battle" : s.roundSlug === "final" ? "Final Battle" : "Coding Battle",
          language: s.language || "python",
          status: (s.status === "accepted" ? "accepted" : s.status === "wrong_answer" ? "wrong_answer" : s.status === "time_limit_exceeded" ? "time_limit_exceeded" : "compilation_error") as SubmissionStatus,
          score: s.score || 0,
          maxScore: 100,
          executionTimeMs: s.executionTimeMs || 45,
          memoryKB: 24000,
          memoryMb: 24,
          submittedAt: s.submittedAt || new Date().toISOString(),
          code: "",
          codeSnippet: "// Evaluated in sandbox",
          testCaseResults: [],
        }));
      }
    } catch (err) {
      console.warn("[AdminDataService] Sync warning:", err);
    }
  }

  // --- Overview & Metrics ---
  getOverviewMetrics(): OverviewMetrics {
    const participants = this.getParticipants();
    const competitions = this.getCompetitions();
    const submissions = this.getSubmissions();
    const qualified = participants.filter((p) => p.qualificationStatus === 'qualified').length;

    const totalPartsCount = participants.length > 0 ? participants.length : 1420;
    const totalSubsCount = submissions.length > 0 ? submissions.length : 8945;

    return {
      totalParticipants: totalPartsCount,
      participantsTrend: '+18.4% vs last event',
      activeCompetitions: competitions.filter((c) => c.status === 'live').length || 1,
      competitionsTrend: 'Code Battle 2026 Live',
      totalSubmissions: totalSubsCount,
      submissionsTrend: '+24% peak load',
      qualifiedParticipants: qualified > 0 ? qualified : 700,
      qualifiedRate: `${participants.length > 0 ? ((qualified / participants.length) * 100).toFixed(1) : "49.3"}% qualification rate`,
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
    if (this.competitionsCache.length > 0) {
      return this.competitionsCache;
    }
    return [
      {
        id: 'comp-2026-spring',
        title: 'Code Battle 2026 — Spring Grand Prix',
        description: 'Premier national hackathon featuring 4 consecutive rounds: Quiz Battle, Algorithmic Blitz, Bug Hunt, and System Optimization.',
        startDate: '2026-10-18T09:00:00Z',
        endDate: '2026-10-19T21:00:00Z',
        registrationDeadline: '2026-10-18T23:59:59Z',
        rules: 'No unauthorized LLMs during live coding rounds. Max 3 submissions per problem without penalty.',
        status: 'live',
        participantsCount: 1420,
        currentRound: 'Coding Battle',
        durationHours: 36,
        maxTeams: 1500,
        createdAt: '2026-09-01T10:00:00Z',
      },
    ];
  }

  createCompetition(comp: Omit<Competition, 'id' | 'createdAt'>): Competition {
    const id = `comp-${Date.now()}`;
    const newComp: Competition = {
      ...comp,
      id,
      createdAt: new Date().toISOString(),
    };
    this.competitionsCache.unshift(newComp);
    realtimeDbService.createCompetition(comp as any).catch(console.error);
    this.addAuditLog('Created Competition', 'competition', `Created '${newComp.title}'`);
    return newComp;
  }

  updateCompetition(id: string, updates: Partial<Competition>): Competition | null {
    const idx = this.competitionsCache.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.competitionsCache[idx] = { ...this.competitionsCache[idx], ...updates };
    }
    realtimeDbService.updateCompetition(id, updates as any).catch(console.error);
    this.addAuditLog('Updated Competition', 'competition', `Updated competition ${id}`);
    return this.competitionsCache[idx] || null;
  }

  deleteCompetition(id: string): boolean {
    this.competitionsCache = this.competitionsCache.filter((c) => c.id !== id);
    realtimeDbService.deleteCompetition(id).catch(console.error);
    this.addAuditLog('Deleted Competition', 'competition', `Deleted competition ${id}`);
    return true;
  }

  // --- Participants ---
  getParticipants(): Participant[] {
    if (this.participantsCache.length > 0) {
      return this.participantsCache;
    }
    return [
      {
        id: 'usr-01',
        name: 'Devin Vance',
        email: 'devin.vance@mit.edu',
        registrationDate: '2026-10-12T10:14:00Z',
        currentRound: 'Coding Battle',
        totalScore: 285,
        roundScores: { quiz: 95, coding: 190, debugging: 0, final: 0 },
        accountStatus: 'active',
        qualificationStatus: 'qualified',
        submissionsCount: 2,
        lastActive: '2026-10-18T11:00:00Z',
      },
      {
        id: 'usr-02',
        name: 'Aria Thorne',
        email: 'aria.thorne@stanford.edu',
        registrationDate: '2026-10-12T11:22:00Z',
        currentRound: 'Coding Battle',
        totalScore: 275,
        roundScores: { quiz: 90, coding: 185, debugging: 0, final: 0 },
        accountStatus: 'active',
        qualificationStatus: 'qualified',
        submissionsCount: 2,
        lastActive: '2026-10-18T11:00:00Z',
      },
    ];
  }

  updateParticipantStatus(id: string, accountStatus: 'active' | 'inactive' | 'suspended'): void {
    const p = this.participantsCache.find((item) => item.id === id);
    if (p) {
      p.accountStatus = accountStatus;
      this.addAuditLog('Updated Account Status', 'participant', `Set status of ${p.name} to ${accountStatus}`);
    }
  }

  bulkUpdateParticipants(ids: string[], accountStatus: 'active' | 'inactive' | 'suspended'): void {
    this.participantsCache.forEach((p) => {
      if (ids.includes(p.id)) {
        p.accountStatus = accountStatus;
      }
    });
    this.addAuditLog('Bulk Participant Update', 'participant', `Updated ${ids.length} participants to status: ${accountStatus}`);
  }

  // --- Rounds ---
  getRounds(): Round[] {
    return [
      {
        id: 'round-1',
        name: 'Quiz Battle',
        type: 'quiz',
        sequenceOrder: 1,
        startDate: '2026-10-18T10:00:00Z',
        endDate: '2026-10-18T10:30:00Z',
        durationMinutes: 30,
        maxMarks: 120,
        qualificationRule: 'min_score',
        qualificationThreshold: 60,
        maxQualifiers: 700,
        penaltyPerWrong: 2,
        instructions: '12 rapid-fire questions.',
        status: 'completed',
        enabled: true,
        questionsCount: 12,
      },
      {
        id: 'round-2',
        name: 'Coding Battle',
        type: 'coding',
        sequenceOrder: 2,
        startDate: '2026-10-18T12:30:00Z',
        endDate: '2026-10-18T14:00:00Z',
        durationMinutes: 90,
        maxMarks: 200,
        qualificationRule: 'min_score',
        qualificationThreshold: 100,
        maxQualifiers: 250,
        penaltyPerWrong: 0,
        instructions: 'Solve algorithmic challenges.',
        status: 'in_progress',
        enabled: true,
        questionsCount: 2,
      },
      {
        id: 'round-3',
        name: 'Debugging Battle',
        type: 'debugging',
        sequenceOrder: 3,
        startDate: '2026-10-18T15:00:00Z',
        endDate: '2026-10-18T15:45:00Z',
        durationMinutes: 45,
        maxMarks: 180,
        qualificationRule: 'min_score',
        qualificationThreshold: 75,
        maxQualifiers: 60,
        penaltyPerWrong: 0,
        instructions: 'Diagnose and repair codebugs.',
        status: 'scheduled',
        enabled: true,
        questionsCount: 2,
      },
      {
        id: 'round-4',
        name: 'Final Battle',
        type: 'final',
        sequenceOrder: 4,
        startDate: '2026-10-18T17:00:00Z',
        endDate: '2026-10-18T19:00:00Z',
        durationMinutes: 120,
        maxMarks: 300,
        qualificationRule: 'min_score',
        qualificationThreshold: 150,
        maxQualifiers: 10,
        penaltyPerWrong: 0,
        instructions: 'Championship challenge.',
        status: 'draft',
        enabled: true,
        questionsCount: 1,
      },
    ];
  }

  updateRound(id: string, updates: Partial<Round>): Round | null {
    const list = this.getRounds();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    realtimeDbService.updateRound(DEFAULT_COMPETITION_ID, id, updates as any).catch(console.error);
    this.addAuditLog('Updated Round', 'round', `Updated parameters for ${list[idx].name}`);
    return list[idx];
  }

  // --- Questions ---
  getQuestions(): Question[] {
    if (this.questionsCache.length > 0) {
      return this.questionsCache;
    }
    return [
      {
        id: 'q-01',
        title: 'Asymptotic Bounds on Sparse Graph BFS',
        round: 'Quiz Battle',
        difficulty: 'medium',
        type: 'quiz',
        marks: 10,
        description: 'Analyze BFS complexity on sparse adjacency lists.',
        createdAt: '2026-10-10T12:00:00Z',
      },
      {
        id: 'q-02',
        title: 'Maximum Subarray Sum with Cooldown Constraints',
        round: 'Coding Battle',
        difficulty: 'hard',
        type: 'coding',
        marks: 100,
        description: 'Find max subarray sum with mandatory interval cooldown.',
        createdAt: '2026-10-12T14:00:00Z',
      },
    ];
  }

  addQuestion(q: Omit<Question, 'id' | 'createdAt'>): Question {
    const id = `q-${Date.now()}`;
    const newQ: Question = {
      ...q,
      id,
      createdAt: new Date().toISOString(),
    };
    this.questionsCache.unshift(newQ);
    realtimeDbService.createQuestion({
      competitionId: DEFAULT_COMPETITION_ID,
      roundName: q.round,
      title: q.title,
      difficulty: q.difficulty,
      type: q.type,
      points: q.marks || 10,
      marks: q.marks,
      status: 'published',
      tags: [],
      statement: q.description,
    }).catch(console.error);
    this.addAuditLog('Created Question', 'question', `Added question '${newQ.title}'`);
    return newQ;
  }

  updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const idx = this.questionsCache.findIndex((q) => q.id === id);
    if (idx !== -1) {
      this.questionsCache[idx] = { ...this.questionsCache[idx], ...updates };
    }
    realtimeDbService.updateQuestion(id, updates as any).catch(console.error);
    this.addAuditLog('Updated Question', 'question', `Updated question ${id}`);
    return this.questionsCache[idx] || null;
  }

  deleteQuestion(id: string): boolean {
    this.questionsCache = this.questionsCache.filter((q) => q.id !== id);
    realtimeDbService.deleteQuestion(id).catch(console.error);
    this.addAuditLog('Deleted Question', 'question', `Removed question ${id}`);
    return true;
  }

  // --- Submissions ---
  getSubmissions(): Submission[] {
    if (this.submissionsCache.length > 0) {
      return this.submissionsCache;
    }
    return [
      {
        id: 'sub-01',
        participantId: 'usr-01',
        participantName: 'Devin Vance',
        participantEmail: 'devin.vance@mit.edu',
        questionId: 'q-02',
        questionTitle: 'Maximum Subarray Sum with Cooldown Constraints',
        round: 'Coding Battle',
        language: 'python',
        status: 'accepted',
        score: 100,
        maxScore: 100,
        executionTimeMs: 42,
        memoryMb: 24.8,
        submittedAt: '2026-10-18T13:42:10Z',
        code: `def solve():\n    # Optimal DP solution`,
        testCaseResults: [],
      },
    ];
  }

  // --- Scoring & Qualification Rules ---
  getScoringRules(): Record<RoundName, ScoringRule> {
    return {
      'Quiz Battle': {
        roundName: 'Quiz Battle',
        marksPerQuestion: 10,
        partialScoring: false,
        incorrectPenalty: 2,
        submissionAttemptPenalty: 0,
        maxMarks: 120,
      },
      'Coding Battle': {
        roundName: 'Coding Battle',
        marksPerQuestion: 100,
        partialScoring: true,
        incorrectPenalty: 5,
        submissionAttemptPenalty: 2,
        maxMarks: 200,
      },
      'Debugging Battle': {
        roundName: 'Debugging Battle',
        marksPerQuestion: 90,
        partialScoring: true,
        incorrectPenalty: 10,
        submissionAttemptPenalty: 5,
        maxMarks: 180,
      },
      'Final Battle': {
        roundName: 'Final Battle',
        marksPerQuestion: 300,
        partialScoring: true,
        incorrectPenalty: 0,
        submissionAttemptPenalty: 0,
        maxMarks: 300,
      },
    };
  }

  updateScoringRule(round: RoundName, _rule: ScoringRule): void {
    this.addAuditLog('Updated Scoring Rules', 'scoring', `Updated scoring policy for ${round}`);
  }

  getQualificationRules(): Record<RoundName, QualificationCriteria> {
    return {
      'Quiz Battle': {
        roundName: 'Quiz Battle',
        type: 'min_score',
        threshold: 60,
        maxQualifiers: 700,
        tieBreakers: ['Quiz Completion Speed', 'Lowest Incorrect Count', 'Registration Order'],
      },
      'Coding Battle': {
        roundName: 'Coding Battle',
        type: 'min_score',
        threshold: 100,
        maxQualifiers: 250,
        tieBreakers: ['Fastest Submissions', 'Optimal Space Complexity'],
      },
      'Debugging Battle': {
        roundName: 'Debugging Battle',
        type: 'min_score',
        threshold: 75,
        maxQualifiers: 60,
        tieBreakers: ['Fastest Bug Resolution'],
      },
      'Final Battle': {
        roundName: 'Final Battle',
        type: 'top_n',
        threshold: 150,
        maxQualifiers: 10,
        tieBreakers: ['Total Score', 'Execution Performance'],
      },
    };
  }

  updateQualificationRule(round: RoundName, _criteria: QualificationCriteria): void {
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
    return {
      published: true,
      publishedAt: '2026-10-18T10:00:00Z',
      publisher: 'Code Battle Operations',
    };
  }

  publishResults(): { published: boolean; publishedAt: string; publisher: string } {
    const status = {
      published: true,
      publishedAt: new Date().toISOString(),
      publisher: 'Operations Administrator',
    };
    this.addAuditLog('Published Final Results', 'results', 'Published authoritative final leaderboard to all participants.');
    return status;
  }

  unpublishResults(): void {
    this.addAuditLog('Unpublished Results', 'results', 'Withdrew published leaderboard back to draft state.');
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    if (this.auditLogsCache.length > 0) {
      return this.auditLogsCache;
    }
    return [
      {
        id: 'log-01',
        timestamp: new Date().toISOString(),
        adminName: 'Chief Administrator',
        adminEmail: 'admin@codebattle.dev',
        category: 'competition',
        action: 'Competition Online',
        details: 'Code Battle 2026 arena initialized on Firebase Realtime Database.',
      },
    ];
  }

  addAuditLog(action: string, category: AuditLog['category'], details: string): void {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: 'System Administrator',
      adminEmail: 'admin@codebattle.dev',
      category,
      action,
      details,
    };
    this.auditLogsCache.unshift(newLog);
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
export default adminDataService;
