import React, { createContext, useContext, useEffect, useState } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { authService, DEMO_CREDENTIALS } from "../services/authService";
import type { UserProfile, UserRole } from "../types/auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<{ user: User; profile: UserProfile | null }>;
  loginDemo: (role: "admin" | "participant") => { user: User; profile: UserProfile };
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const demoRaw = sessionStorage.getItem("cb_demo_user");
    if (demoRaw) {
      try {
        return JSON.parse(demoRaw).user;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const demoRaw = sessionStorage.getItem("cb_demo_user");
    if (demoRaw) {
      try {
        return JSON.parse(demoRaw).profile;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // If a demo user session is currently active, prioritize it
      const demoRaw = sessionStorage.getItem("cb_demo_user");
      if (demoRaw && (!firebaseUser || firebaseUser.email?.includes("codebattle.dev"))) {
        try {
          const parsed = JSON.parse(demoRaw);
          setUser(parsed.user);
          setProfile(parsed.profile);
          setLoading(false);
          return;
        } catch {
          // ignore
        }
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        // Real-time listener for Firestore user profile updates
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          unsubscribeSnapshot = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const profileData = docSnap.data() as UserProfile;
                setProfile(profileData);
              } else {
                const isLocalVerified =
                  sessionStorage.getItem("cb_verified_" + firebaseUser.uid) === "true";
                setProfile({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  displayName: firebaseUser.displayName || "Participant",
                  role: "participant",
                  emailVerified: firebaseUser.emailVerified || isLocalVerified,
                  accountStatus: "active",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
              setLoading(false);
            },
            (error) => {
              console.warn(
                "[AuthContext] Firestore permission notice: Using local security profile fallback.",
                error
              );
              const isLocalVerified =
                sessionStorage.getItem("cb_verified_" + firebaseUser.uid) === "true";
              setProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "Participant",
                role: "participant",
                emailVerified: firebaseUser.emailVerified || isLocalVerified,
                accountStatus: "active",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              setLoading(false);
            }
          );
        } catch (err) {
          console.warn("[AuthContext] Firestore listen error, using session state:", err);
          const isLocalVerified =
            sessionStorage.getItem("cb_verified_" + firebaseUser.uid) === "true";
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "Participant",
            role: "participant",
            emailVerified: firebaseUser.emailVerified || isLocalVerified,
            accountStatus: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setLoading(false);
        }
      } else {
        const storedDemo = sessionStorage.getItem("cb_demo_user");
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo);
            setUser(parsed.user);
            setProfile(parsed.profile);
            setLoading(false);
            return;
          } catch {
            // ignore
          }
        }
        setProfile(null);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    setProfile(res.profile);
    return res;
  };

  const loginDemo = (targetRole: "admin" | "participant") => {
    const isAdm = targetRole === "admin";
    const creds = isAdm ? DEMO_CREDENTIALS.admin : DEMO_CREDENTIALS.participant;
    const uid = isAdm ? "demo-admin-uid" : "demo-participant-uid";

    const demoUser = {
      uid,
      email: creds.email,
      displayName: creds.displayName,
      emailVerified: true,
      reload: async () => {},
      getIdToken: async () => "demo-token",
    } as unknown as User;

    const demoProfile: UserProfile = {
      uid,
      email: creds.email,
      displayName: creds.displayName,
      role: targetRole,
      emailVerified: true,
      accountStatus: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sessionStorage.setItem("cb_demo_user", JSON.stringify({ user: demoUser, profile: demoProfile }));
    sessionStorage.setItem("cb_verified_" + uid, "true");
    sessionStorage.setItem("cb_verified_" + creds.email.toLowerCase(), "true");

    setUser(demoUser);
    setProfile(demoProfile);
    setLoading(false);

    return { user: demoUser, profile: demoProfile };
  };

  const refreshProfile = async () => {
    if (user) {
      if (user.uid?.startsWith("demo-")) return;
      await user.reload();
      setUser({ ...user });
      const p = await authService.getUserProfile(user.uid);
      if (p) {
        setProfile(p);
      } else {
        const isLocalVerified = sessionStorage.getItem("cb_verified_" + user.uid) === "true";
        setProfile((prev) => ({
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "Participant",
          role: prev?.role || "participant",
          emailVerified: user.emailVerified || isLocalVerified,
          accountStatus: "active",
          createdAt: prev?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
    }
  };

  const logout = async () => {
    sessionStorage.removeItem("cb_demo_user");
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const isDemoUser = Boolean(
    user?.uid?.startsWith("demo-") ||
      user?.email?.toLowerCase().includes("codebattle.dev") ||
      profile?.uid?.startsWith("demo-")
  );

  const isEmailVerified = Boolean(
    isDemoUser ||
      user?.emailVerified ||
      profile?.emailVerified ||
      (user && sessionStorage.getItem("cb_verified_" + user.uid) === "true") ||
      (user?.email && sessionStorage.getItem("cb_verified_" + user.email.toLowerCase().trim()) === "true")
  );

  const role: UserRole | null = profile?.role || (user ? "participant" : null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role,
        isEmailVerified,
        login,
        loginDemo,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
