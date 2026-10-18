import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { createAndStoreOtp, validateOtp } from "./auth/emailOtp";
import { sendOtpEmail } from "./email/emailProvider";
import { assignAdminRole } from "./admin/setAdminRole";

// Initialize Firebase Admin singleton
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: sendEmailOtp
 * Generates a 6-digit secure OTP, hashes and stores it in Firestore, and sends an email via Resend.
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
          const userDoc = await admin.firestore().collection("users").doc(uid).get();
          if (userDoc.exists) {
            displayName = userDoc.data()?.displayName || displayName;
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
          const userDoc = await admin.firestore().collection("users").doc(uid).get();
          if (userDoc.exists) {
            displayName = userDoc.data()?.displayName || displayName;
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
 * 2. Updates Firestore users/{uid} with emailVerified: true, accountStatus: 'active'
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

      // If uid was provided, update Auth and Firestore
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

          // Update Firestore profile
          await admin.firestore().collection("users").doc(uid).set(
            {
              emailVerified: true,
              accountStatus: "active",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
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

    // 2. Verify caller has admin role in custom claims or Firestore
    const callerUid = request.auth.uid;
    const callerClaims = request.auth.token;
    const isCallerAdmin = callerClaims.role === "admin";

    if (!isCallerAdmin) {
      const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
      if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
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
