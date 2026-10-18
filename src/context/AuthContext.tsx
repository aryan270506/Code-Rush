import React, { createContext, useContext, useEffect, useState } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { authService } from "../services/authService";
import type { UserProfile, UserRole } from "../types/auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  isEmailVerified: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
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
                // Document not yet created or permission denied fallback
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

  const refreshProfile = async () => {
    if (user) {
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
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const isEmailVerified = Boolean(
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
