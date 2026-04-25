"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useState } from "react";
import { getDashboard } from "@/lib/api/dashboardApi";
import { useLearningStore } from "@/store/learningStore";
import type { Achievement, DashboardData } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const StatCard = memo(function StatCard({
  label,
  value,
  caption
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-primary">{caption}</p>
    </Card>
  );
});

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-72" />
      <div className="grid gap-4 md:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition duration-300 ${
        achievement.unlocked
          ? "border-success/40 bg-success/10 text-foreground"
          : "border-border bg-background/50 text-muted"
      }`}
    >
      <p className="font-semibold">{achievement.label}</p>
      <p className="mt-1 text-xs leading-5">{achievement.description}</p>
    </div>
  );
}

export function DashboardPanel() {
  const setProgress = useLearningStore((state) => state.setProgress);
  const setCurrentTopic = useLearningStore((state) => state.setCurrentTopic);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError(null);
    try {
      const result = await getDashboard();
      setDashboard(result);
      setProgress(result.progress);
      if (result.nextTopic) setCurrentTopic(result.nextTopic);
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : "Unable to load dashboard");
    }
  }, [setCurrentTopic, setProgress]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  if (!dashboard && !error) return <DashboardSkeleton />;

  if (error) {
    return (
      <Card className="text-center">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-danger">Dashboard unavailable</p>
        <h2 className="mb-3 text-3xl font-bold">We could not load your learning cockpit.</h2>
        <p className="mb-6 text-sm text-muted">{error}</p>
        <Button onClick={() => void loadDashboard()}>Try again</Button>
      </Card>
    );
  }

  if (!dashboard) return null;

  const xpTarget = dashboard.progress.level === "Titan" ? 1000 : dashboard.progress.level === "Pro" ? 1000 : dashboard.progress.level === "Intermediate" ? 500 : 180;
  const xpPercent = Math.min(Math.round((dashboard.progress.xp / xpTarget) * 100), 100);
  const dailyGoalPercent = Math.round((dashboard.dailyGoal.completedAnswers / dashboard.dailyGoal.targetAnswers) * 100);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">Demo-ready cockpit</p>
            <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Learn, adapt, and level up in one loop.</h2>
            <p className="mb-6 max-w-2xl text-sm leading-7 text-muted">
              Start with {dashboard.nextTopic ?? "a focus topic"}, complete a micro-lesson, then lock it in with an adaptive quiz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Link href="/learn">Start recommended lesson</Link>
              </Button>
              <Button variant="secondary">
                <Link href="/quiz">Take adaptive quiz</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-[2rem] border border-primary/20 bg-primary/10 p-6">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-mono text-sm text-primary">{dashboard.progress.level}</p>
              <p className="text-sm text-muted">{dashboard.progress.xp} XP</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${xpPercent}%` }} />
            </div>
            <p className="mt-3 text-xs text-muted">{xpPercent}% to next milestone</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Accuracy" value={`${dashboard.accuracy}%`} caption={`${dashboard.suggestedDifficulty} next`} />
        <StatCard label="Streak" value={`${dashboard.progress.streakDays}d`} caption="Daily momentum" />
        <StatCard label="Mastered" value={`${dashboard.strongTopics.length}`} caption={dashboard.strongTopics[0] ?? "Start today"} />
        <StatCard label="Weak areas" value={`${dashboard.weakTopics.length}`} caption={dashboard.weakTopics[0] ?? "None yet"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">Daily goal</p>
              <h3 className="mt-2 text-xl font-semibold">Answer 5 questions today</h3>
            </div>
            <p className="text-sm text-primary">
              {dashboard.dailyGoal.completedAnswers}/{dashboard.dailyGoal.targetAnswers}
            </p>
          </div>
          <div className="mb-6 h-3 overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-secondary transition-all duration-300" style={{ width: `${dailyGoalPercent}%` }} />
          </div>
          <div className="space-y-3">
            {dashboard.recommendations.map((item, index) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-background/50 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Achievements</p>
          <h3 className="mt-2 text-xl font-semibold">Badges that keep the loop sticky</h3>
          <div className="mt-5 grid gap-3">
            {dashboard.achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
