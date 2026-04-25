import Groq from "groq-sdk";
import { z } from "zod";
import { env } from "../config/env";
import { getDemoExplanation, getDemoQuiz, getDemoSteps, isDemoTopic } from "./demoData";
import type {
  ConceptExplanation,
  ConceptLevel,
  MicroLearningStep,
  QuizDifficulty,
  QuizQuestion
} from "../types/learning";
import { logger } from "../utils/logger";
import { normalizeTopic } from "../utils/text";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const cacheTtlMs = 1000 * 60 * 30;
const responseCache = new Map<string, { value: unknown; expiresAt: number }>();
const pendingResponses = new Map<string, Promise<unknown>>();

const explanationSchema = z.object({
  title: z.string().min(1),
  simple_explanation: z.string().min(1),
  analogy: z.string().min(1),
  example: z.string().min(1),
  key_points: z.array(z.string().min(1)).min(3).max(6)
});

const microLearningSchema = z.object({
  steps: z.array(
    z.object({
      title: z.string().min(1),
      short_explanation: z.string().min(1),
      example: z.string().min(1),
      quick_question: z.object({
        question: z.string().min(1),
        expected_answer: z.string().min(1)
      })
    })
  ).min(3).max(5)
});

const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1),
      options: z.array(z.string().min(1)).length(4),
      correct_answer: z.string().min(1),
      explanation: z.string().min(1)
    })
  ).length(5)
});

const evaluationSchema = z.object({
  is_correct: z.boolean(),
  explanation: z.string().min(1),
  suggested_next_step: z.string().min(1)
});

const followUpSchema = z.object({
  explanation: z.string().min(1)
});

function readCached<T>(key: string): T | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return cached.value as T;
}

function writeCached<T>(key: string, value: T): T {
  responseCache.set(key, { value, expiresAt: Date.now() + cacheTtlMs });
  return value;
}

async function completeJson<T>(params: {
  cacheKey: string;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  fallback: T;
}): Promise<T> {
  const cached = readCached<T>(params.cacheKey);
  if (cached) return cached;

  const pending = pendingResponses.get(params.cacheKey);
  if (pending) return pending as Promise<T>;

  const task = (async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const completion = await groq.chat.completions.create({
          model: env.GROQ_MODEL,
          temperature: 0.25,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: params.systemPrompt },
            { role: "user", content: params.userPrompt }
          ]
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("Groq returned an empty response");

        const parsed = JSON.parse(content) as unknown;
        const validated = params.schema.parse(parsed);
        return writeCached(params.cacheKey, validated);
      } catch (error) {
        lastError = error;
      }
    }

    logger.error("Groq structured generation failed; returning fallback", {
      cacheKey: params.cacheKey,
      error: lastError instanceof Error ? lastError.message : "Unknown error"
    });
    return params.fallback;
  })();

  pendingResponses.set(params.cacheKey, task);

  try {
    return await task;
  } finally {
    pendingResponses.delete(params.cacheKey);
  }
}

export async function generateConceptExplanation(
  topic: string,
  level: ConceptLevel
): Promise<ConceptExplanation> {
  if (env.DEMO_MODE && isDemoTopic(topic)) {
    return writeCached(`explanation:${normalizeTopic(topic)}:${level}`, getDemoExplanation(topic));
  }

  const fallback = {
    title: topic,
    simple_explanation: `${topic} is best learned by breaking it into smaller parts and checking understanding after each part.`,
    analogy: "Think of it like climbing stairs: each small step makes the next one easier.",
    example: `A practical example of ${topic} should connect the idea to something you already understand.`,
    key_points: [
      `Start with the core meaning of ${topic}.`,
      "Study one small idea at a time.",
      "Use examples and quick questions to verify understanding."
    ]
  };

  const result = await completeJson({
    cacheKey: `explanation:${normalizeTopic(topic)}:${level}`,
    schema: explanationSchema,
    fallback,
    systemPrompt: `You are a precise learning designer. Return only valid JSON. Do not include markdown.
The JSON shape must be:
{
  "title": "",
  "simple_explanation": "",
  "analogy": "",
  "example": "",
  "key_points": []
}`,
    userPrompt: `Create a controlled concept explanation for topic "${topic}" at learner level "${level}".
Use concise student-friendly language. Avoid speculative facts.`
  });

  return {
    title: result.title,
    simpleExplanation: result.simple_explanation,
    analogy: result.analogy,
    example: result.example,
    keyPoints: result.key_points
  };
}

