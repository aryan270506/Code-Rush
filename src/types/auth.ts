export type UserRole = "participant" | "admin";

export type AccountStatus = "pending_verification" | "active" | "suspended";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  emailVerified: boolean;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordStrength {
  score: number; // 0 - 4
  feedback: string[];
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
  devOtp?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  verified: boolean;
}
