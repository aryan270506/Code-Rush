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
                setProfile(null);
              }
              setLoading(false);
            },
            (error) => {
              console.warn("[AuthContext] Profile snapshot error:", error);
              setLoading(false);
            }
          );
        } catch (err) {
          console.error("[AuthContext] Firestore attach error:", err);
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
      setProfile(p);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const isEmailVerified = Boolean(user?.emailVerified || profile?.emailVerified);
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
