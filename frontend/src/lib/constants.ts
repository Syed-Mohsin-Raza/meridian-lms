import type { LoanStatus } from "@/types/loan";
import type { PaymentStatus } from "@/types/payment";
import type { UserStatus } from "@/types/auth";

/**
 * Tailwind color classes for each loan status badge.
 * Kept as plain strings so Tailwind's JIT can statically extract them.
 */
export const LOAN_STATUS_STYLES: Record<LoanStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  UNDER_REVIEW: "bg-blue-100 text-blue-800 border-blue-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  ACTIVE: "bg-cyan-100 text-cyan-800 border-cyan-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  DEFAULTED: "bg-rose-100 text-rose-900 border-rose-200",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
  OVERDUE: "bg-red-100 text-red-800 border-red-200",
  PARTIAL: "bg-blue-100 text-blue-800 border-blue-200",
};

export const USER_STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  SUSPENDED: "bg-red-100 text-red-800 border-red-200",
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  DEFAULTED: "Defaulted",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  OVERDUE: "Overdue",
  PARTIAL: "Partial",
};

/**
 * Pagination defaults. Used by every list page.
 * Values match what the backend accepts as `size` query param.
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_SORT = "appliedAt,desc";

/**
 * Currency formatter — no emojis, plain text output.
 */
export const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Date formatter — medium format, no relative time.
 */
export const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export const DATETIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
