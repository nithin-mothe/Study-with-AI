"use client";

import type { ReactNode } from "react";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { useUserStore } from "@/store/userStore";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useUserStore((state) => state.user);
  const isAuthReady = useUserStore((state) => state.isAuthReady);

  if (!isAuthReady) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Loader label="Preparing your study room" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">AI Study Companion</p>
          <h1 className="mb-3 text-3xl font-bold">Your adaptive learning cockpit</h1>
          <p className="mb-6 text-sm leading-6 text-muted">
            Sign in to generate explanations, take adaptive quizzes, and keep progress synced across sessions.
          </p>
          <GoogleLoginButton />
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
