import { cn } from "@/lib/utils";
import { LOAN_STATUS_LABELS, LOAN_STATUS_STYLES } from "@/lib/constants";
import type { LoanStatus } from "@/types/loan";

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        LOAN_STATUS_STYLES[status],
        className
      )}
    >
      {LOAN_STATUS_LABELS[status]}
    </span>
  );
}
