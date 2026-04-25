import { apiRequest } from "./httpClient";
import type {
  AnswerEvaluation,
  ConceptLevel,
  ExplanationResponse,
  LearnNextResponse,
  LearningSession,
  QuizDifficulty,
  QuizResponse
} from "@/types";

export function explainTopic(topic: string) {
  return apiRequest<ExplanationResponse>("/api/explain", {
    method: "POST",
    body: { topic }
  });
}

export function generateQuiz(topic: string, difficulty: QuizDifficulty) {
  return apiRequest<QuizResponse>("/api/quiz", {
    method: "POST",
    body: { topic, difficulty }
  });
}

export function startLearning(topic: string, level?: ConceptLevel) {
  return apiRequest<LearningSession>("/api/learn/start", {
    method: "POST",
    body: { topic, level }
  });
}

export function completeLearningStep(input: {
  topic: string;
  completedStepId: string;
  currentStepIndex: number;
  speedSeconds: number;
}) {
  return apiRequest<LearnNextResponse>("/api/learn/next", {
    method: "POST",
    body: input
  });
}

export function submitQuizAnswer(input: {
  quizId: string;
  questionId: string;
  userAnswer: string;
  speedSeconds: number;
}) {
  return apiRequest<AnswerEvaluation>("/api/quiz/submit", {
    method: "POST",
    body: input
  });
}
