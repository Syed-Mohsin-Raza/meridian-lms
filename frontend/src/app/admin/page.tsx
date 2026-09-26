"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { FileText, Users, DollarSign, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { analyticsApi } from "@/lib/api/analytics";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/analytics/kpi-card";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const {
    data: kpi,
    error,
    isLoading: kpiLoading,
  } = useSWR(user ? "analytics/dashboard" : null, () =>
    analyticsApi.dashboard()
  );

  useEffect(() => {
    if (!authLoading && user && user.role === "CUSTOMER") {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  if (authLoading || kpiLoading) return <FullPageSpinner />;
  if (!user) return null;
  if (user.role === "CUSTOMER") return null;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Dashboard"
        description="System-wide metrics and recent activity."
      />

      {error ? (
        <div className="mt-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load dashboard"
            description="There was a problem loading the KPI data."
          />
        </div>
      ) : kpi ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            label="Total Disbursed"
            value={formatCurrency(kpi.totalDisbursed)}
            icon={DollarSign}
          />
          <KpiCard
            label="Approval Rate"
            value={formatPercent(kpi.approvalRate)}
            icon={Users}
          />
        </div>
      ) : null}

      <div className="mt-8">
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <span>View full analytics with charts</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
