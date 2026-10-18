#!/usr/bin/env node

/**
 * Code Battle — Push Participants & Competition Data to Live Firebase Realtime Database
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

async function ensureFirebaseAuthUser(p) {
  // Try signup
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
      // update displayName
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
      // sign in to get localId
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
  console.log("🚀 [Code Battle] Pushing all participants directly to live Firebase Realtime Database...");
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

    // 1. Populate top-level "participants" (by databaseId AND by authUid)
    participantsNode[p.databaseId] = participantRecord;
    if (authUid !== p.databaseId) {
      participantsNode[authUid] = participantRecord;
    }

    // 2. Populate top-level "users"
    usersNode[p.databaseId] = userRecord;
    usersNode[authUid] = userRecord;

    // 3. Populate "userRoles"
    userRolesNode[p.databaseId] = role;
    userRolesNode[authUid] = role;

    if (role === "participant") {
      // 4. Registrations
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

      // 5. Scores
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

      // 6. Progress
      const roundsCompleted = Object.keys(p.scores).length;
      progressNode[p.databaseId] = { currentRound: roundsCompleted, updatedAt: now };
      if (authUid !== p.databaseId) {
        progressNode[authUid] = { currentRound: roundsCompleted, updatedAt: now };
      }

      // 7. Qualification per round
      for (const [rSlug, status] of Object.entries(p.qualification)) {
        const sc = p.scores[rSlug] || 0;
        qualificationNode[rSlug][p.databaseId] = { status, score: sc, updatedAt: now };
        if (authUid !== p.databaseId) {
          qualificationNode[rSlug][authUid] = { status, score: sc, updatedAt: now };
        }
      }

      // 8. Leaderboard Entry
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

  // Sort leaderboard
  leaderboardEntries.sort((a, b) => b.score - a.score);
  leaderboardEntries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  const payload = {
    participants: participantsNode,
    users: usersNode,
    userRoles: userRolesNode,
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

  console.log("\n📦 Sending payload to Firebase Realtime Database via REST API (PATCH)...");
  const res = await fetch(`${RTDB_URL}/.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update Firebase Realtime Database: ${res.status} ${res.statusText}\n${errorText}`);
  }

  console.log("✅ Successfully written to Firebase Realtime Database!");
  console.log(`   - Added ${Object.keys(participantsNode).length} participant references under /participants`);
  console.log(`   - Added ${Object.keys(usersNode).length} user references under /users`);
  console.log(`   - Added userRoles under /userRoles`);
  console.log(`   - Added registrations under /registrations/${COMPETITION_ID}`);
  console.log(`   - Added scores under /scores/${COMPETITION_ID}`);
  console.log(`   - Added qualification under /qualification/${COMPETITION_ID}`);
  console.log(`   - Added leaderboard under /leaderboard/${COMPETITION_ID}`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
