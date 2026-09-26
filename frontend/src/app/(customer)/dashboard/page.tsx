"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  FileText,
  Wallet,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { loansApi } from "@/lib/api/loans";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/analytics/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Loan } from "@/types/loan";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const {
    data: loans,
    error,
    isLoading: loansLoading,
  } = useSWR<Loan[]>(user ? "loans/my" : null, () => loansApi.myLoans(), {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (!authLoading && user && user.role !== "CUSTOMER") {
      router.replace("/admin");
    }
  }, [authLoading, user, router]);

  // Guard clauses — after all hooks
  if (authLoading || loansLoading) return <FullPageSpinner />;
  if (!user) return null;
  if (user.role !== "CUSTOMER") return null;

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <PageHeader
          title={`Welcome, ${user.fullName.split(" ")[0]}`}
          description="Overview of your loans, payments, and credit profile."
        />
        <div className="mt-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load loans"
            description="There was a problem loading your loan data."
          />
        </div>
      </div>
    );
  }

  // Main render
  const allLoans = loans ?? [];
  const activeLoans = allLoans.filter((l) => l.status === "ACTIVE");
  const completedLoans = allLoans.filter((l) => l.status === "COMPLETED");
  const totalOutstanding = activeLoans.reduce(
    (sum, l) => sum + Number(l.outstandingBalance),
    0
  );
  const totalBorrowed = allLoans.reduce((sum, l) => sum + Number(l.amount), 0);
  const onTimeRate =
    allLoans.length === 0
      ? 100
      : (completedLoans.length / allLoans.length) * 100;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title={`Welcome, ${user.fullName.split(" ")[0]}`}
        description="Overview of your loans, payments, and credit profile."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active Loans"
          value={String(activeLoans.length)}
          icon={FileText}
        />
        <KpiCard
          label="Outstanding Balance"
          value={formatCurrency(totalOutstanding)}
          icon={Wallet}
        />
        <KpiCard
          label="Credit Score"
          value={String(user.creditScore)}
          icon={TrendingUp}
        />
        <KpiCard
          label="On-time Rate"
          value={formatPercent(onTimeRate)}
          icon={CheckCircle2}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total loans</span>
              <span className="font-medium">{allLoans.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active</span>
              <span className="font-medium">{activeLoans.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium">{completedLoans.length}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-4 text-sm">
              <span className="text-muted-foreground">Total borrowed</span>
              <span className="font-semibold">
                {formatCurrency(totalBorrowed)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {allLoans.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No loans yet"
                description="Apply for your first loan to see it here."
                action={
                  <Button onClick={() => router.push("/loans/apply")} size="sm">
                    Apply for a loan
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {allLoans.slice(0, 5).map((loan) => (
                  <li
                    key={loan.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{loan.loanTypeName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(loan.amount))} over{" "}
                        {loan.termMonths} months
                      </p>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {loan.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
