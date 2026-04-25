"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useAuth();
  return <>{children}</>;
}
