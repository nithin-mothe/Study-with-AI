import { FieldValue } from "firebase-admin/firestore";
import { env } from "../config/env";
import { getFirestore } from "../config/firebase";
import { evaluateAnswer, generateFollowUpExplanation, generateQuiz as generateGroqQuiz } from "./groqService";
import { awardAnswerXp } from "./gamificationService";
import { getUserProgress, saveUserProgress } from "./progressService";
import type { AnswerEvaluation, QuizDifficulty, QuizResult } from "../types/learning";
import { AppError } from "../utils/AppError";

const quizzesCollection = "quizzes";
const demoQuizStore = new Map<string, QuizResult>();

function adaptDifficulty(accuracy: number): QuizDifficulty {
  if (accuracy < 50) return "easy";
  if (accuracy > 80) return "hard";
  return "medium";
}

export async function createQuiz(userId: string, topic: string, difficulty?: QuizDifficulty): Promise<QuizResult> {
  const progress = await getUserProgress(userId);
  const performance = progress.topicPerformance[topic];
  const adaptiveDifficulty = difficulty ?? adaptDifficulty(performance?.lastAccuracy ?? 0);
  const questions = await generateGroqQuiz(topic, adaptiveDifficulty);
  const createdAt = new Date().toISOString();
  const quizReference = env.DEMO_MODE ? null : getFirestore().collection(quizzesCollection).doc();

  const quiz: QuizResult = {
    id: quizReference?.id ?? `demo-quiz-${Date.now()}`,
    userId,
    topic,
    difficulty: adaptiveDifficulty,
    questions,
    createdAt
  };

  if (env.DEMO_MODE) {
    demoQuizStore.set(quiz.id, quiz);
    return quiz;
  }

  if (!quizReference) {
    throw new AppError("Unable to create quiz", 500, "QUIZ_CREATE_FAILED");
  }

  await quizReference.set({
    ...quiz,
    createdAt: FieldValue.serverTimestamp()
  });

  return quiz;
}

export async function submitQuizAnswer(params: {
  userId: string;
  quizId: string;
  questionId: string;
  userAnswer: string;
  speedSeconds: number;
}): Promise<AnswerEvaluation> {
  const quiz = env.DEMO_MODE
    ? demoQuizStore.get(params.quizId)
    : ((await getFirestore().collection(quizzesCollection).doc(params.quizId).get()).data() as QuizResult | undefined);

  if (!quiz) throw new AppError("Quiz not found", 404, "QUIZ_NOT_FOUND");

  if (quiz.userId !== params.userId) {
    throw new AppError("Quiz does not belong to the authenticated user", 403, "QUIZ_FORBIDDEN");
  }

  const question = quiz.questions.find((item) => item.id === params.questionId);
  if (!question) throw new AppError("Question not found", 404, "QUESTION_NOT_FOUND");

  const aiEvaluation = await evaluateAnswer(question.question, params.userAnswer, question.correctAnswer);
  const isCorrect = params.userAnswer === question.correctAnswer;
  const progress = await getUserProgress(params.userId);
  const topicPerformance = progress.topicPerformance[quiz.topic] ?? {
    attempts: 0,
    correct: 0,
    totalSpeedSeconds: 0,
    lastAccuracy: 0,
    accuracyTrend: [],
    currentDifficulty: quiz.difficulty,
    weakCount: 0,
    updatedAt: new Date().toISOString()
  };

  const attempts = topicPerformance.attempts + 1;
  const correct = topicPerformance.correct + (isCorrect ? 1 : 0);
  const lastAccuracy = Math.round((correct / attempts) * 100);
  const updatedDifficulty = adaptDifficulty(lastAccuracy);
  const rewards = awardAnswerXp(progress, isCorrect);
  const today = new Date().toISOString().slice(0, 10);
  const existingDailyActivity = progress.dailyActivity?.[today] ?? {
    answers: 0,
    correct: 0,
    xp: 0,
    timeSpentSeconds: 0
  };
  const updatedProgress = await saveUserProgress(params.userId, {
    currentTopic: quiz.topic,
    completedTopics: isCorrect ? [quiz.topic] : [],
    quizScores: {
      [quiz.id]: lastAccuracy
    },
    topicPerformance: {
      ...progress.topicPerformance,
      [quiz.topic]: {
        attempts,
        correct,
        totalSpeedSeconds: topicPerformance.totalSpeedSeconds + params.speedSeconds,
        lastAccuracy,
        accuracyTrend: [...(topicPerformance.accuracyTrend ?? []), lastAccuracy].slice(-10),
        currentDifficulty: updatedDifficulty,
        weakCount: isCorrect ? Math.max(topicPerformance.weakCount - 1, 0) : topicPerformance.weakCount + 1,
        updatedAt: new Date().toISOString()
      }
    },
    dailyActivity: {
      ...(progress.dailyActivity ?? {}),
      [today]: {
        answers: existingDailyActivity.answers + 1,
        correct: existingDailyActivity.correct + (isCorrect ? 1 : 0),
        xp: existingDailyActivity.xp + rewards.xpAwarded + rewards.streakBonusAwarded,
        timeSpentSeconds: existingDailyActivity.timeSpentSeconds + params.speedSeconds
      }
    },
    xp: rewards.xp,
    level: rewards.level,
    streakDays: rewards.streakDays,
    lastActiveDate: rewards.lastActiveDate
  });

  const followUpExplanation = await generateFollowUpExplanation(
    `${quiz.topic}; question: ${question.question}; answer: ${params.userAnswer}; correct: ${question.correctAnswer}`
  );

  return {
    isCorrect,
    explanation: isCorrect ? question.explanation : aiEvaluation.explanation,
    suggestedNextStep: isCorrect ? "Move to the next question." : aiEvaluation.suggestedNextStep,
    followUpExplanation,
    xpAwarded: rewards.xpAwarded,
    streakBonusAwarded: rewards.streakBonusAwarded,
    updatedDifficulty,
    progress: updatedProgress
  };
}
