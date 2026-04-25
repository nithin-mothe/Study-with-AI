import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { rateLimitMiddleware } from "./middleware/rateLimitMiddleware";
import { requestTimeoutMiddleware } from "./middleware/requestTimeoutMiddleware";
import { sanitizeMiddleware } from "./middleware/sanitizeMiddleware";
import { sendSuccess } from "./utils/apiResponse";
import { logger } from "./utils/logger";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(requestTimeoutMiddleware);
  app.use(rateLimitMiddleware);
  app.use(express.json({ limit: "1mb" }));
  app.use(sanitizeMiddleware);
  app.use(
    morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    })
  );

  app.get("/health", (_req, res) => {
    sendSuccess(res, { status: "ok", service: "ai-study-companion-backend" });
  });

  app.use("/api", apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
