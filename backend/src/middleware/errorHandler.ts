import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import type { ApiFailure } from "../types/api";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    logger.warn("Request validation failed", { details: error.flatten() });
    const payload: ApiFailure = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.flatten()
      }
    };

    res.status(400).json(payload);
    return;
  }

  if (error instanceof AppError) {
    logger.warn(error.message, { code: error.code, statusCode: error.statusCode, details: error.details });
    const payload: ApiFailure = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };

    res.status(error.statusCode).json(payload);
    return;
  }

  const payload: ApiFailure = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred"
    }
  };

  logger.error("Unhandled application error", {
    message: error instanceof Error ? error.message : "Unknown error"
  });
  res.status(500).json(payload);
};
