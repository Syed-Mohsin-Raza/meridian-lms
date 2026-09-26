import { apiRequest } from "./client";
import type { Payment, PaymentRequest } from "@/types/payment";

export const paymentsApi = {
  listForLoan(loanId: number): Promise<Payment[]> {
    return apiRequest<Payment[]>(`/api/v1/payments/loan/${loanId}`);
  },

  pay(payload: PaymentRequest): Promise<Payment> {
    return apiRequest<Payment>("/api/v1/payments/pay", {
      method: "POST",
      body: payload,
    });
  },
};
