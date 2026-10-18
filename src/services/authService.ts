import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  confirmPasswordReset as fbConfirmPasswordReset,
  verifyPasswordResetCode as fbVerifyPasswordResetCode,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions, isFirebaseConfigured } from "../lib/firebase";
import type { UserProfile, SendOtpResponse, VerifyOtpResponse } from "../types/auth";

/**
 * Generates a cryptographically secure 6-digit numeric OTP in the browser.
 */
function generateLocalSecureOtp(): string {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const code = (100000 + (array[0] % 900000)).toString();
  return code;
}

const DEV_OTP_STORAGE_PREFIX = "cb_dev_otp_";

export const authService = {
  /**
   * Log in participant or administrator
   */
  async login(email: string, password: string): Promise<{ user: User; profile: UserProfile | null }> {
    if (!isFirebaseConfigured) {
      throw new Error(
        "Firebase is not configured. Please add your credentials in .env (see .env.example) or start Firebase Emulators."
      );
    }

    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = credential.user;

    // Fetch trusted user profile from Firestore
    const profile = await this.getUserProfile(user.uid);
    return { user, profile };
  },

  /**
   * Register a new participant.
   * Public registration always assigns the "participant" role.
   */
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ user: User; otpSent: boolean; message: string; devOtp?: string }> {
    if (!isFirebaseConfigured) {
      throw new Error(
        "Firebase is not configured. Please add your credentials in .env (see .env.example) or start Firebase Emulators."
      );
    }

    // 1. Create Firebase Auth user
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = credential.user;

    // 2. Set display name in Auth
    await updateProfile(user, { displayName: displayName.trim() });

    // 3. Create initial profile in Firestore with role "participant" and unverified status
    const initialProfile: Record<string, unknown> = {
      uid: user.uid,
      email: user.email,
      displayName: displayName.trim(),
      role: "participant", // Strictly enforced participant role
      emailVerified: false,
      accountStatus: "pending_verification",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "users", user.uid), initialProfile, { merge: true });
    } catch (fsErr) {
      console.warn("[AuthService] Firestore initial profile write warning:", fsErr);
    }

    // 4. Request backend Cloud Function or local fallback
    let otpSent = false;
    let message = "Account created. Sending verification OTP...";
    let devOtp: string | undefined = undefined;

    try {
      const sendOtpFn = httpsCallable<{ email: string; uid: string }, SendOtpResponse>(
        functions,
        "sendEmailOtp"
      );
      const res = await sendOtpFn({ email: user.email!, uid: user.uid });
      if (res.data?.success) {
        otpSent = true;
        message = res.data.message || "A 6-digit verification code has been sent to your email.";
      }
    } catch (err: unknown) {
      console.warn("[AuthService] Cloud Function sendEmailOtp unavailable. Activating development fallback:", err);

      // Cloud Functions not yet deployed: generate secure OTP and activate fallback
      devOtp = generateLocalSecureOtp();
      const storageKey = DEV_OTP_STORAGE_PREFIX + user.email!.toLowerCase().trim();
      const payload = {
        otp: devOtp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(payload));

      // Also trigger Firebase Auth's built-in email verification as backup
      try {
        await sendEmailVerification(user);
      } catch (emailErr) {
        console.warn("[AuthService] Native Firebase verification email warning:", emailErr);
      }

      console.info(
        `%c[Code Battle] 🔑 Your 6-digit verification OTP is: %c${devOtp}`,
        "color: #a78bfa; font-weight: bold;",
        "color: #06b6d4; font-size: 18px; font-weight: bold; background: #10102a; padding: 4px 8px; border-radius: 6px;"
      );

      otpSent = true;
      message = "Account created! Use the 6-digit code shown on screen to verify.";
    }

    return { user, otpSent, message, devOtp };
  },

  /**
   * Verify the 6-digit Email OTP via Cloud Function or fallback
   */
  async verifyOtp(email: string, otp: string, uid: string): Promise<VerifyOtpResponse> {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please configure .env or emulators.");
    }

    // 1. Try Cloud Function if deployed
    try {
      const verifyOtpFn = httpsCallable<
        { email: string; otp: string; uid: string },
        VerifyOtpResponse
      >(functions, "verifyEmailOtp");

      const response = await verifyOtpFn({
        email: email.trim(),
        otp: otp.trim(),
        uid,
      });

      if (response.data.verified) {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          await auth.currentUser.getIdToken(true);
        }
        return response.data;
      }
    } catch (fnErr: unknown) {
      console.warn("[AuthService] Cloud Function verifyEmailOtp error/unavailable. Testing local verification:", fnErr);
    }

    // 2. Development fallback verification
    const storageKey = DEV_OTP_STORAGE_PREFIX + email.toLowerCase().trim();
    const storedRaw = sessionStorage.getItem(storageKey);

    if (storedRaw) {
      try {
        const stored = JSON.parse(storedRaw);
        if (Date.now() > stored.expiresAt) {
          sessionStorage.removeItem(storageKey);
          throw new Error("Verification code has expired. Please request a new one.");
        }

        if (stored.attempts >= 5) {
          sessionStorage.removeItem(storageKey);
          throw new Error("Too many failed attempts. Code has been invalidated. Please request a new one.");
        }

        if (stored.otp !== otp.trim()) {
          stored.attempts += 1;
          sessionStorage.setItem(storageKey, JSON.stringify(stored));
          const remaining = 5 - stored.attempts;
          throw new Error(`Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
        }

        // Verified successfully!
        sessionStorage.removeItem(storageKey);
        if (uid) {
          sessionStorage.setItem("cb_verified_" + uid, "true");
        }
        sessionStorage.setItem("cb_verified_" + email.toLowerCase().trim(), "true");

        // Update Firestore profile
        if (uid) {
          try {
            await setDoc(
              doc(db, "users", uid),
              {
                emailVerified: true,
                accountStatus: "active",
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (updateErr) {
            console.warn("[AuthService] Firestore profile update warning:", updateErr);
          }
        }

        return {
          success: true,
          verified: true,
          message: "Email successfully verified. Your account is active.",
        };
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw err;
        }
      }
    }

    throw new Error("Invalid verification code. Please check your code or request a resend.");
  },

  /**
   * Resend 6-digit Email OTP via Cloud Function or fallback
   */
  async resendOtp(email: string, uid: string): Promise<SendOtpResponse> {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured.");
    }

    // 1. Try Cloud Function
    try {
      const resendOtpFn = httpsCallable<{ email: string; uid: string }, SendOtpResponse>(
        functions,
        "resendEmailOtp"
      );
      const res = await resendOtpFn({ email: email.trim(), uid });
      return res.data;
    } catch (err: unknown) {
      console.warn("[AuthService] Cloud Function resendEmailOtp unavailable, using dev generator:", err);
    }

    // 2. Development fallback resend
    const newOtp = generateLocalSecureOtp();
    const storageKey = DEV_OTP_STORAGE_PREFIX + email.toLowerCase().trim();
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        otp: newOtp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
      })
    );

    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch {
        // ignore
      }
    }

    console.info(
      `%c[Code Battle] 🔑 Your new 6-digit verification OTP is: %c${newOtp}`,
      "color: #a78bfa; font-weight: bold;",
      "color: #06b6d4; font-size: 18px; font-weight: bold; background: #10102a; padding: 4px 8px; border-radius: 6px;"
    );

    return {
      success: true,
      message: "A new 6-digit code has been generated.",
      cooldownSeconds: 60,
      devOtp: newOtp,
    };
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured.");
    }
    await sendPasswordResetEmail(auth, email.trim());
  },

  /**
   * Verify password reset oobCode
   */
  async verifyPasswordResetCode(code: string): Promise<string> {
    return await fbVerifyPasswordResetCode(auth, code);
  },

  /**
   * Confirm password reset with new password
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    await fbConfirmPasswordReset(auth, code, newPassword);
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Fetch Firestore user profile document
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (err) {
      console.warn("[AuthService] Firestore profile read permission/network notice:", err);
    }

    const cur = auth.currentUser;
    const isLocalVerified =
      sessionStorage.getItem("cb_verified_" + uid) === "true" ||
      (cur?.email && sessionStorage.getItem("cb_verified_" + cur.email.toLowerCase().trim()) === "true");

    return {
      uid,
      email: cur?.email || "",
      displayName: cur?.displayName || "Participant",
      role: "participant",
      emailVerified: Boolean(cur?.emailVerified || isLocalVerified),
      accountStatus: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
