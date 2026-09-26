import { apiRequest } from "./client";
import type { CreditRiskNarrative } from "@/types/ai";

export const aiApi = {
  creditRiskNarrative(customerId: number): Promise<CreditRiskNarrative> {
    return apiRequest<CreditRiskNarrative>(
      `/api/v1/ai/credit-risk/${customerId}`
    );
  },
};
