import { Router } from "express";
import { explainController } from "../controllers/explainController";
import { requireAuth } from "../middleware/authMiddleware";

export const explainRoutes = Router();

explainRoutes.post("/explain", requireAuth, explainController);
