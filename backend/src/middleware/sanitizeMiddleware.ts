import type { NextFunction, Request, Response } from "express";
import { sanitizeText } from "../utils/text";

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") return sanitizeText(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)]));
  }
  return value;
}

export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction) {
  req.body = sanitizeValue(req.body) as typeof req.body;
  next();
}
