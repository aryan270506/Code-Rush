import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { createAndStoreOtp, validateOtp } from "./auth/emailOtp";
import { sendOtpEmail } from "./email/emailProvider";
import { assignAdminRole } from "./admin/setAdminRole";
import { evaluateQuizSubmission } from "./competition/quizEvaluator";
import { evaluateCodeSubmission } from "./competition/codeEvaluator";
import { generateAiHint, explainCodeError, generateAiQuestion } from "./ai/aiService";
import { recalculateLeaderboard } from "./competition/leaderboard";
import { seedCompetitionData } from "./admin/seedDatabase";

// Initialize Firebase Admin singleton
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: sendEmailOtp
 * Generates a 6-digit secure OTP, hashes and stores it in Realtime Database, and sends an email via Resend.
 */
export const sendEmailOtp = onCall(
  {
    cors: true,
  },
  async (request) => {
    const { email, uid } = request.data || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new HttpsError("invalid-argument", "A valid email address is required.");
    }

    try {
      // 1. Generate & store OTP
      const { otp, cooldownSeconds } = await createAndStoreOtp(email, uid || "unknown");

      // 2. Fetch display name if available
      let displayName = "Competitor";
      if (uid) {
        try {
          const userSnap = await admin.database().ref(`users/${uid}`).get();
          if (userSnap.exists()) {
            displayName = userSnap.val()?.displayName || displayName;
          }
        } catch {
          // Fallback to default
        }
      }

      // 3. Send email via Resend
      await sendOtpEmail({
        toEmail: email,
        otp,
        displayName,
        expiresInMinutes: 5,
      });

      return {
        success: true,
        message: "A 6-digit verification code has been dispatched to your email address.",
        cooldownSeconds,
      };
    } catch (err: unknown) {
      console.error("[sendEmailOtp] Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to dispatch verification code.";
      throw new HttpsError("internal", msg);
    }
  }
);

/**
 * Cloud Function: resendEmailOtp
 * Validates 60s cooldown, invalidates prior code, generates new code, and re-dispatches email.
 */
export const resendEmailOtp = onCall(
  {
    cors: true,
  },
  async (request) => {
    const { email, uid } = request.data || {};

    if (!email || typeof email !== "string") {
      throw new HttpsError("invalid-argument", "A valid email address is required.");
    }

    try {
      const { otp, cooldownSeconds } = await createAndStoreOtp(email, uid || "unknown");

      let displayName = "Competitor";
      if (uid) {
        try {
          const userSnap = await admin.database().ref(`users/${uid}`).get();
          if (userSnap.exists()) {
            displayName = userSnap.val()?.displayName || displayName;
          }
        } catch {
          // ignore
        }
      }

      await sendOtpEmail({
        toEmail: email,
        otp,
        displayName,
        expiresInMinutes: 5,
      });

      return {
        success: true,
        message: "A replacement verification code has been dispatched to your email.",
        cooldownSeconds,
      };
    } catch (err: unknown) {
      console.error("[resendEmailOtp] Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to resend verification code.";
      throw new HttpsError("internal", msg);
    }
  }
);

/**
 * Cloud Function: verifyEmailOtp
 * Checks submitted 6-digit OTP against cryptographic hash.
 * If valid:
 * 1. Sets Firebase Auth emailVerified: true
 * 2. Updates Realtime Database users/{uid} with emailVerified: true, accountStatus: 'active'
 * 3. Sets custom user claims { role: 'participant' } if not already assigned
 */
export const verifyEmailOtp = onCall(
  {
    cors: true,
  },
  async (request) => {
    const { email, otp, uid } = request.data || {};

    if (!email || !otp || typeof otp !== "string" || otp.length !== 6) {
      throw new HttpsError("invalid-argument", "A valid email address and 6-digit code are required.");
    }

    try {
      const result = await validateOtp(email, otp);

      if (!result.valid) {
        return {
          success: false,
          verified: false,
          message: result.error || "Invalid verification code.",
        };
      }

      // If uid was provided, update Auth and Realtime Database
      if (uid) {
        try {
          // Update Firebase Auth user
          await admin.auth().updateUser(uid, {
            emailVerified: true,
          });

          // Ensure default claims exist
          const existingClaims = (await admin.auth().getUser(uid)).customClaims || {};
          if (!existingClaims.role) {
            await admin.auth().setCustomUserClaims(uid, {
              ...existingClaims,
              role: "participant",
            });
          }

          // Update Realtime Database profile
          await admin.database().ref(`users/${uid}`).update({
            emailVerified: true,
            accountStatus: "active",
            updatedAt: new Date().toISOString(),
          });
        } catch (updateErr) {
          console.error("[verifyEmailOtp] User state update error:", updateErr);
        }
      }

      return {
        success: true,
        verified: true,
        message: "Email successfully verified. Your account is active.",
      };
    } catch (err: unknown) {
      console.error("[verifyEmailOtp] Error:", err);
      const msg = err instanceof Error ? err.message : "An error occurred while verifying the code.";
      throw new HttpsError("internal", msg);
    }
  }
);

/**
 * Cloud Function: setAdminRole
 * Protected administrative function to elevate another user.
 * Can only be invoked by an authenticated administrator.
 */
export const setAdminRole = onCall(
  {
    cors: true,
  },
  async (request) => {
    // 1. Verify caller is authenticated
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication is required to perform this action.");
    }

    // 2. Verify caller has admin role in custom claims or Realtime Database
    const callerUid = request.auth.uid;
    const callerClaims = request.auth.token;
    const isCallerAdmin = callerClaims.role === "admin";

    if (!isCallerAdmin) {
      const callerSnap = await admin.database().ref(`userRoles/${callerUid}`).get();
      if (callerSnap.val() !== "admin") {
        throw new HttpsError("permission-denied", "Only administrators can grant administrator roles.");
      }
    }

    const { targetEmailOrUid } = request.data || {};
    if (!targetEmailOrUid || typeof targetEmailOrUid !== "string") {
      throw new HttpsError("invalid-argument", "targetEmailOrUid is required.");
    }

    return await assignAdminRole(targetEmailOrUid);
  }
);

