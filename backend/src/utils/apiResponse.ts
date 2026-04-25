import type { Response } from "express";
import type { ApiSuccess } from "../types/api";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string) {
  const payload: ApiSuccess<T> = {
    success: true,
    data,
    message
  };

  return res.status(statusCode).json(payload);
}
