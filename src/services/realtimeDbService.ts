import {
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  off,
  push,
} from "firebase/database";
import { httpsCallable } from "firebase/functions";
import { rtdb, functions } from "../lib/firebase";
import type { TestCase as AdminTestCase } from "../types/admin";

export const DEFAULT_COMPETITION_ID = "comp-2026-spring";

export interface DBCompetition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: "draft" | "scheduled" | "live" | "completed" | "archived" | "cancelled";
  currentRound: string;
  durationHours: number;
  maxTeams: number;
  createdAt: string;
  participantsCount?: number;
}

export interface DBRound {
  id: number;
  name: string;
  slug: string;
  status: "upcoming" | "locked" | "available" | "in_progress" | "submitted" | "under_evaluation" | "qualified" | "not_qualified" | "completed" | "expired";
  maxScore: number;
  durationMinutes: number;
  questionCount: number;
  qualificationCutoff: number;
  shortDescription: string;
  description?: string;
  requiresQualificationToAdvance?: boolean;
  unlockConditionText?: string;
  startTime?: string;
  endTime?: string;
  rules?: string[];
  iconName?: string;
  color?: "violet" | "cyan" | "amber" | "purple";
}

export interface DBQuestion {
  id: string;
  competitionId: string;
  roundName: string;
  title: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  type: "mcq" | "coding" | "debugging" | "sql" | "quiz" | "final";
  points?: number;
  marks?: number;
  status?: "published" | "draft" | "archived";
  tags: string[];
  statement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  starterCode?: Record<string, string>;
  options?: Array<{ id: string; text: string }>;
  sampleCases?: Array<{ input: string; output: string; explanation?: string }>;
  buggyCode?: Record<string, string>;
  explanation?: string;
  supportedLanguages?: string[];
  executionTimeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface DBSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  roundSlug: string;
  problemId: string;
  problemTitle: string;
  language: string;
  status: "accepted" | "wrong_answer" | "time_limit_exceeded" | "runtime_error" | "compilation_error";
  score: number;
  maxScore: number;
  executionTimeMs: number;
  compilerOutput: string;
  submittedAt: string;
  code?: string;
}

export interface DBLeaderboardItem {
  rank: number;
  userId: string;
  userName: string;
  userEmail?: string;
  avatarUrl?: string;
  totalScore: number;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  round4Score: number;
  lastUpdated: string;
}

export interface DBAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
}

export interface QuestionDraft {
  title?: string;
  points?: number;
  statement?: string;
  description?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string | string[];
  sampleTestCases?: AdminTestCase[];
  sampleInput?: string;
  sampleOutput?: string;
  hiddenTestCases?: AdminTestCase[];
  buggyCode?: string;
  solutionCode?: string;
}

class RealtimeDatabaseService {
  // ── 1. COMPETITIONS & ROUNDS ──────────────────────────────────────
  async getCompetitions(): Promise<DBCompetition[]> {
    try {
      const snap = await get(ref(rtdb, "competitions"));
      if (!snap.exists()) return [];
      const val = snap.val();
      return Object.values(val) as DBCompetition[];
    } catch (err) {
      console.warn("[RTDB] getCompetitions warning:", err);
      return [];
    }
  }

  subscribeCompetitions(cb: (competitions: DBCompetition[]) => void): () => void {
    const competitionsRef = ref(rtdb, "competitions");
    const listener = onValue(competitionsRef, (snap) => {
      if (snap.exists()) {
        cb(Object.values(snap.val()) as DBCompetition[]);
      } else {
        cb([]);
      }
    });
    return () => off(competitionsRef, "value", listener);
  }

  async createCompetition(comp: Omit<DBCompetition, "id" | "createdAt">): Promise<DBCompetition> {
    const newRef = push(ref(rtdb, "competitions"));
    const id = newRef.key || `comp-${Date.now()}`;
    const newComp: DBCompetition = {
      ...comp,
      id,
      createdAt: new Date().toISOString(),
    };
    await set(ref(rtdb, `competitions/${id}`), newComp);
    return newComp;
  }

  async updateCompetition(id: string, updates: Partial<DBCompetition>): Promise<void> {
    await update(ref(rtdb, `competitions/${id}`), updates);
  }

  async deleteCompetition(id: string): Promise<void> {
    await remove(ref(rtdb, `competitions/${id}`));
  }

  async getRounds(competitionId: string = DEFAULT_COMPETITION_ID): Promise<DBRound[]> {
    try {
      const snap = await get(ref(rtdb, `rounds/${competitionId}`));
      if (!snap.exists()) return [];
      return Object.values(snap.val()) as DBRound[];
    } catch {
      return [];
    }
  }

