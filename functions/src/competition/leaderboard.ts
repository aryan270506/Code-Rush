import * as admin from "firebase-admin";

export interface LeaderboardRow {
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

export async function recalculateLeaderboard(competitionId: string): Promise<LeaderboardRow[]> {
  const db = admin.database();
  const scoresSnapshot = await db.ref(`scores/${competitionId}`).once("value");
  const scoresVal = scoresSnapshot.val() || {};

  const userIds = Object.keys(scoresVal);
  if (userIds.length === 0) {
    await db.ref(`leaderboards/${competitionId}`).set([]);
    return [];
  }

  // Fetch users details in parallel
  const usersSnapshot = await db.ref("users").once("value");
  const usersVal = usersSnapshot.val() || {};

  const rows: Array<Omit<LeaderboardRow, "rank">> = userIds.map((uid) => {
    const s = scoresVal[uid] || {};
    const u = usersVal[uid] || {};

    const r1 = Number(s.quiz || s.round1 || 0);
    const r2 = Number(s.coding || s.round2 || 0);
    const r3 = Number(s.debugging || s.round3 || 0);
    const r4 = Number(s.final || s.round4 || 0);
    const total = r1 + r2 + r3 + r4;

    return {
      userId: uid,
      userName: u.displayName || u.name || s.userName || "Competitor",
      userEmail: u.email || s.userEmail || "",
      avatarUrl: u.photoURL || u.avatarUrl || "",
      totalScore: total,
      round1Score: r1,
      round2Score: r2,
      round3Score: r3,
      round4Score: r4,
      lastUpdated: s.lastUpdated || new Date().toISOString(),
    };
  });

  // Sort descending by totalScore, then ascending by lastUpdated (tie-breaker: earlier completion)
  rows.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
  });

  const ranked: LeaderboardRow[] = rows.map((r, idx) => ({
    ...r,
    rank: idx + 1,
  }));

  // Store in Realtime Database under /leaderboards/{competitionId}
  await db.ref(`leaderboards/${competitionId}`).set(ranked);

  return ranked;
}
