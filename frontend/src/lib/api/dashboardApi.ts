import { apiRequest } from "./httpClient";
import type { DashboardData } from "@/types";

export function getDashboard() {
  return apiRequest<DashboardData>("/api/dashboard", {
    method: "GET"
  });
}
