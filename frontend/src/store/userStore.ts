import { create } from "zustand";
import type { UserProfile } from "@/types";

interface UserState {
  user: UserProfile | null;
  isAuthReady: boolean;
  setUser: (user: UserProfile | null) => void;
  setAuthReady: (isAuthReady: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthReady: false,
  setUser: (user) => set({ user }),
  setAuthReady: (isAuthReady) => set({ isAuthReady })
}));
