"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowLeft,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  TrendingUp,
} from "lucide-react";
import { customersApi } from "@/lib/api/customers";
import { aiApi } from "@/lib/api/ai";
import { useAuth } from "@/lib/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { RiskNarrativeCard } from "@/components/ai/risk-narrative-card";
import { formatDate } from "@/lib/format";
import { USER_STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/customer";
import type { CreditRiskNarrative } from "@/types/ai";

export default function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customerId = Number(id);
  const { user } = useAuth();

  const {
    data: customer,
    error: customerError,
    isLoading: customerLoading,
  } = useSWR<Customer>(
    user && user.role !== "CUSTOMER" ? `customer/${customerId}` : null,
    () => customersApi.getById(customerId),
    { revalidateOnFocus: false }
  );

  const {
    data: narrative,
    error: narrativeError,
    isLoading: narrativeLoading,
    mutate: regenerateNarrative,
  } = useSWR<CreditRiskNarrative>(
    customer ? `ai/credit-risk/${customerId}` : null,
    () => aiApi.creditRiskNarrative(customerId),
    { revalidateOnFocus: false }
  );

  if (customerLoading) return <FullPageSpinner />;

  if (customerError || !customer) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <EmptyState
          icon={AlertCircle}
          title="Customer not found"
          description="This customer does not exist or you don't have permission to view them."
          action={
            <Link
              href="/admin/customers"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to customers
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/admin/customers"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customers
      </Link>

      <PageHeader
        title={customer.fullName}
        description={customer.email}
        actions={
          <Badge
            variant="outline"
            className={cn(USER_STATUS_STYLES[customer.status])}
          >
            {customer.status}
          </Badge>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              icon={UserIcon}
              label="Full Name"
              value={customer.fullName}
            />
            <InfoRow icon={Mail} label="Email" value={customer.email} />
            <InfoRow
              icon={Phone}
              label="Phone"
              value={customer.phone ?? "Not provided"}
            />
            <InfoRow
              icon={Calendar}
              label="Member Since"
              value={formatDate(customer.createdAt)}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Credit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold">
                {customer.creditScore}
              </span>
              <span className="text-sm text-muted-foreground">
                of 850 maximum
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Credit tier determines the interest rate adjustment applied to
              this customer&apos;s loan applications.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <RiskNarrativeCard
          narrative={narrative}
          isLoading={narrativeLoading}
          error={narrativeError ?? null}
          onRegenerate={() => regenerateNarrative()}
        />
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
