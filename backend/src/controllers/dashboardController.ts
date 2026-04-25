import { getDashboardData } from "../services/dashboardService";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const dashboardController = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("Authenticated user context is missing", 401, "AUTH_CONTEXT_MISSING");

  const dashboard = await getDashboardData(req.user.uid);

  sendSuccess(res, dashboard, 200);
});
