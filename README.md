# Code Battle — Online Hackathon Portal

A modern, high-performance competitive programming and online hackathon platform built with React, Vite, TypeScript, Tailwind CSS, Framer Motion, and Firebase.

---

## ⚡ Features

- **Futuristic Competition Landing Page**:
  - Dark competition theme (`#06060f` near-black, electric violet `#7c3aed`, and cyan `#06b6d4`).
  - Interactive CSS-built code editor with syntax highlighting and animated stat badges.
  - 10 responsive sections: Navbar, Hero, Stats, 4 Competition Rounds, How It Works, Leaderboard, Benefits, Rules, Final CTA, and Footer.
  - Framer Motion scroll entrance animations with reduced-motion accessibility support.

- **Complete Authentication Flow**:
  - **Login (`/login`)**: Email & password authentication with Firebase Auth, role-based redirection, and error handling.
  - **Participant Registration (`/signup`)**: Public signup strictly creates **participants only**. Enforces password complexity, terms acceptance, and triggers a 6-digit email OTP.
  - **6-Digit Email OTP Verification (`/verify-email`)**:
    - 6 individual numeric inputs with auto-focus, backspace navigation, and full clipboard paste support.
    - Cryptographically secure CSPRNG OTP generation via Firebase Cloud Functions.
    - 5-minute expiration countdown & 60-second rate-limited resend cooldown.
    - Single-use and HMAC-SHA256 hashed storage (anti-tamper).
  - **Forgot Password (`/forgot-password`)**: Rate-limited password reset dispatch with email enumeration protection.
  - **Reset Password (`/reset-password`)**: Token validation, password strength validation, and secure password update.
  - **Access Denied (`/unauthorized`)**: Clean security boundary with role-based feedback.
  - **Protected Dashboards**:
    - `/participant/dashboard` — Verified participants only.
    - `/admin/dashboard` — Verified administrators only.

- **Defense-in-Depth Security**:
  - `firestore.rules`: Prevents users from modifying their own roles, email verification status, or account status via client SDK.
  - Firebase Custom Claims (`role: 'admin' | 'participant'`).
  - Strict server-side verification using Firebase Admin SDK in Cloud Functions.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Cloud Functions dependencies
cd functions && npm install && cd ..
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your Firebase credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=code-battle-hackathon.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=code-battle-hackathon
VITE_FIREBASE_STORAGE_BUCKET=code-battle-hackathon.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
```

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) (or the port shown in terminal).

---

## 🛠️ Firebase & Backend Configuration

### A. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Authentication** -> **Sign-in method**, enable **Email/Password**.
3. In **Firestore Database**, create a database in production mode.
4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### B. Transactional Email Provider (Resend)

For live 6-digit OTP email delivery:
1. Create a free account at [Resend](https://resend.com) and verify your sending domain.
2. Configure your Resend secret in Firebase Cloud Functions:
   ```bash
   firebase functions:secrets:set RESEND_API_KEY
   ```
3. Set your verified sender address in `functions/.env` or runtime environment:
   ```env
   EMAIL_FROM=Code Battle <no-reply@yourdomain.com>
   ```

*(Note: In local development or emulator mode without an API key, the function logs a clear developer notice to the console and safely completes).*

### C. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

Functions deployed:
- `sendEmailOtp`: Generates cryptographic 6-digit OTP, hashes it, stores in `_email_otps`, and emails via Resend.
- `verifyEmailOtp`: Validates OTP against hash, updates Auth `emailVerified: true`, and activates user in Firestore.
- `resendEmailOtp`: Rate-limited OTP resend with 60s cooldown.
- `setAdminRole`: Trusted function to grant administrative privileges.

---

## 🛡️ Administrator Provisioning

Public registration **never** grants administrator privileges. To provision an administrator account:

### Method 1: Using the Backend Provisioning CLI

Run the included backend provisioning script with the target user's email or UID:

```bash
cd functions
npx ts-node src/admin/setAdminRole.ts admin@codebattle.dev
```

### Method 2: Calling the `setAdminRole` Cloud Function

Authenticated root administrators can elevate other users directly via the callable function:

```ts
import { httpsCallable } from "firebase/functions";
import { functions } from "./lib/firebase";

const setAdmin = httpsCallable(functions, "setAdminRole");
await setAdmin({ targetEmailOrUid: "organizer@codebattle.dev" });
```

---

## 🧪 Verification & Testing Checklist

- [x] **Participant Registration**: Validates required fields, password complexity, and registers user with `role: "participant"` and `emailVerified: false`.
- [x] **OTP Generation**: Generates 6-digit CSPRNG code with 5-minute TTL and SHA-256 HMAC hash.
- [x] **Rate Limiting**: 60-second cooldown on resends; 5 failed attempt limit before lockout.
- [x] **OTP Verification**: Verifies submitted code, updates Firebase Auth `emailVerified` to `true`, and updates Firestore status to `active`.
- [x] **Invalid / Expired Codes**: Rejects wrong codes, increments failure count, and prompts for new code upon expiry.
- [x] **Login Flow**: Authenticates via Firebase, verifies email verification status, and redirects participants to `/participant/dashboard` and admins to `/admin/dashboard`.
- [x] **Password Reset**: Forgot password flow prevents email enumeration and supports secure token reset.
- [x] **Role Protection**: Participants cannot modify their role in Firestore or access `/admin/dashboard`. Unauthorized users are routed to `/unauthorized`.
- [x] **Landing Page Integrity**: All original 10 sections preserved with updated navigation to `/login` and `/signup`.
- [x] **Production Build**: Zero TypeScript errors, Vite production bundle builds cleanly.
