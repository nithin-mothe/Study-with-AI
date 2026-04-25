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

function resolveCorsOrigin(origin: string | undefined, callback: (err: Error | null, origin?: boolean | string) => void) {
  if (env.CORS_ORIGIN === "*") {
    callback(null, true);
    return;
  }

  const allowedOrigins = env.CORS_ORIGIN.split(",").map((item) => item.trim());
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(null, false);
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: resolveCorsOrigin,
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
