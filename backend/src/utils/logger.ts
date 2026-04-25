import { env } from "../config/env";

type LogMeta = Record<string, unknown>;

function write(level: "info" | "warn" | "error", message: string, meta?: LogMeta) {
  const payload = {
    level,
    message,
    service: "ai-study-companion-backend",
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {})
  };

  if (env.NODE_ENV === "production") {
    process.stdout.write(`${JSON.stringify(payload)}\n`);
    return;
  }

  process.stdout.write(`[${payload.timestamp}] ${level.toUpperCase()} ${message}${meta ? ` ${JSON.stringify(meta)}` : ""}\n`);
}

export const logger = {
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta)
};