export async function generateMicroLearningSteps(topic: string): Promise<MicroLearningStep[]> {
  if (env.DEMO_MODE && isDemoTopic(topic)) {
    return writeCached(`micro:${normalizeTopic(topic)}`, getDemoSteps(topic));
  }

  const fallback = {
    steps: [
      {
        title: `Understand ${topic}`,
        short_explanation: `Begin by identifying what ${topic} means and why it matters.`,
        example: `Write a one-line definition of ${topic} in your own words.`,
        quick_question: {
          question: `What is the main purpose of ${topic}?`,
          expected_answer: `Explain the main purpose of ${topic} in one sentence.`
        }
      },
      {
        title: "See it in action",
        short_explanation: "Examples make abstract ideas easier to remember.",
        example: `Connect ${topic} to a real situation from school, work, or daily life.`,
        quick_question: {
          question: "Why does this example fit the concept?",
          expected_answer: "It should show how the concept works in practice."
        }
      },
      {
        title: "Check understanding",
        short_explanation: "A quick recall question reveals what needs review.",
        example: "Teach the idea back as if explaining it to a friend.",
        quick_question: {
          question: "What part still feels unclear?",
          expected_answer: "Name the unclear part so the next explanation can target it."
        }
      }
    ]
  };

  const result = await completeJson({
    cacheKey: `micro:${normalizeTopic(topic)}`,
    schema: microLearningSchema,
    fallback,
    systemPrompt: `You create structured micro-learning. Return only valid JSON. No markdown.
The JSON shape must be:
{
  "steps": [
    {
      "title": "",
      "short_explanation": "",
      "example": "",
      "quick_question": {
        "question": "",
        "expected_answer": ""
      }
    }
  ]
}`,
    userPrompt: `Break topic "${topic}" into 3 to 5 micro-learning steps.
Each step must have one short explanation, one concrete example, and one quick question.`
  });

  return result.steps.map((step, index) => ({
    id: `step-${index + 1}`,
    title: step.title,
    shortExplanation: step.short_explanation,
    example: step.example,
    quickQuestion: {
      question: step.quick_question.question,
      expectedAnswer: step.quick_question.expected_answer
    }
  }));
}

export async function generateQuiz(topic: string, difficulty: QuizDifficulty): Promise<QuizQuestion[]> {
  if (env.DEMO_MODE && isDemoTopic(topic)) {
    return writeCached(`quiz:${normalizeTopic(topic)}:${difficulty}`, getDemoQuiz(topic, difficulty));
  }

  const fallback = {
    questions: Array.from({ length: 5 }, (_, index) => ({
      question: `Which statement best checks your understanding of ${topic}?`,
      options: [
        `A core idea from ${topic}`,
        "An unrelated detail",
        "A memorized phrase without meaning",
        "A random example"
      ],
      correct_answer: `A core idea from ${topic}`,
      explanation: `The best answer should describe a meaningful part of ${topic}, not a random or memorized fragment.`
    }))
  };

  const result = await completeJson({
    cacheKey: `quiz:${normalizeTopic(topic)}:${difficulty}`,
    schema: quizSchema,
    fallback,
    systemPrompt: `You are an assessment designer. Return only valid JSON. No markdown.
The JSON shape must be:
{
  "questions": [
    {
      "question": "",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "",
      "explanation": ""
    }
  ]
}`,
    userPrompt: `Generate exactly 5 multiple-choice questions for topic "${topic}" at "${difficulty}" difficulty.
Each question must have exactly 4 options. The correct_answer must exactly match one option.`
  });

  return result.questions.map((question, index) => {
    const correctAnswerIndex = question.options.findIndex((option) => option === question.correct_answer);

    return {
      id: `q-${index + 1}`,
      question: question.question,
      options: question.options,
      correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
      correctAnswer: correctAnswerIndex >= 0 ? question.correct_answer : question.options[0],
      explanation: question.explanation
    };
  });
}

export async function evaluateAnswer(
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<Pick<import("../types/learning").AnswerEvaluation, "isCorrect" | "explanation" | "suggestedNextStep">> {
  const fallback = {
    is_correct: userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase(),
    explanation:
      userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
        ? "Correct. Your answer matches the expected concept."
        : `Not quite. The correct answer is "${correctAnswer}". Review the explanation before retrying.`,
    suggested_next_step:
      userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
        ? "Move to the next question."
        : "Retry this question after reviewing the explanation."
  };

  const result = await completeJson({
    cacheKey: `eval:${question}:${userAnswer}:${correctAnswer}`,
    schema: evaluationSchema,
    fallback,
    systemPrompt: `You evaluate student answers. Return only valid JSON. No markdown.
The JSON shape must be:
{
  "is_correct": true,
  "explanation": "",
  "suggested_next_step": ""
}`,
    userPrompt: `Question: ${question}
Student answer: ${userAnswer}
Correct answer: ${correctAnswer}
Evaluate strictly. If the student selected the exact correct answer, is_correct must be true.`
  });

  return {
    isCorrect: result.is_correct,
    explanation: result.explanation,
    suggestedNextStep: result.suggested_next_step
  };
}

export async function generateFollowUpExplanation(context: string): Promise<string> {
  const result = await completeJson({
    cacheKey: `follow-up:${context}`,
    schema: followUpSchema,
    fallback: {
      explanation: "Review the key idea in smaller pieces, then try one quick example before answering again."
    },
    systemPrompt: `You write concise follow-up tutoring explanations. Return only valid JSON.
The JSON shape must be:
{
  "explanation": ""
}`,
    userPrompt: `Give a short follow-up explanation for this learning context: ${context}`
  });

  return result.explanation;
}
