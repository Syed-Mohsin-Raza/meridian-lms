export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";

export interface Payment {
  id: number;
  loanId: number;
  amount: number;
  principalPortion: number;
  interestPortion: number;
  dueDate: string;
  paidAt: string | null;
  status: PaymentStatus;
  paymentMethod: string | null;
  lateFee: number;
  installmentNumber: number;
}

export interface PaymentRequest {
  paymentId: number;
  paymentMethod: string;
  idempotencyKey: string;
  amount?: number;
}

export interface PaymentFilter {
  status?: PaymentStatus;
  loanId?: number;
  page?: number;
  size?: number;
  sort?: string;
}
