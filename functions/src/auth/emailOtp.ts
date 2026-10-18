import * as crypto from "crypto";
import * as admin from "firebase-admin";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5; // Lockout after 5 failed attempts

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 * Uses crypto.randomInt (Node.js CSPRNG) - NEVER Math.random().
 */
export function generateSecureOTP(): string {
  const code = crypto.randomInt(100000, 1000000);
  return code.toString();
}

/**
 * Computes a secure SHA-256 hash of the OTP and email
 */
export function hashOtp(otp: string, email: string): string {
  const salt = process.env.OTP_SALT || "code_battle_secure_salt_2026";
  return crypto.createHmac("sha256", salt).update(`${email.toLowerCase()}:${otp}`).digest("hex");
}

/**
 * Generates a consistent key for an email
 */
export function getEmailHash(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

export interface StoredOtpRecord {
  emailHash: string;
  hashedOtp: string;
  uid: string;
  expiresAt: number;
  attempts: number;
  lastRequestedAt: number;
}

/**
 * Creates and stores a new OTP record in Realtime Database with TTL and cooldown tracking
 */
export async function createAndStoreOtp(
  email: string,
  uid: string
): Promise<{ otp: string; cooldownSeconds: number }> {
  const rtdb = admin.database();
  const emailHash = getEmailHash(email);
  const otpRef = rtdb.ref(`_email_otps/${emailHash}`);

  // Check cooldown
  const existingSnap = await otpRef.get();
  const now = Date.now();

  if (existingSnap.exists()) {
    const data = existingSnap.val() as StoredOtpRecord;
    const lastReq = data.lastRequestedAt || 0;
    const diff = now - lastReq;

    if (diff < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - diff) / 1000);
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new code.`);
    }
  }

  // Generate cryptographically secure OTP
  const otp = generateSecureOTP();
  const hashedOtp = hashOtp(otp, email);

  const expiresAt = now + OTP_EXPIRY_MS;
  const lastRequestedAt = now;

  const record: StoredOtpRecord = {
    emailHash,
    hashedOtp,
    uid,
    expiresAt,
    attempts: 0,
    lastRequestedAt,
  };

  await otpRef.set(record);
  return { otp, cooldownSeconds: 60 };
}

/**
 * Validates a submitted OTP against the stored hash in Realtime Database
 */
export async function validateOtp(
  email: string,
  submittedOtp: string
): Promise<{ valid: boolean; error?: string }> {
  const rtdb = admin.database();
  const emailHash = getEmailHash(email);
  const otpRef = rtdb.ref(`_email_otps/${emailHash}`);

  const snap = await otpRef.get();
  if (!snap.exists()) {
    return { valid: false, error: "No active verification code found. Please request a new one." };
  }

  const record = snap.val() as StoredOtpRecord;
  const now = Date.now();

  // 1. Check expiration
  if (now > record.expiresAt) {
    await otpRef.remove();
    return { valid: false, error: "Verification code has expired. Please request a new one." };
  }

  // 2. Check maximum attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    await otpRef.remove();
    return {
      valid: false,
      error: "Too many failed attempts. For your security, this code was invalidated. Please request a new one.",
    };
  }

  // 3. Compare hash
  const computedHash = hashOtp(submittedOtp, email);
  if (computedHash !== record.hashedOtp) {
    // Increment attempts
    const newAttempts = (record.attempts || 0) + 1;
    await otpRef.update({ attempts: newAttempts });
    const remaining = MAX_ATTEMPTS - newAttempts;
    return {
      valid: false,
      error: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // 4. Valid! Single-use: delete record
  await otpRef.remove();
  return { valid: true };
}
