import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

const windowMs = 60_000;
const maxRequests = 90;
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(req: Request, _res: Response, next: NextFunction) {
  const key = req.ip || req.header("x-forwarded-for") || "unknown";
  const now = Date.now();
  const existing = hits.get(key);

  if (!existing || existing.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (existing.count >= maxRequests) {
    return next(new AppError("Too many requests. Please try again shortly.", 429, "RATE_LIMITED"));
  }

  existing.count += 1;
  return next();
}
