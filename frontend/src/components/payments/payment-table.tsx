import { Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "./payment-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Payment } from "@/types/payment";

interface PaymentTableProps {
  payments: Payment[];
  onPayClick?: (payment: Payment) => void;
  showLoanColumn?: boolean;
}

export function PaymentTable({
  payments,
  onPayClick,
  showLoanColumn = false,
}: PaymentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Installment</TableHead>
            {showLoanColumn && <TableHead>Loan</TableHead>}
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Principal</TableHead>
            <TableHead className="text-right">Interest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid</TableHead>
            {onPayClick && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const isPayable =
              payment.status === "PENDING" || payment.status === "OVERDUE";

            return (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  #{payment.installmentNumber}
                </TableCell>
                {showLoanColumn && (
                  <TableCell className="text-sm text-muted-foreground">
                    Loan #{payment.loanId}
                  </TableCell>
                )}
                <TableCell>{formatDate(payment.dueDate)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(Number(payment.amount))}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(Number(payment.principalPortion))}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(Number(payment.interestPortion))}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                </TableCell>
                {onPayClick && (
                  <TableCell className="text-right">
                    {isPayable ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPayClick(payment)}
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        Pay
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
