import * as admin from "firebase-admin";

export async function seedCompetitionData(): Promise<{ success: boolean; message: string }> {
  const db = admin.database();
  const compId = "comp-2026-spring";

  const existingSnap = await db.ref(`competitions/${compId}`).once("value");
  if (existingSnap.exists()) {
    return { success: true, message: "Database already initialized." };
  }

  const updates: Record<string, unknown> = {};

  // 1. Competition Record
  updates[`competitions/${compId}`] = {
    id: compId,
    title: "Code Battle 2026 — Spring Grand Prix",
    description: "Premier competitive programming tournament featuring 4 consecutive stages: Quiz Battle, Algorithmic Blitz, Bug Hunt, and Distributed Consensus.",
    startDate: "2026-10-18T09:00:00Z",
    endDate: "2026-10-19T21:00:00Z",
    registrationDeadline: "2026-10-18T23:59:59Z",
    status: "live",
    currentRound: "Coding Battle",
    durationHours: 36,
    maxTeams: 1500,
    createdAt: new Date().toISOString(),
  };

  // 2. 4 Configured Rounds
  updates[`rounds/${compId}/quiz`] = {
    id: 1,
    name: "Round 1: Quiz Battle",
    slug: "quiz",
    status: "available",
    maxScore: 120,
    durationMinutes: 30,
    questionCount: 12,
    qualificationCutoff: 60,
    shortDescription: "12 rapid-fire questions on asymptotic complexity, memory hierarchy, cache coherency, and pointer arithmetic.",
  };

  updates[`rounds/${compId}/coding`] = {
    id: 2,
    name: "Round 2: Coding Battle",
    slug: "coding",
    status: "locked",
    maxScore: 200,
    durationMinutes: 90,
    questionCount: 3,
    qualificationCutoff: 100,
    shortDescription: "3 algorithmic challenges covering sliding windows, dynamic programming with bitmask, and graph connectivity.",
  };

  updates[`rounds/${compId}/debugging`] = {
    id: 3,
    name: "Round 3: Debugging Battle",
    slug: "debugging",
    status: "locked",
    maxScore: 180,
    durationMinutes: 45,
    questionCount: 2,
    qualificationCutoff: 75,
    shortDescription: "Diagnose race conditions, pointer leaks, and LRU cache eviction bugs in complex production code.",
  };

  updates[`rounds/${compId}/final`] = {
    id: 4,
    name: "Round 4: Final Battle",
    slug: "final",
    status: "locked",
    maxScore: 300,
    durationMinutes: 120,
    questionCount: 1,
    qualificationCutoff: 150,
    shortDescription: "Championship stage: implement resilient distributed photonic consensus with sub-second performance bounds.",
  };

  // 3. Announcements
  updates[`announcements/${compId}/ann-1`] = {
    id: "ann-1",
    title: "Competition Live: Welcome Competitors!",
    content: "The Code Battle 2026 Arena is officially open. Stage 1 Quiz Battle is active. Check your internet connection and good luck!",
    author: "Grandmaster Operations",
    timestamp: new Date().toISOString(),
    priority: "high",
  };

  updates[`announcements/${compId}/ann-2`] = {
    id: "ann-2",
    title: "Anti-Cheating & Integrity Protocol Active",
    content: "Submissions undergo automated static similarity analysis and sandbox verification. Unpermitted AI generation will result in disqualification.",
    author: "Security Team",
    timestamp: new Date().toISOString(),
    priority: "medium",
  };

  await db.ref().update(updates);

  return { success: true, message: "Database seeded successfully with Code Battle 2026 competition structure." };
}
