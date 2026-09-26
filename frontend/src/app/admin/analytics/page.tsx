"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { analyticsApi } from "@/lib/api/analytics";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/analytics/kpi-card";
import { TrendsChart } from "@/components/analytics/trends-chart";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { LoanTypesChart } from "@/components/analytics/loan-types-chart";
import { LoanTypesTable } from "@/components/analytics/loan-types-table";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle } from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type {
  DashboardKpi,
  LoanTypeBreakdown,
  RevenuePoint,
  TrendPoint,
} from "@/types/analytics";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const {
    data: kpi,
    error: kpiError,
    isLoading: kpiLoading,
  } = useSWR<DashboardKpi>(user ? "analytics/dashboard" : null, () =>
    analyticsApi.dashboard()
  );

  const { data: trends, isLoading: trendsLoading } = useSWR<TrendPoint[]>(
    user ? "analytics/trends" : null,
    () => analyticsApi.trends()
  );

  const { data: revenue, isLoading: revenueLoading } = useSWR<RevenuePoint[]>(
    user ? "analytics/revenue" : null,
    () => analyticsApi.revenue()
  );

  const { data: loanTypes, isLoading: loanTypesLoading } = useSWR<
    LoanTypeBreakdown[]
  >(user ? "analytics/loan-types" : null, () => analyticsApi.loanTypes());

  useEffect(() => {
    if (!authLoading && user && user.role === "CUSTOMER") {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const isLoading =
    authLoading ||
    kpiLoading ||
    trendsLoading ||
    revenueLoading ||
    loanTypesLoading;

  if (isLoading) return <FullPageSpinner />;
  if (!user) return null;
  if (user.role === "CUSTOMER") return null;

  if (kpiError) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <PageHeader
          title="Analytics"
          description="System-wide metrics, trends, and revenue."
        />
        <div className="mt-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load analytics"
            description="There was a problem loading analytics data."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        title="Analytics"
        description="System-wide metrics, trends, and revenue."
      />

      {kpi && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            label="Total Loans"
            value={formatNumber(kpi.totalLoans)}
            icon={FileText}
          />
          <KpiCard
            label="Active Loans"
            value={formatNumber(kpi.activeLoans)}
            icon={TrendingUp}
          />
          <KpiCard
            label="Pending"
            value={formatNumber(kpi.pendingLoans)}
            icon={Clock}
          />
          <KpiCard
            label="Disbursed"
            value={formatCurrency(Number(kpi.totalDisbursed))}
            icon={DollarSign}
          />
          <KpiCard
            label="Revenue"
            value={formatCurrency(Number(kpi.totalRevenue))}
            icon={CheckCircle2}
          />
          <KpiCard
            label="Approval Rate"
            value={formatPercent(kpi.approvalRate)}
            icon={Users}
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <TrendsChart data={trends ?? []} />
        <RevenueChart data={revenue ?? []} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <LoanTypesChart data={loanTypes ?? []} />
        <LoanTypesTable data={loanTypes ?? []} />
      </div>
    </div>
  );
}
