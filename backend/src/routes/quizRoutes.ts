import { Router } from "express";
import { quizController, submitQuizController } from "../controllers/quizController";
import { requireAuth } from "../middleware/authMiddleware";

export const quizRoutes = Router();

quizRoutes.post("/quiz", requireAuth, quizController);
quizRoutes.post("/quiz/submit", requireAuth, submitQuizController);
