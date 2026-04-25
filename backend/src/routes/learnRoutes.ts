import { Router } from "express";
import { nextLearningController, startLearningController } from "../controllers/learnController";
import { requireAuth } from "../middleware/authMiddleware";

export const learnRoutes = Router();

learnRoutes.post("/learn/start", requireAuth, startLearningController);
learnRoutes.post("/learn/next", requireAuth, nextLearningController);
