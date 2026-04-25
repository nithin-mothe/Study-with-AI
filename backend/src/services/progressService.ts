import { FieldValue } from "firebase-admin/firestore";
import { env } from "../config/env";
import { getFirestore } from "../config/firebase";
import type { ProgressRecord } from "../types/learning";
import { calculateLevel } from "./gamificationService";

const progressCollection = "progress";
const usersCollection = "users";
const demoProgressStore = new Map<string, ProgressRecord>();

function nowIso() {
  return new Date().toISOString();
}

export async function ensureUserProfile(userId: string, email?: string, displayName?: string) {
  if (env.DEMO_MODE) return;

  const db = getFirestore();
  await db.collection(usersCollection).doc(userId).set(
    {
      email: email ?? null,
      displayName: displayName ?? null,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

export async function getUserProgress(userId: string): Promise<ProgressRecord> {
  if (env.DEMO_MODE) {
    const stored = demoProgressStore.get(userId);
    if (stored) return stored;

    const initialProgress: ProgressRecord = {
      userId,
      completedTopics: ["Learning Loops"],
      currentTopic: "Neural Networks",
      quizScores: {},
      topicPerformance: {
        "Neural Networks": {
          attempts: 4,
          correct: 3,
          totalSpeedSeconds: 42,
          lastAccuracy: 75,
          accuracyTrend: [50, 67, 75],
          currentDifficulty: "medium",
          weakCount: 1,
          updatedAt: nowIso()
        }
      },
      dailyActivity: {},
      xp: 120,
      level: "Beginner",
      lastActiveDate: new Date().toISOString().slice(0, 10),
      streakDays: 2,
      updatedAt: nowIso()
    };

    demoProgressStore.set(userId, initialProgress);
    return initialProgress;
  }

  const snapshot = await getFirestore().collection(progressCollection).doc(userId).get();

  if (!snapshot.exists) {
    return {
      userId,
      completedTopics: [],
      quizScores: {},
      topicPerformance: {},
      dailyActivity: {},
      xp: 0,
      level: "Beginner",
      streakDays: 0,
      updatedAt: nowIso()
    };
  }

  const data = snapshot.data() as Omit<ProgressRecord, "updatedAt"> & { updatedAt?: { toDate?: () => Date } };

  return {
    userId,
    completedTopics: data.completedTopics ?? [],
    currentTopic: data.currentTopic,
    quizScores: data.quizScores ?? {},
    topicPerformance: data.topicPerformance ?? {},
    dailyActivity: data.dailyActivity ?? {},
    xp: data.xp ?? 0,
    level: data.level ?? calculateLevel(data.xp ?? 0),
    lastActiveDate: data.lastActiveDate,
    streakDays: data.streakDays ?? 0,
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? nowIso()
  };
}

export async function saveUserProgress(userId: string, input: Partial<ProgressRecord>): Promise<ProgressRecord> {
  const existing = await getUserProgress(userId);
  const completedTopics = Array.from(new Set([...(existing.completedTopics ?? []), ...(input.completedTopics ?? [])]));

  if (env.DEMO_MODE) {
    const progress: ProgressRecord = {
      ...existing,
      completedTopics,
      currentTopic: input.currentTopic ?? existing.currentTopic,
      quizScores: {
        ...existing.quizScores,
        ...(input.quizScores ?? {})
      },
      topicPerformance: {
        ...existing.topicPerformance,
        ...(input.topicPerformance ?? {})
      },
      dailyActivity: {
        ...(existing.dailyActivity ?? {}),
        ...(input.dailyActivity ?? {})
      },
      xp: input.xp ?? existing.xp,
      level: input.level ?? existing.level,
      lastActiveDate: input.lastActiveDate ?? existing.lastActiveDate,
      streakDays: input.streakDays ?? existing.streakDays,
      updatedAt: nowIso()
    };

    demoProgressStore.set(userId, progress);
    return progress;
  }

  await getFirestore()
    .collection(progressCollection)
    .doc(userId)
    .set(
      {
        userId,
        completedTopics,
        currentTopic: input.currentTopic ?? existing.currentTopic ?? null,
        quizScores: {
          ...existing.quizScores,
          ...(input.quizScores ?? {})
        },
        topicPerformance: {
          ...existing.topicPerformance,
          ...(input.topicPerformance ?? {})
        },
        dailyActivity: {
          ...(existing.dailyActivity ?? {}),
          ...(input.dailyActivity ?? {})
        },
        xp: input.xp ?? existing.xp,
        level: input.level ?? existing.level,
        lastActiveDate: input.lastActiveDate ?? existing.lastActiveDate ?? null,
        streakDays: input.streakDays ?? existing.streakDays,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

  return getUserProgress(userId);
}
