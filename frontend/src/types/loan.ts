export type LoanStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED"
  | "DEFAULTED";

export interface LoanType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  minAmount: number;
  maxAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  baseInterestRate: number;
}

export interface Loan {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  loanTypeId: number;
  loanTypeName: string;
  loanTypeCode: string;
  assignedEmployeeId: number | null;
  assignedEmployeeName: string | null;
  amount: number;
  termMonths: number;
  interestRate: number;
  monthlyPayment: number;
  totalPayable: number;
  totalInterest: number;
  outstandingBalance: number;
  status: LoanStatus;
  purpose: string | null;
  rejectionReason: string | null;
  appliedAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  completedAt: string | null;
}

export interface LoanApplicationRequest {
  loanTypeCode: string;
  amount: number;
  termMonths: number;
  purpose?: string;
}

export interface ReviewLoanRequest {
  decision: "APPROVE" | "REJECT" | "ASSIGN" | "START_REVIEW";
  reason?: string;
}

export interface LoanFilter {
  status?: LoanStatus;
  loanTypeCode?: string;
  customerId?: number;
  page?: number;
  size?: number;
  sort?: string;
}
