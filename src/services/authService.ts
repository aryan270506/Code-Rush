import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
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
  ): Promise<{ user: User; otpSent: boolean; message: string }> {
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

    await setDoc(doc(db, "users", user.uid), initialProfile, { merge: true });

    // 4. Request backend Cloud Function to generate and email the 6-digit OTP
    let otpSent = false;
    let message = "Account created. Sending verification OTP...";

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
      console.warn("[AuthService] Cloud Function sendEmailOtp call issue:", err);
      // In development or when functions are deploying, notify user gracefully
      message = "Account created. Please check your email for the verification code or request a resend.";
    }

    return { user, otpSent, message };
  },

  /**
   * Verify the 6-digit Email OTP via Cloud Function
   */
  async verifyOtp(email: string, otp: string, uid: string): Promise<VerifyOtpResponse> {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please configure .env or emulators.");
    }

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
        // Refresh Firebase Auth user token & verification state
        if (auth.currentUser) {
          await auth.currentUser.reload();
          await auth.currentUser.getIdToken(true);
        }
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to verify OTP code. Please try again.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Resend 6-digit Email OTP via Cloud Function
   */
  async resendOtp(email: string, uid: string): Promise<SendOtpResponse> {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured.");
    }

    try {
      const resendOtpFn = httpsCallable<{ email: string; uid: string }, SendOtpResponse>(
        functions,
        "resendEmailOtp"
      );
      const res = await resendOtpFn({ email: email.trim(), uid });
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend OTP. Please try again shortly.";
      throw new Error(msg);
    }
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
      return null;
    } catch (err) {
      console.error("[AuthService] Error fetching user profile:", err);
      return null;
    }
  },
};
