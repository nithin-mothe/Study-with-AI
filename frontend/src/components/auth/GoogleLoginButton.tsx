"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/Button";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button type="button" isLoading={isLoading} onClick={handleSignIn}>
      Continue with Google
    </Button>
  );
}
