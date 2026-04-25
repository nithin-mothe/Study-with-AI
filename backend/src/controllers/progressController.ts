import { z } from "zod";
import { ensureUserProfile, getUserProgress, saveUserProgress } from "../services/progressService";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const progressSchema = z.object({
  completedTopics: z.array(z.string().trim().min(1)).optional(),
  currentTopic: z.string().trim().min(1).max(120).optional(),
  quizScores: z.record(z.number().min(0).max(100)).optional(),
  streakDays: z.number().int().min(0).optional()
});

export const getProgressController = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("Authenticated user context is missing", 401, "AUTH_CONTEXT_MISSING");

  await ensureUserProfile(req.user.uid, req.user.email, req.user.name);
  const progress = await getUserProgress(req.user.uid);

  sendSuccess(res, progress, 200);
});

export const saveProgressController = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("Authenticated user context is missing", 401, "AUTH_CONTEXT_MISSING");

  const input = progressSchema.parse(req.body);
  const progress = await saveUserProgress(req.user.uid, input);

  sendSuccess(res, progress, 200);
});
