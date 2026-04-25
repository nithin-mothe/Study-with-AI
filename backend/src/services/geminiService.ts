import { generateConceptExplanation, generateQuiz as generateGroqQuiz } from "./groqService";
import type { ExplanationResult, QuizDifficulty, QuizQuestion } from "../types/learning";

// Backward-compatible adapter for Phase 1 controllers. Phase 2 routes use Groq directly.
export async function generateExplanation(topic: string): Promise<ExplanationResult> {
  const explanation = await generateConceptExplanation(topic, "beginner");

  return {
    topic,
    summary: explanation.title,
    keyPoints: explanation.keyPoints,
    analogy: explanation.analogy,
    microLesson: explanation.simpleExplanation,
    nextSteps: ["Complete the micro-learning steps.", "Try the adaptive quiz.", "Review weak areas from dashboard."]
  };
}

export async function generateQuiz(topic: string, difficulty: QuizDifficulty): Promise<QuizQuestion[]> {
  return generateGroqQuiz(topic, difficulty);
}
