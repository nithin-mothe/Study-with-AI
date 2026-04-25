"use client";

import { useEffect } from "react";
import { observeAuthState } from "@/lib/firebase/auth";
import { useUserStore } from "@/store/userStore";
import { isDemoMode } from "@/utils/env";

export function useAuth() {
  const { user, isAuthReady, setUser, setAuthReady } = useUserStore();

  useEffect(() => {
    if (isDemoMode) {
      setUser({
        id: "demo-user",
        displayName: "Demo Learner",
        email: "demo@aistudycompanion.local"
      });
      setAuthReady(true);
      return undefined;
    }

    const unsubscribe = observeAuthState((firebaseUser) => {
      setUser(
        firebaseUser
          ? {
              id: firebaseUser.uid,
              displayName: firebaseUser.displayName ?? "Learner",
              email: firebaseUser.email ?? "",
              photoURL: firebaseUser.photoURL ?? undefined
            }
          : null
      );
      setAuthReady(true);
    });

    return unsubscribe;
  }, [setAuthReady, setUser]);

  return { user, isAuthReady, isAuthenticated: Boolean(user) };
}
