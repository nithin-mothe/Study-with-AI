import type { NextFunction, Request, Response } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { env } from "../config/env";
import { getFirebaseAuth } from "../config/firebase";
import { AppError } from "../utils/AppError";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (env.DEMO_MODE && req.header("x-demo-user") === "true") {
    const nowSeconds = Math.floor(Date.now() / 1000);
    req.user = {
      uid: "demo-user",
      email: "demo@aistudycompanion.local",
      name: "Demo Learner",
      aud: "demo",
      auth_time: nowSeconds,
      exp: nowSeconds + 3600,
      firebase: { identities: {}, sign_in_provider: "demo" },
      iat: nowSeconds,
      iss: "demo",
      sub: "demo-user"
    } as DecodedIdToken;
    return next();
  }

  const authorizationHeader = req.header("Authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(new AppError("Missing Firebase ID token", 401, "AUTH_TOKEN_MISSING"));
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    req.user = await getFirebaseAuth().verifyIdToken(token);
    return next();
  } catch {
    return next(new AppError("Invalid or expired Firebase ID token", 401, "AUTH_TOKEN_INVALID"));
  }
}
