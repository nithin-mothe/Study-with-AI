import { z } from "zod";
import { completeLearningStep, startLearningSession } from "../services/learningEngine";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const startLearningSchema = z.object({
  topic: z.string().trim().min(2).max(120),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional()
});

const nextLearningSchema = z.object({
  topic: z.string().trim().min(2).max(120),
  completedStepId: z.string().trim().min(1),
  currentStepIndex: z.number().int().min(0),
  speedSeconds: z.number().min(0).max(3600).default(0)
});

export const startLearningController = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("Authenticated user context is missing", 401, "AUTH_CONTEXT_MISSING");

  const input = startLearningSchema.parse(req.body);
  const session = await startLearningSession(req.user.uid, input.topic, input.level);

  sendSuccess(res, session, 201);
});

export const nextLearningController = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("Authenticated user context is missing", 401, "AUTH_CONTEXT_MISSING");

  const input = nextLearningSchema.parse(req.body);
  const result = await completeLearningStep({
    userId: req.user.uid,
    topic: input.topic,
    completedStepId: input.completedStepId,
    currentStepIndex: input.currentStepIndex,
    speedSeconds: input.speedSeconds
  });

  sendSuccess(res, result, 200);
});