/**
 * Cloud Function: submitQuiz
 * Authoritative backend grading of Quiz Battle.
 */
export const submitQuiz = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required to submit quiz.");
    }

    const { competitionId, answers, timeSpentSeconds, userName } = request.data || {};
    if (!answers || typeof answers !== "object") {
      throw new HttpsError("invalid-argument", "Answers object is required.");
    }

    const result = await evaluateQuizSubmission({
      competitionId,
      userId: request.auth.uid,
      userName: userName || request.auth.token.name || "Competitor",
      userEmail: request.auth.token.email,
      answers,
      timeSpentSeconds,
    });

    return { success: true, result };
  }
);

/**
 * Cloud Function: submitCode
 * Authoritative backend code execution via JDoodle and scoring for Coding, Debugging, and Final battles.
 */
export const submitCode = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required to submit code.");
    }

    const { competitionId, roundSlug, problemId, problemTitle, language, code, userName } = request.data || {};
    if (!code || typeof code !== "string" || !problemId || !language) {
      throw new HttpsError("invalid-argument", "Missing required code, problemId, or language.");
    }

    const result = await evaluateCodeSubmission({
      competitionId,
      userId: request.auth.uid,
      userName: userName || request.auth.token.name || "Competitor",
      userEmail: request.auth.token.email,
      roundSlug: roundSlug || "coding",
      problemId,
      problemTitle,
      language,
      code,
    });

    return { success: true, result };
  }
);

/**
 * Cloud Function: generateHint
 * Groq & Gemini powered AI hint generation.
 */
export const generateHint = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required for AI hints.");
    }

    const { problemTitle, problemStatement, currentCode, errorMessage } = request.data || {};
    if (!problemTitle || !problemStatement) {
      throw new HttpsError("invalid-argument", "problemTitle and problemStatement are required.");
    }

    const hint = await generateAiHint({
      problemTitle,
      problemStatement,
      currentCode: currentCode || "",
      errorMessage,
    });

    return { success: true, hint };
  }
);

/**
 * Cloud Function: explainError
 * Explains compiler / runtime error in code.
 */
export const explainError = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const { code, compilerOutput, language } = request.data || {};
    if (!code || !compilerOutput) {
      throw new HttpsError("invalid-argument", "code and compilerOutput are required.");
    }

    const explanation = await explainCodeError({
      code,
      compilerOutput,
      language: language || "python",
    });

    return { success: true, explanation };
  }
);

/**
 * Cloud Function: generateQuestion
 * Admin-only AI drafting of competition questions.
 */
export const generateQuestion = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const isCallerAdmin = request.auth.token.role === "admin";
    if (!isCallerAdmin) {
      const userSnap = await admin.database().ref(`userRoles/${request.auth.uid}`).once("value");
      if (userSnap.val() !== "admin") {
        throw new HttpsError("permission-denied", "Admin role required.");
      }
    }

    const { topic, roundType, difficulty } = request.data || {};
    const questionDraft = await generateAiQuestion({
      topic: topic || "Dynamic Programming",
      roundType: roundType || "coding",
      difficulty: difficulty || "medium",
    });

    return { success: true, questionDraft };
  }
);

/**
 * Cloud Function: recalculateLeaderboardManual
 * Recalculates leaderboard for a competition.
 */
export const recalculateLeaderboardManual = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const { competitionId } = request.data || {};
    const leaderboard = await recalculateLeaderboard(competitionId || "comp-2026-spring");
    return { success: true, leaderboard };
  }
);

/**
 * Cloud Function: seedDatabase
 * Initializes default Code Battle competition structure if empty.
 */
export const seedDatabase = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const isAdmin = request.auth.token.role === "admin";
    if (!isAdmin) {
      const roleSnap = await admin.database().ref(`userRoles/${request.auth.uid}`).get();
      if (roleSnap.val() !== "admin") {
        throw new HttpsError("permission-denied", "Admin role required.");
      }
    }

    const result = await seedCompetitionData();
    return result;
  }
);
