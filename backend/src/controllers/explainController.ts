import { z } from "zod";
import { generateExplanation } from "../services/geminiService";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const explainSchema = z.object({
  topic: z.string().trim().min(2).max(120)
});

export const explainController = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("Authenticated user context is missing", 401, "AUTH_CONTEXT_MISSING");

  const { topic } = explainSchema.parse(req.body);
  const explanation = await generateExplanation(topic);

  sendSuccess(res, explanation, 200);
});
