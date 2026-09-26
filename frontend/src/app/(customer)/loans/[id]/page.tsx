"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { loansApi } from "@/lib/api/loans";
import { paymentsApi } from "@/lib/api/payments";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Loan } from "@/types/loan";
import type { Payment } from "@/types/payment";

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const loanId = Number(id);

  const {
    data: loan,
    error: loanError,
    isLoading: loanLoading,
  } = useSWR<Loan>(`loan/${loanId}`, () => loansApi.getById(loanId), {
    revalidateOnFocus: false,
  });

  const { data: payments, isLoading: paymentsLoading } = useSWR<Payment[]>(
    loan ? `payments/loan/${loanId}` : null,
    () => paymentsApi.listForLoan(loanId),
    { revalidateOnFocus: false }
  );

  if (loanLoading || paymentsLoading) return <FullPageSpinner />;

  if (loanError || !loan) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <EmptyState
          icon={AlertCircle}
          title="Loan not found"
          description="The loan you are looking for does not exist or you don't have access to it."
          action={
            <Link
              href="/loans"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to loans
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/loans"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to loans
      </Link>

      <PageHeader
        title={loan.loanTypeName}
        description={`Applied on ${formatDate(loan.appliedAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <LoanStatusBadge status={loan.status} />
            {["PENDING", "UNDER_REVIEW", "APPROVED"].includes(loan.status) && (
              <Button variant="outline" size="sm" disabled title="Coming soon">
                Cancel application
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow
              label="Amount"
              value={formatCurrency(Number(loan.amount))}
            />
            <DetailRow label="Interest Rate" value={`${loan.interestRate}%`} />
            <DetailRow label="Term" value={`${loan.termMonths} months`} />
            <DetailRow
              label="Monthly Payment"
              value={formatCurrency(Number(loan.monthlyPayment))}
            />
            <DetailRow
              label="Total Payable"
              value={formatCurrency(Number(loan.totalPayable))}
            />
            <DetailRow
              label="Total Interest"
              value={formatCurrency(Number(loan.totalInterest))}
            />
            <DetailRow
              label="Outstanding Balance"
              value={formatCurrency(Number(loan.outstandingBalance))}
              emphasize
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Purpose" value={loan.purpose ?? "—"} />
            <DetailRow
              label="Assigned Officer"
              value={loan.assignedEmployeeName ?? "Unassigned"}
            />
            {loan.reviewedAt && (
              <DetailRow label="Reviewed" value={formatDate(loan.reviewedAt)} />
            )}
            {loan.approvedAt && (
              <DetailRow label="Approved" value={formatDate(loan.approvedAt)} />
            )}
            {loan.rejectionReason && (
              <DetailRow
                label="Rejection Reason"
                value={loan.rejectionReason}
                emphasize
              />
            )}
          </CardContent>
        </Card>
      </div>

      {payments && payments.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.installmentNumber}</TableCell>
                      <TableCell>{formatDate(p.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(p.amount))}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(Number(p.principalPortion))}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(Number(p.interestPortion))}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.paidAt ? formatDate(p.paidAt) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm ${emphasize ? "font-semibold" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
