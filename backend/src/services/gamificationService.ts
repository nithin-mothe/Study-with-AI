import type { LearnerLevel, ProgressRecord } from "../types/learning";

const correctAnswerXp = 10;
const streakBonusXp = 5;

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getYesterdayKey(date: Date) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return toDateKey(yesterday);
}

export function calculateLevel(xp: number): LearnerLevel {
  if (xp >= 1000) return "Titan";
  if (xp >= 500) return "Pro";
  if (xp >= 180) return "Intermediate";
  return "Beginner";
}

export function calculateStreak(previousActiveDate: string | undefined, currentStreak: number) {
  const today = new Date();
  const todayKey = toDateKey(today);
  const yesterdayKey = getYesterdayKey(today);

  if (previousActiveDate === todayKey) {
    return { streakDays: currentStreak, lastActiveDate: todayKey, streakBonusAwarded: 0 };
  }

  if (previousActiveDate === yesterdayKey) {
    return { streakDays: currentStreak + 1, lastActiveDate: todayKey, streakBonusAwarded: streakBonusXp };
  }

  return { streakDays: 1, lastActiveDate: todayKey, streakBonusAwarded: 0 };
}

export function awardAnswerXp(progress: ProgressRecord, isCorrect: boolean) {
  const streak = calculateStreak(progress.lastActiveDate, progress.streakDays);
  const xpAwarded = isCorrect ? correctAnswerXp : 0;
  const nextXp = progress.xp + xpAwarded + streak.streakBonusAwarded;

  return {
    xpAwarded,
    streakBonusAwarded: streak.streakBonusAwarded,
    xp: nextXp,
    level: calculateLevel(nextXp),
    streakDays: streak.streakDays,
    lastActiveDate: streak.lastActiveDate
  };
}
