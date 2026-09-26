"use client";

import { useState } from "react";
import useSWR from "swr";
import { AlertCircle, Wallet } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { loansApi } from "@/lib/api/loans";
import { paymentsApi } from "@/lib/api/payments";
import { PageHeader } from "@/components/ui/page-header";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { PaymentTable } from "@/components/payments/payment-table";
import { PayDialog } from "@/components/payments/pay-dialog";
import type { Loan } from "@/types/loan";
import type { Payment } from "@/types/payment";

export default function CustomerPaymentsPage() {
  const { user, refresh } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: loans, isLoading: loansLoading } = useSWR<Loan[]>(
    user ? "loans/my" : null,
    () => loansApi.myLoans(),
    { revalidateOnFocus: false }
  );

  const activeLoanIds = (loans ?? [])
    .filter((l) => l.status === "ACTIVE" || l.status === "COMPLETED")
    .map((l) => l.id);

  const {
    data: paymentsByLoan,
    error,
    isLoading: paymentsLoading,
    mutate,
  } = useSWR<Payment[]>(
    loans && activeLoanIds.length > 0
      ? `payments/all/${activeLoanIds.join(",")}`
      : null,
    async () => {
      const results = await Promise.all(
        activeLoanIds.map((id) => paymentsApi.listForLoan(id))
      );
      return results.flat();
    },
    { revalidateOnFocus: false }
  );

  const isLoading = loansLoading || paymentsLoading;

  if (isLoading) return <FullPageSpinner />;

  const payments = (paymentsByLoan ?? []).sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const pending = payments.filter(
    (p) => p.status === "PENDING" || p.status === "OVERDUE"
  );
  const paid = payments.filter((p) => p.status === "PAID");

  function handlePayClick(payment: Payment) {
    setSelectedPayment(payment);
    setDialogOpen(true);
  }

  function handlePaySuccess() {
    mutate();
    refresh();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Payments"
        description="View and pay your loan installments."
      />

      <div className="mt-8">
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load payments"
            description="There was a problem loading your payments."
          />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No payments yet"
            description="Once you have an active loan, your payment schedule will appear here."
          />
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">
                  Upcoming Payments ({pending.length})
                </h2>
                <PaymentTable
                  payments={pending}
                  onPayClick={handlePayClick}
                  showLoanColumn
                />
              </section>
            )}

            {paid.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">
                  Payment History ({paid.length})
                </h2>
                <PaymentTable payments={paid} showLoanColumn />
              </section>
            )}
          </div>
        )}
      </div>

      <PayDialog
        payment={selectedPayment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handlePaySuccess}
      />
    </div>
  );
}
