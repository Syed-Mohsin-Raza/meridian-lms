import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoanStatusBadge } from "./loan-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Loan } from "@/types/loan";

interface LoanTableProps {
  loans: Loan[];
  detailBasePath?: string;
  showCustomer?: boolean;
}

export function LoanTable({
  loans,
  detailBasePath = "/loans",
  showCustomer = false,
}: LoanTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            {showCustomer && <TableHead>Customer</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Monthly</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell className="font-medium">{loan.loanTypeName}</TableCell>
              {showCustomer && (
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{loan.customerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {loan.customerEmail}
                    </span>
                  </div>
                </TableCell>
              )}
              <TableCell className="text-right font-medium">
                {formatCurrency(Number(loan.amount))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(Number(loan.monthlyPayment))}
              </TableCell>
              <TableCell>{loan.termMonths} months</TableCell>
              <TableCell>
                <LoanStatusBadge status={loan.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(loan.appliedAt)}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`${detailBasePath}/${loan.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
