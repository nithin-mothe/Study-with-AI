import { Router } from "express";
import { getProgressController, saveProgressController } from "../controllers/progressController";
import { requireAuth } from "../middleware/authMiddleware";

export const progressRoutes = Router();

progressRoutes.get("/progress", requireAuth, getProgressController);
progressRoutes.post("/progress", requireAuth, saveProgressController);
