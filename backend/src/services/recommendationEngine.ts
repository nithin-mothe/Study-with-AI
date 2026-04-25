import type { Achievement, DashboardData, ProgressRecord, QuizDifficulty } from "../types/learning";

function topicAccuracy(progress: ProgressRecord, topic: string) {
  return progress.topicPerformance[topic]?.lastAccuracy ?? 0;
}

function sortByAccuracy(progress: ProgressRecord, direction: "asc" | "desc") {
  return Object.keys(progress.topicPerformance).sort((a, b) => {
    const delta = topicAccuracy(progress, a) - topicAccuracy(progress, b);
    return direction === "asc" ? delta : -delta;
  });
}

export function getSuggestedDifficulty(accuracy: number): QuizDifficulty {
  if (accuracy < 50) return "easy";
  if (accuracy > 80) return "hard";
  return "medium";
}

export function getAchievements(progress: ProgressRecord): Achievement[] {
  const attempts = Object.values(progress.topicPerformance).reduce((sum, item) => sum + item.attempts, 0);
  const correct = Object.values(progress.topicPerformance).reduce((sum, item) => sum + item.correct, 0);
  const fastAverage = attempts
    ? Object.values(progress.topicPerformance).reduce((sum, item) => sum + item.totalSpeedSeconds, 0) / attempts
    : Number.POSITIVE_INFINITY;

  return [
    {
      id: "fast-learner",
      label: "Fast Learner",
      description: "Average answer time under 12 seconds.",
      unlocked: attempts >= 3 && fastAverage <= 12
    },
    {
      id: "consistency-king",
      label: "Consistency King",
      description: "Maintain a 3-day learning streak.",
      unlocked: progress.streakDays >= 3
    },
    {
      id: "quiz-master",
      label: "Quiz Master",
      description: "Answer 10 quiz questions correctly.",
      unlocked: correct >= 10
    }
  ];
}

export function buildDashboardInsights(progress: ProgressRecord): Omit<
  DashboardData,
  "progress" | "accuracy" | "suggestedDifficulty"
> {
  const weakTopics = sortByAccuracy(progress, "asc")
    .filter((topic) => progress.topicPerformance[topic].lastAccuracy < 60 || progress.topicPerformance[topic].weakCount > 0)
    .slice(0, 4);
  const strongTopics = sortByAccuracy(progress, "desc")
    .filter((topic) => progress.topicPerformance[topic].lastAccuracy >= 80)
    .slice(0, 4);
  const nextTopic = weakTopics[0] ?? progress.currentTopic ?? "Neural Networks";
  const today = new Date().toISOString().slice(0, 10);
  const todayActivity = progress.dailyActivity?.[today];
  const answersToday = todayActivity?.answers ?? 0;

  return {
    weakTopics,
    strongTopics,
    focusAreas: weakTopics.length
      ? weakTopics.map((topic) => `Rebuild confidence in ${topic} with a simpler lesson.`)
      : ["Complete one adaptive quiz to discover your next focus area."],
    recommendations: [
      `Start with ${nextTopic} for the fastest improvement.`,
      answersToday >= 5 ? "Daily goal complete. Stretch with one hard question." : "Answer 5 questions to complete today's goal.",
      strongTopics[0] ? `Protect your strength in ${strongTopics[0]} with a quick review.` : "Build your first strong topic today."
    ],
    achievements: getAchievements(progress),
    dailyGoal: {
      targetAnswers: 5,
      completedAnswers: Math.min(answersToday, 5),
      isComplete: answersToday >= 5
    },
    nextTopic
  };
}
