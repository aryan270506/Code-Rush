import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getFunctions,
  connectFunctionsEmulator,
  type Functions,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoPlaceholderKeyForCodeBattle00",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "code-battle-hackathon.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "code-battle-hackathon",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "code-battle-hackathon.appspot.com",
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
export const db: Firestore = getFirestore(app);
export const functions: Functions = getFunctions(app);

// Connect to Local Emulators if configured
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  const authHost = import.meta.env.VITE_EMULATOR_AUTH_HOST || "localhost:9099";
  const firestoreHost = import.meta.env.VITE_EMULATOR_FIRESTORE_HOST || "localhost:8080";
  const functionsHost = import.meta.env.VITE_EMULATOR_FUNCTIONS_HOST || "localhost:5001";

  try {
    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
    const [fsHost, fsPort] = firestoreHost.split(":");
    connectFirestoreEmulator(db, fsHost, parseInt(fsPort, 10));
    const [fnHost, fnPort] = functionsHost.split(":");
    connectFunctionsEmulator(functions, fnHost, parseInt(fnPort, 10));
    console.info("[Firebase] Connected to local Firebase Emulators");
  } catch (err) {
    console.warn("[Firebase] Emulator connection warning:", err);
  }
}

export default app;
