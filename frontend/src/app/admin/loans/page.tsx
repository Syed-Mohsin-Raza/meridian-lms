"use client";

import { useState } from "react";
import useSWR from "swr";
import { AlertCircle, FileText } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { usePagination } from "@/lib/hooks/use-pagination";
import { loansApi } from "@/lib/api/loans";
import { PageHeader } from "@/components/ui/page-header";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { LoanTable } from "@/components/loans/loan-table";
import { Pagination } from "@/components/ui/pagination";
import type { Loan, LoanFilter, LoanStatus } from "@/types/loan";
import type { Page } from "@/types/api";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: LoanStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
];

export default function AdminLoansPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { page, size, sort, setPage, setSize } = usePagination({
    defaultSort: "appliedAt,desc",
  });
  const [statusFilter, setStatusFilter] = useState<LoanStatus | "ALL">("ALL");

  const filter: LoanFilter = {
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    size,
    sort,
  };

  const {
    data: pageData,
    error,
    isLoading: loansLoading,
  } = useSWR<Page<Loan>>(
    user ? `admin/loans/${JSON.stringify(filter)}` : null,
    () => loansApi.list(filter),
    { revalidateOnFocus: false }
  );

  const isLoading = authLoading || loansLoading;

  if (isLoading) return <FullPageSpinner />;
  if (!user) return null;
  if (user.role === "CUSTOMER") return null;

  const loans = pageData?.content ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        title="Loans"
        description="Review and manage all loan applications."
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setStatusFilter(opt.value);
              setPage(0);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-accent"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load loans"
            description="There was a problem loading the loans list."
          />
        ) : loans.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No loans match your filter"
            description="Try changing the status filter or clearing it."
          />
        ) : (
          <>
            <LoanTable
              loans={loans}
              detailBasePath="/admin/loans"
              showCustomer
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={size}
              onPageChange={setPage}
              onPageSizeChange={setSize}
              className="mt-4"
            />
          </>
        )}
      </div>
    </div>
  );
}
