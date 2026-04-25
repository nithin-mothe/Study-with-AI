import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-lg text-center">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-secondary">404</p>
        <h1 className="mb-3 text-3xl font-bold">This study path does not exist.</h1>
        <p className="mb-6 text-sm text-muted">Head back to your dashboard and keep the momentum going.</p>
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/70"
        >
          Return to dashboard
        </Link>
      </Card>
    </main>
  );
}
