"use client";

import Link from "next/link";
import useSWR from "swr";
import { Plus, FileText, AlertCircle } from "lucide-react";
import { loansApi } from "@/lib/api/loans";
import { PageHeader } from "@/components/ui/page-header";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { LoanTable } from "@/components/loans/loan-table";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { Loan } from "@/types/loan";

export default function CustomerLoansPage() {
  const {
    data: loans,
    error,
    isLoading,
  } = useSWR<Loan[]>("loans/my", () => loansApi.myLoans(), {
    revalidateOnFocus: false,
  });

  if (isLoading) return <FullPageSpinner />;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="My Loans"
        description="View the status and details of all your loan applications."
        actions={
          <Link
            href="/loans/apply"
            className={cn(buttonVariants(), "inline-flex gap-2")}
          >
            <Plus className="h-4 w-4" />
            <span>Apply for a loan</span>
          </Link>
        }
      />

      <div className="mt-8">
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load loans"
            description="There was a problem loading your loan data."
          />
        ) : !loans || loans.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No loans yet"
            description="Apply for your first loan to get started."
            action={
              <Link
                href="/loans/apply"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Apply for a loan
              </Link>
            }
          />
        ) : (
          <LoanTable loans={loans} detailBasePath="/loans" />
        )}
      </div>
    </div>
  );
}
