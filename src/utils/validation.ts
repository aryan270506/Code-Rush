import type { PasswordStrength } from "../types/auth";

export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return "Email address is required.";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Please enter a valid email address (e.g., alex@example.com).";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  return null;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteria = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar];
  const passedCount = criteria.filter(Boolean).length;

  let score = 0;
  if (password.length > 0) {
    if (passedCount <= 2) score = 1;
    else if (passedCount === 3) score = 2;
    else if (passedCount === 4) score = 3;
    else if (passedCount === 5) score = 4;
  }

  const feedback: string[] = [];
  if (!hasMinLength) feedback.push("At least 8 characters");
  if (!hasUppercase) feedback.push("One uppercase letter");
  if (!hasLowercase) feedback.push("One lowercase letter");
  if (!hasNumber) feedback.push("One number");
  if (!hasSpecialChar) feedback.push("One special character (!@#$%^&*)");

  return {
    score,
    feedback,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };
}

export function validateRegistration(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  agreeTerms: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!fullName || fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!agreeTerms) {
    errors.agreeTerms = "You must agree to the competition terms and privacy policy.";
  }

  return errors;
}
