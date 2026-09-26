"use client";

import { use, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { loansApi } from "@/lib/api/loans";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Loan } from "@/types/loan";

export default function AdminLoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const loanId = Number(id);
  const toast = useToast();

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decision, setDecision] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: loan,
    error,
    isLoading,
    mutate,
  } = useSWR<Loan>(`loan/${loanId}`, () => loansApi.getById(loanId), {
    revalidateOnFocus: false,
  });

  function openDecision(next: "APPROVE" | "REJECT") {
    setDecision(next);
    setReason("");
    setFormError(null);
    setDecisionOpen(true);
  }

  async function submitDecision() {
    setSubmitting(true);
    setFormError(null);
    try {
      await loansApi.review(loanId, {
        decision,
        reason: decision === "REJECT" ? reason : undefined,
      });
      toast.success(
        decision === "APPROVE" ? "Loan approved" : "Loan rejected",
        decision === "APPROVE"
          ? "The customer will see the updated status"
          : "The rejection reason has been recorded"
      );
      setDecisionOpen(false);
      mutate();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError("Could not record the decision. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <FullPageSpinner />;

  if (error || !loan) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <EmptyState
          icon={AlertCircle}
          title="Loan not found"
          description="The loan does not exist or you don't have permission to view it."
          action={
            <Link
              href="/admin/loans"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to loans
            </Link>
          }
        />
      </div>
    );
  }

  const isReviewable =
    loan.status === "PENDING" || loan.status === "UNDER_REVIEW";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/admin/loans"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to loans
      </Link>

      <PageHeader
        title={`Loan #${loan.id} — ${loan.loanTypeName}`}
        description={`${loan.customerName} (${loan.customerEmail}) · Applied ${formatDate(loan.appliedAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <LoanStatusBadge status={loan.status} />
            {isReviewable && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDecision("REJECT")}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button size="sm" onClick={() => openDecision("APPROVE")}>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              label="Outstanding Balance"
              value={formatCurrency(Number(loan.outstandingBalance))}
              emphasize
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer & Additional Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Customer" value={loan.customerName} />
            <DetailRow label="Email" value={loan.customerEmail} />
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

      <Dialog open={decisionOpen} onOpenChange={setDecisionOpen}>
        <DialogContent>
          <DialogHeader onClose={() => setDecisionOpen(false)}>
            <DialogTitle>
              {decision === "APPROVE" ? "Approve Loan" : "Reject Loan"}
            </DialogTitle>
            <DialogDescription>
              {decision === "APPROVE"
                ? "The customer will be notified and the loan will transition to ACTIVE with a payment schedule."
                : "The customer will see the rejection reason. This decision is recorded in the audit trail."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {decision === "REJECT" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Insufficient credit history"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDecisionOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant={decision === "REJECT" ? "destructive" : "default"}
              onClick={submitDecision}
              disabled={submitting || (decision === "REJECT" && !reason.trim())}
            >
              {submitting
                ? "Processing..."
                : `Confirm ${decision === "APPROVE" ? "Approval" : "Rejection"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    <div className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm ${emphasize ? "font-semibold" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