  subscribeRounds(competitionId: string = DEFAULT_COMPETITION_ID, cb: (rounds: DBRound[]) => void): () => void {
    const roundsRef = ref(rtdb, `rounds/${competitionId}`);
    const listener = onValue(roundsRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const sorted = (Object.values(val) as DBRound[]).sort((a, b) => a.id - b.id);
        cb(sorted);
      } else {
        cb([]);
      }
    });
    return () => off(roundsRef, "value", listener);
  }

  async updateRound(competitionId: string, roundSlug: string, updates: Partial<DBRound>): Promise<void> {
    await update(ref(rtdb, `rounds/${competitionId}/${roundSlug}`), updates);
  }

  // ── 2. QUESTIONS ──────────────────────────────────────────────────
  async getQuestions(competitionId: string = DEFAULT_COMPETITION_ID): Promise<DBQuestion[]> {
    try {
      const snap = await get(ref(rtdb, `questions/${competitionId}`));
      if (!snap.exists()) return [];
      return Object.values(snap.val()) as DBQuestion[];
    } catch {
      return [];
    }
  }

  subscribeQuestions(competitionId: string = DEFAULT_COMPETITION_ID, cb: (questions: DBQuestion[]) => void): () => void {
    const qRef = ref(rtdb, `questions/${competitionId}`);
    const listener = onValue(qRef, (snap) => {
      if (snap.exists()) {
        cb(Object.values(snap.val()) as DBQuestion[]);
      } else {
        cb([]);
      }
    });
    return () => off(qRef, "value", listener);
  }

  async createQuestion(question: Omit<DBQuestion, "id">, competitionId: string = DEFAULT_COMPETITION_ID): Promise<DBQuestion> {
    const newRef = push(ref(rtdb, `questions/${competitionId}`));
    const id = newRef.key || `q-${Date.now()}`;
    const newQ: DBQuestion = { ...question, id, competitionId };
    await set(ref(rtdb, `questions/${competitionId}/${id}`), newQ);
    return newQ;
  }

  async updateQuestion(id: string, updates: Partial<DBQuestion>, competitionId: string = DEFAULT_COMPETITION_ID): Promise<void> {
    await update(ref(rtdb, `questions/${competitionId}/${id}`), updates);
  }

  async deleteQuestion(id: string, competitionId: string = DEFAULT_COMPETITION_ID): Promise<void> {
    await remove(ref(rtdb, `questions/${competitionId}/${id}`));
  }

  // ── 3. SUBMISSIONS ────────────────────────────────────────────────
  async getUserSubmissions(userId: string, competitionId: string = DEFAULT_COMPETITION_ID): Promise<DBSubmission[]> {
    try {
      const slugs = ["coding", "debugging", "final"];
      const all: DBSubmission[] = [];
      for (const slug of slugs) {
        const snap = await get(ref(rtdb, `submissions/${competitionId}/${slug}/${userId}`));
        if (snap.exists()) {
          const items = Object.entries(snap.val()).map(([subId, v]: [string, any]) => ({
            ...v,
            id: subId,
            roundSlug: slug,
          }));
          all.push(...items);
        }
      }
      return all.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } catch {
      return [];
    }
  }

  async getAllSubmissions(competitionId: string = DEFAULT_COMPETITION_ID): Promise<DBSubmission[]> {
    try {
      const slugs = ["coding", "debugging", "final"];
      const all: DBSubmission[] = [];
      for (const slug of slugs) {
        const snap = await get(ref(rtdb, `submissions/${competitionId}/${slug}`));
        if (snap.exists()) {
          const userBuckets = snap.val();
          for (const uid in userBuckets) {
            const subs = userBuckets[uid];
            for (const subId in subs) {
              all.push({
                ...subs[subId],
                id: subId,
                roundSlug: slug,
                userId: uid,
              });
            }
          }
        }
      }
      return all.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } catch {
      return [];
    }
  }

  // ── 4. LEADERBOARD ────────────────────────────────────────────────
  async getLeaderboard(competitionId: string = DEFAULT_COMPETITION_ID): Promise<DBLeaderboardItem[]> {
    try {
      const snap = await get(ref(rtdb, `leaderboards/${competitionId}`));
      if (!snap.exists()) return [];
      return snap.val() as DBLeaderboardItem[];
    } catch {
      return [];
    }
  }

  subscribeLeaderboard(
    competitionId: string = DEFAULT_COMPETITION_ID,
    cb: (leaderboard: DBLeaderboardItem[]) => void
  ): () => void {
    const lbRef = ref(rtdb, `leaderboards/${competitionId}`);
    const listener = onValue(lbRef, (snap) => {
      if (snap.exists()) {
        cb(snap.val() as DBLeaderboardItem[]);
      } else {
        cb([]);
      }
    });
    return () => off(lbRef, "value", listener);
  }

  // ── 5. ANNOUNCEMENTS ──────────────────────────────────────────────
  async getAnnouncements(competitionId: string = DEFAULT_COMPETITION_ID): Promise<DBAnnouncement[]> {
    try {
      const snap = await get(ref(rtdb, `announcements/${competitionId}`));
      if (!snap.exists()) return [];
      return Object.values(snap.val()) as DBAnnouncement[];
    } catch {
      return [];
    }
  }

  subscribeAnnouncements(
    competitionId: string = DEFAULT_COMPETITION_ID,
    cb: (announcements: DBAnnouncement[]) => void
  ): () => void {
    const annRef = ref(rtdb, `announcements/${competitionId}`);
    const listener = onValue(annRef, (snap) => {
      if (snap.exists()) {
        const list = Object.values(snap.val()) as DBAnnouncement[];
        cb(list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } else {
        cb([]);
      }
    });
    return () => off(annRef, "value", listener);
  }

  async createAnnouncement(ann: Omit<DBAnnouncement, "id" | "timestamp">, competitionId: string = DEFAULT_COMPETITION_ID): Promise<void> {
    const newRef = push(ref(rtdb, `announcements/${competitionId}`));
    const id = newRef.key || `ann-${Date.now()}`;
    await set(ref(rtdb, `announcements/${competitionId}/${id}`), {
      ...ann,
      id,
      timestamp: new Date().toISOString(),
    });
  }

  // ── 6. PARTICIPANTS (ADMIN VIEW) ──────────────────────────────────
  async getParticipants(): Promise<any[]> {
    try {
      const usersSnap = await get(ref(rtdb, "users"));
      if (!usersSnap.exists()) return [];
      const users = usersSnap.val();
      return Object.entries(users).map(([uid, u]: [string, any]) => ({
        id: uid,
        name: u.displayName || u.name || "Competitor",
        email: u.email || "",
        role: u.role || "participant",
        registrationDate: u.createdAt || new Date().toISOString(),
        score: u.score || 0,
        status: u.status || "active",
      }));
    } catch {
      return [];
    }
  }

  // ── 7. CALLABLE CLOUD FUNCTIONS ───────────────────────────────────
  async submitQuiz(data: {
    competitionId?: string;
    answers: Record<string, string>;
    timeSpentSeconds?: number;
    userName?: string;
  }): Promise<any> {
    const fn = httpsCallable(functions, "submitQuiz");
    const res = await fn(data);
    const payload = res.data as { result?: unknown } & Record<string, unknown>;
    return payload.result ?? payload;
  }

  async submitCode(data: {
    competitionId?: string;
    roundSlug: "coding" | "debugging" | "final";
    problemId: string;
    problemTitle?: string;
    language: string;
    code: string;
    userName?: string;
  }): Promise<any> {
    const fn = httpsCallable(functions, "submitCode");
    const res = await fn(data);
    const payload = res.data as { result?: unknown } & Record<string, unknown>;
    return payload.result ?? payload;
  }

  async requestAiHint(data: {
    problemTitle: string;
    problemStatement: string;
    currentCode: string;
    errorMessage?: string;
    language?: string;
  }): Promise<string> {
    try {
      const fn = httpsCallable<{ problemTitle: string; problemStatement: string; currentCode: string; errorMessage?: string; language?: string }, { success: boolean; hint: string }>(functions, "generateHint");
      const res = await fn(data);
      return res.data?.hint || "Consider evaluating your boundary checks and loop invariants.";
    } catch (err: unknown) {
      console.warn("[requestAiHint] Error:", err);
      return "Hint unavailable at this time. Verify your time complexity and test for base cases.";
    }
  }

  async requestAiExplanation(data: {
    code: string;
    compilerOutput: string;
    language: string;
  }): Promise<string> {
    try {
      const fn = httpsCallable<{ code: string; compilerOutput: string; language: string }, { success: boolean; explanation: string }>(functions, "explainError");
      const res = await fn(data);
      return res.data?.explanation || "Review the stack trace above for the exact line containing the mismatch.";
    } catch {
      return "Ensure all data types match function signatures and memory allocations are de-allocated.";
    }
  }

  async generateQuestionDraft(data: {
    topic: string;
    roundType: "quiz" | "coding" | "debugging" | "final";
    difficulty: "easy" | "medium" | "hard" | "expert";
  }): Promise<QuestionDraft> {
    const fn = httpsCallable(functions, "generateQuestion");
    const res = await fn(data);
    const draft = (res.data as { questionDraft?: QuestionDraft | string })?.questionDraft;
    if (typeof draft === "object" && draft !== null) return draft;
    return draft ? { statement: draft } : {};
  }

  async seedDatabase(): Promise<any> {
    const fn = httpsCallable(functions, "seedDatabase");
    const res = await fn({});
    return res.data;
  }
}

export const realtimeDbService = new RealtimeDatabaseService();
export default realtimeDbService;
