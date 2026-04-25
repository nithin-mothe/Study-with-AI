import { Router } from "express";
import { dashboardRoutes } from "./dashboardRoutes";
import { explainRoutes } from "./explainRoutes";
import { learnRoutes } from "./learnRoutes";
import { progressRoutes } from "./progressRoutes";
import { quizRoutes } from "./quizRoutes";

export const apiRoutes = Router();

apiRoutes.use(dashboardRoutes);
apiRoutes.use(explainRoutes);
apiRoutes.use(learnRoutes);
apiRoutes.use(quizRoutes);
apiRoutes.use(progressRoutes);
