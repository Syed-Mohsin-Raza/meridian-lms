import { apiRequest, buildQuery } from "./client";
import type {
  Loan,
  LoanApplicationRequest,
  LoanFilter,
  LoanType,
  ReviewLoanRequest,
} from "@/types/loan";
import type { Page } from "@/types/api";

export const loansApi = {
  listTypes(): Promise<LoanType[]> {
    return apiRequest<LoanType[]>("/api/v1/loans/types");
  },

  apply(payload: LoanApplicationRequest): Promise<Loan> {
    return apiRequest<Loan>("/api/v1/loans", {
      method: "POST",
      body: payload,
    });
  },

  myLoans(): Promise<Loan[]> {
    return apiRequest<Loan[]>("/api/v1/loans/my");
  },

  /** Staff: paginated list of all loans */
  list(filter: LoanFilter = {}): Promise<Page<Loan>> {
    const qs = buildQuery({
      status: filter.status,
      loanTypeCode: filter.loanTypeCode,
      customerId: filter.customerId,
      page: filter.page ?? 0,
      size: filter.size ?? 20,
      sort: filter.sort ?? "appliedAt,desc",
    });
    return apiRequest<Page<Loan>>(`/api/v1/loans${qs}`);
  },

  getById(id: number): Promise<Loan> {
    return apiRequest<Loan>(`/api/v1/loans/${id}`);
  },

  review(id: number, payload: ReviewLoanRequest): Promise<Loan> {
    return apiRequest<Loan>(`/api/v1/loans/${id}/review`, {
      method: "PUT",
      body: payload,
    });
  },
};
