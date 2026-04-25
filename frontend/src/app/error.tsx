"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background p-6 text-foreground">
        <main className="flex min-h-screen items-center justify-center">
          <Card className="max-w-lg">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-danger">Application error</p>
            <h1 className="mb-3 text-3xl font-bold">Something interrupted the learning session.</h1>
            <p className="mb-6 text-sm text-muted">{error.message}</p>
            <Button onClick={reset}>Try again</Button>
          </Card>
        </main>
      </body>
    </html>
  );
}
