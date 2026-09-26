"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { LoanApplyForm } from "@/components/loans/loan-apply-form";

export default function LoanApplyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/loans"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to loans
      </Link>

      <PageHeader
        title="Apply for a Loan"
        description="Complete the steps below to submit your application."
      />

      <div className="mt-8">
        <LoanApplyForm />
      </div>
    </div>
  );
}
