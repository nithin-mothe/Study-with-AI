import { randomUUID } from "crypto";
import { generateConceptExplanation, generateMicroLearningSteps } from "./groqService";
import { getUserProgress, saveUserProgress } from "./progressService";
import type { ConceptLevel, LearningSession, QuizDifficulty } from "../types/learning";

function difficultyFromAccuracy(accuracy: number): QuizDifficulty {
  if (accuracy < 50) return "easy";
  if (accuracy > 80) return "hard";
  return "medium";
}

function conceptLevelFromAccuracy(accuracy: number): ConceptLevel {
  if (accuracy < 50) return "beginner";
  if (accuracy > 80) return "advanced";
  return "intermediate";
}

export async function startLearningSession(
  userId: string,
  topic: string,
  requestedLevel?: ConceptLevel
): Promise<LearningSession> {
  const progress = await getUserProgress(userId);
  const performance = progress.topicPerformance[topic];
  const level = requestedLevel ?? conceptLevelFromAccuracy(performance?.lastAccuracy ?? 0);
  const difficulty = difficultyFromAccuracy(performance?.lastAccuracy ?? 0);
  const [explanation, steps] = await Promise.all([
    generateConceptExplanation(topic, level),
    generateMicroLearningSteps(topic)
  ]);

  await saveUserProgress(userId, {
    currentTopic: topic,
    topicPerformance: progress.topicPerformance
  });

  return {
    sessionId: randomUUID(),
    topic,
    level,
    difficulty,
    currentStepIndex: 0,
    explanation,
    steps,
    createdAt: new Date().toISOString()
  };
}

export async function completeLearningStep(params: {
  userId: string;
  topic: string;
  completedStepId: string;
  currentStepIndex: number;
  speedSeconds: number;
}) {
  const progress = await getUserProgress(params.userId);
  const existing = progress.topicPerformance[params.topic] ?? {
    attempts: 0,
    correct: 0,
    totalSpeedSeconds: 0,
    lastAccuracy: 0,
    accuracyTrend: [],
    currentDifficulty: "easy" as const,
    weakCount: 0,
    updatedAt: new Date().toISOString()
  };

  const updatedPerformance = {
    ...existing,
    totalSpeedSeconds: existing.totalSpeedSeconds + params.speedSeconds,
    updatedAt: new Date().toISOString()
  };

  const updatedProgress = await saveUserProgress(params.userId, {
    currentTopic: params.topic,
    completedTopics: [params.topic],
    topicPerformance: {
      ...progress.topicPerformance,
      [params.topic]: updatedPerformance
    }
  });

  const nextStepIndex = params.currentStepIndex + 1;

  return {
    completedStepId: params.completedStepId,
    nextStepIndex,
    isComplete: false,
    suggestedDifficulty: updatedPerformance.currentDifficulty,
    progress: updatedProgress
  };
}
