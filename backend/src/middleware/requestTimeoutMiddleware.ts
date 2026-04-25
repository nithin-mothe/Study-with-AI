import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

export function requestTimeoutMiddleware(req: Request, res: Response, next: NextFunction) {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        error: {
          code: "REQUEST_TIMEOUT",
          message: "The request took too long. Please try again."
        }
      });
    }
  }, env.REQUEST_TIMEOUT_MS);

  res.on("finish", () => clearTimeout(timeout));
  req.on("close", () => clearTimeout(timeout));
  next();
}
