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

export const DEMO_CREDENTIALS = {
  participant: {
    email: "participant@codebattle.dev",
    password: "Password@123",
    displayName: "Alex Rivera (Demo Participant)",
    role: "participant" as const,
  },
  admin: {
    email: "admin@codebattle.dev",
    password: "AdminPassword@123",
    displayName: "Code Battle Administrator",
    role: "admin" as const,
  },
};

export interface SeededParticipantCredential {
  databaseId: string;
  name: string;
  email: string;
  username: string;
  password: string;
  institution: string;
  department: string;
  academicYear: number;
  scores: Record<string, number>;
  qualification: Record<string, "qualified" | "not_qualified">;
}

export const SEEDED_PARTICIPANTS: SeededParticipantCredential[] = [
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
];

export const authService = {
  /**
   * Log in participant or administrator
   */
  async login(email: string, password: string): Promise<{ user: User; profile: UserProfile | null }> {
    const cleanIdentifier = email.trim().toLowerCase();

    // Check if logging in with demo credentials
    const isDemoAdmin =
      cleanIdentifier === DEMO_CREDENTIALS.admin.email.toLowerCase() &&
      password === DEMO_CREDENTIALS.admin.password;
    const isDemoParticipant =
      cleanIdentifier === DEMO_CREDENTIALS.participant.email.toLowerCase() &&
      password === DEMO_CREDENTIALS.participant.password;

    if (isDemoAdmin || isDemoParticipant) {
      const isAdm = isDemoAdmin;
      const demoUser = {
        uid: isAdm ? "demo-admin-uid" : "demo-participant-uid",
        email: cleanIdentifier,
        displayName: isAdm ? DEMO_CREDENTIALS.admin.displayName : DEMO_CREDENTIALS.participant.displayName,
        emailVerified: true,
        reload: async () => {},
        getIdToken: async () => "demo-token",
      } as unknown as User;

      const demoProfile: UserProfile = {
        uid: demoUser.uid,
        email: cleanIdentifier,
        displayName: demoUser.displayName || "",
        role: isAdm ? "admin" : "participant",
        emailVerified: true,
        accountStatus: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sessionStorage.setItem("cb_demo_user", JSON.stringify({ user: demoUser, profile: demoProfile }));
      sessionStorage.setItem("cb_verified_" + demoUser.uid, "true");
      sessionStorage.setItem("cb_verified_" + cleanIdentifier, "true");

      return { user: demoUser, profile: demoProfile };
    }

    // Check if logging in with seeded participant credentials
    const seeded = SEEDED_PARTICIPANTS.find(
      (p) =>
        p.email.toLowerCase() === cleanIdentifier ||
        p.username.toLowerCase() === cleanIdentifier
    );

    if (seeded) {
      if (seeded.password !== password) {
        throw new Error("Invalid password for seeded participant account.");
      }

      const seedUser = {
        uid: seeded.databaseId,
        email: seeded.email,
        displayName: seeded.name,
        emailVerified: true,
        reload: async () => {},
        getIdToken: async () => "seed-token-" + seeded.databaseId,
      } as unknown as User;

      const seedProfile: UserProfile = {
        uid: seeded.databaseId,
        email: seeded.email,
        displayName: seeded.name,
        institution: seeded.institution,
        department: seeded.department,
        academicYear: seeded.academicYear,
        role: "participant",
        emailVerified: true,
        accountStatus: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sessionStorage.setItem("cb_demo_user", JSON.stringify({ user: seedUser, profile: seedProfile }));
      sessionStorage.setItem("cb_verified_" + seedUser.uid, "true");
      sessionStorage.setItem("cb_verified_" + seeded.email.toLowerCase(), "true");
      sessionStorage.setItem("cb_verified_" + seeded.username.toLowerCase(), "true");

      return { user: seedUser, profile: seedProfile };
    }

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
    sessionStorage.removeItem("cb_demo_user");
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
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
