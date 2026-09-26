import { apiRequest } from "./client";
import type {
  DashboardKpi,
  LoanTypeBreakdown,
  RevenuePoint,
  TrendPoint,
} from "@/types/analytics";

export const analyticsApi = {
  dashboard(): Promise<DashboardKpi> {
    return apiRequest<DashboardKpi>("/api/v1/analytics/dashboard");
  },

  trends(): Promise<TrendPoint[]> {
    return apiRequest<TrendPoint[]>("/api/v1/analytics/trends");
  },

  revenue(): Promise<RevenuePoint[]> {
    return apiRequest<RevenuePoint[]>("/api/v1/analytics/revenue");
  },

  loanTypes(): Promise<LoanTypeBreakdown[]> {
    return apiRequest<LoanTypeBreakdown[]>("/api/v1/analytics/loan-types");
  },
};
