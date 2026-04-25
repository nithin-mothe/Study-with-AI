import { apiRequest } from "./httpClient";
import type { ProgressRecord } from "@/types";

export function getProgress() {
  return apiRequest<ProgressRecord>("/api/progress", {
    method: "GET"
  });
}

export function saveProgress(payload: Partial<ProgressRecord>) {
  return apiRequest<ProgressRecord>("/api/progress", {
    method: "POST",
    body: payload
  });
}
