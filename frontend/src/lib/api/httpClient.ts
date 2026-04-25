import { getClientAuth } from "@/lib/firebase/auth";
import type { ApiEnvelope, ApiErrorEnvelope } from "@/types";
import { isDemoMode } from "@/utils/env";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = isDemoMode ? undefined : await getClientAuth().currentUser?.getIdToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (isDemoMode) {
    headers.set("X-Demo-User", "true");
  } else if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = (await response.json()) as ApiEnvelope<T> | ApiErrorEnvelope;

  if (!response.ok || !payload.success) {
    const message = payload.success ? "Unexpected API error" : payload.error.message;
    throw new Error(message);
  }

  return payload.data;
}
