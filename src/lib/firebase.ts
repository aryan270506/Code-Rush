import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getFunctions,
  connectFunctionsEmulator,
  type Functions,
} from "firebase/functions";
import {
  getDatabase,
  connectDatabaseEmulator,
  type Database,
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoPlaceholderKeyForCodeBattle00",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "code-rush-ca3dd.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID || "code-rush-ca3dd"}-default-rtdb.firebaseio.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "code-rush-ca3dd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "code-rush-ca3dd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check whether real Firebase credentials are provided
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes("your_firebase_api_key") &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes("DemoPlaceholder")
);

// Initialize Firebase App singleton
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

// Initialize Firestore with auto-detect long polling to prevent ERR_BLOCKED_BY_CLIENT
// caused by browser ad-blockers and privacy shields blocking WebChannel streams
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
} catch {
  firestoreInstance = getFirestore(app);
}
export const db: Firestore = firestoreInstance;

export const functions: Functions = getFunctions(app);
export const rtdb: Database = getDatabase(app);

// Connect to Local Emulators if configured
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  const authHost = import.meta.env.VITE_EMULATOR_AUTH_HOST || "localhost:9099";
  const firestoreHost = import.meta.env.VITE_EMULATOR_FIRESTORE_HOST || "localhost:8080";
  const functionsHost = import.meta.env.VITE_EMULATOR_FUNCTIONS_HOST || "localhost:5001";
  const rtdbHost = import.meta.env.VITE_EMULATOR_RTDB_HOST || "localhost:9000";

  try {
    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
    const [fsHost, fsPort] = firestoreHost.split(":");
    connectFirestoreEmulator(db, fsHost, parseInt(fsPort, 10));
    const [fnHost, fnPort] = functionsHost.split(":");
    connectFunctionsEmulator(functions, fnHost, parseInt(fnPort, 10));
    const [dbHost, dbPort] = rtdbHost.split(":");
    connectDatabaseEmulator(rtdb, dbHost, parseInt(dbPort, 10));
    console.info("[Firebase] Connected to local Firebase Emulators");
  } catch (err) {
    console.warn("[Firebase] Emulator connection warning:", err);
  }
}

export default app;
