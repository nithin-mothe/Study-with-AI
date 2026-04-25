import type { Request, Response } from "express";
import type { ApiFailure } from "../types/api";

export function notFoundHandler(req: Request, res: Response) {
  const payload: ApiFailure = {
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.path} was not found`
    }
  };

  res.status(404).json(payload);
}
