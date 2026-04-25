import { getUserProgress } from "./progressService";
import type { DashboardData, QuizDifficulty } from "../types/learning";
import { buildDashboardInsights, getSuggestedDifficulty } from "./recommendationEngine";

function getAccuracy(correct: number, attempts: number) {
  return attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const progress = await getUserProgress(userId);
  const performances = Object.entries(progress.topicPerformance);
  const totalAttempts = performances.reduce((sum, [, performance]) => sum + performance.attempts, 0);
  const totalCorrect = performances.reduce((sum, [, performance]) => sum + performance.correct, 0);
  const accuracy = getAccuracy(totalCorrect, totalAttempts);
  const insights = buildDashboardInsights(progress);

  return {
    progress,
    accuracy,
    suggestedDifficulty: getSuggestedDifficulty(accuracy),
    ...insights
  };
}
