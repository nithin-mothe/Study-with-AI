import { z } from "zod";
import { createQuiz, submitQuizAnswer } from "../services/quizService";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const quizSchema = z.object({
  topic: z.string().trim().min(2).max(120),
  difficulty: z.enum(["easy", "medium", "hard"]).optional()
});

const quizSubmitSchema = z.object({
  quizId: z.string().trim().min(1),
  questionId: z.string().trim().min(1),
  userAnswer: z.string().trim().min(1),
  speedSeconds: z.number().min(0).max(3600).default(0)
});

export const quizController = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("Authenticated user context is missing", 401, "AUTH_CONTEXT_MISSING");

  const { topic, difficulty } = quizSchema.parse(req.body);
  const quiz = await createQuiz(req.user.uid, topic, difficulty);

  sendSuccess(res, quiz, 201);
});

export const submitQuizController = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("Authenticated user context is missing", 401, "AUTH_CONTEXT_MISSING");

  const input = quizSubmitSchema.parse(req.body);
  const feedback = await submitQuizAnswer({
    userId: req.user.uid,
    quizId: input.quizId,
    questionId: input.questionId,
    userAnswer: input.userAnswer,
    speedSeconds: input.speedSeconds
  });

  sendSuccess(res, feedback, 200);
});
