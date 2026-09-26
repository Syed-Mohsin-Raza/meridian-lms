import { cn } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_STYLES } from "@/lib/constants";
import type { PaymentStatus } from "@/types/payment";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        PAYMENT_STATUS_STYLES[status],
        className
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
