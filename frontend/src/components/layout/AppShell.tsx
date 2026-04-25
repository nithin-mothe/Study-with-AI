"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOutUser } from "@/lib/firebase/auth";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/quiz", label: "Quiz" }
] as const;

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-surface/70 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
        <Link href="/dashboard" className="group">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">AI Study Companion</p>
          <h1 className="text-2xl font-bold tracking-tight">Adaptive learning, one concept at a time</h1>
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <nav className="flex rounded-2xl border border-border bg-background/60 p-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground",
                  pathname === item.href && "bg-elevated text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-36 truncate text-sm text-muted sm:inline">{user?.displayName}</span>
            <Button variant="secondary" onClick={() => void signOutUser()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
