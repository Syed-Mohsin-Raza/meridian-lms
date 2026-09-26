"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useSWR from "swr";
import { AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { loansApi } from "@/lib/api/loans";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/format";
import type { LoanType } from "@/types/loan";

const applySchema = z.object({
  loanTypeCode: z.string().min(1, "Select a loan type"),
  amount: z.number().positive("Amount must be positive"),
  termMonths: z.number().int().positive("Term must be a positive integer"),
  purpose: z.string().max(500).optional(),
});

type ApplyFormData = z.infer<typeof applySchema>;

const STEPS = [
  { id: "type", label: "Loan Type" },
  { id: "amount", label: "Amount & Term" },
  { id: "review", label: "Review & Submit" },
] as const;

const FORM_ID = "loan-apply-form";

export function LoanApplyForm() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: loanTypes, isLoading: typesLoading } = useSWR<LoanType[]>(
    "loans/types",
    () => loansApi.listTypes()
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      loanTypeCode: "",
      amount: 5000,
      termMonths: 12,
      purpose: "",
    },
  });

  const values = watch();
  const selectedType = loanTypes?.find((t) => t.code === values.loanTypeCode);

  function computePreview() {
    if (!selectedType || !values.amount || !values.termMonths) return null;
    const monthlyRate = selectedType.baseInterestRate / 100 / 12;
    const n = values.termMonths;
    const P = values.amount;
    const monthly =
      monthlyRate === 0
        ? P / n
        : (P * monthlyRate * Math.pow(1 + monthlyRate, n)) /
          (Math.pow(1 + monthlyRate, n) - 1);
    const total = monthly * n;
    return {
      monthly: Number(monthly.toFixed(4)),
      total: Number(total.toFixed(4)),
      interest: Number((total - P).toFixed(4)),
    };
  }

  const preview = computePreview();

  function next(e?: React.MouseEvent<HTMLButtonElement>) {
    // Explicitly prevent the click's default action.
    e?.preventDefault();

    if (step === 0 && !values.loanTypeCode) {
      setFormError("Please select a loan type");
      return;
    }
    setFormError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    setFormError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: ApplyFormData) {
    // Guard: only submit from the final step.
    // Prevents Enter-key presses on intermediate inputs from firing the request.
    if (step !== STEPS.length - 1) {
      next();
      return;
    }

    setFormError(null);
    try {
      const loan = await loansApi.apply({
        loanTypeCode: data.loanTypeCode,
        amount: data.amount,
        termMonths: data.termMonths,
        purpose: data.purpose,
      });
      toast.success("Application submitted", "Your loan is under review");
      router.replace(`/loans/${loan.id}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormError(error.message);
      } else {
        setFormError("Could not submit your application. Please try again.");
      }
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <ol className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((s, idx) => {
          const isActive = idx === step;
          const isComplete = idx < step;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium ${
                  isComplete
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className="h-px w-8 bg-muted" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      {formError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Form contains only inputs — navigation buttons live outside */}
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <CardContent className="space-y-6 py-6">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="loanTypeCode">Loan Type</Label>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Select the type of loan you want to apply for.
                  </p>
                  {typesLoading ? (
                    <Spinner />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {loanTypes?.map((type) => (
                        <button
                          key={type.code}
                          type="button"
                          onClick={() => {
                            setValue("loanTypeCode", type.code);
                            setValue("amount", type.minAmount);
                            setValue("termMonths", type.minTermMonths);
                          }}
                          className={`rounded-md border p-4 text-left transition-colors ${
                            values.loanTypeCode === type.code
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground/50"
                          }`}
                        >
                          <p className="text-sm font-medium">{type.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {type.baseInterestRate}% APR
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(type.minAmount)} –{" "}
                            {formatCurrency(type.maxAmount)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 1 && selectedType && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={selectedType.minAmount}
                    max={selectedType.maxAmount}
                    step="100"
                    {...register("amount", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Min {formatCurrency(selectedType.minAmount)} — Max{" "}
                    {formatCurrency(selectedType.maxAmount)}
                  </p>
                  {errors.amount && (
                    <p className="text-sm text-destructive">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termMonths">Term (months)</Label>
                  <Input
                    id="termMonths"
                    type="number"
                    min={selectedType.minTermMonths}
                    max={selectedType.maxTermMonths}
                    step="1"
                    {...register("termMonths", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Min {selectedType.minTermMonths} — Max{" "}
                    {selectedType.maxTermMonths}
                  </p>
                  {errors.termMonths && (
                    <p className="text-sm text-destructive">
                      {errors.termMonths.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose (optional)</Label>
                  <Input
                    id="purpose"
                    type="text"
                    placeholder="Briefly describe the loan purpose"
                    {...register("purpose")}
                  />
                </div>

                {preview && (
                  <div className="rounded-md border bg-muted/30 p-4">
                    <p className="mb-3 text-sm font-medium">
                      Estimated Payment
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(preview.monthly)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Total Interest
                        </p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(preview.interest)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Total Payable
                        </p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(preview.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && selectedType && preview && (
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <p className="mb-4 text-sm font-medium">
                    Review your application
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Loan type</span>
                      <span className="font-medium">{selectedType.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">
                        {formatCurrency(values.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Term</span>
                      <span className="font-medium">
                        {values.termMonths} months
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">
                        Interest rate
                      </span>
                      <span className="font-medium">
                        {selectedType.baseInterestRate}%
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">
                        Monthly payment
                      </span>
                      <span className="font-medium">
                        {formatCurrency(preview.monthly)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-muted-foreground">
                        Total payable
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(preview.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {values.purpose && (
                  <div className="rounded-md border p-4">
                    <p className="mb-2 text-sm font-medium">Purpose</p>
                    <p className="text-sm text-muted-foreground">
                      {values.purpose}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Navigation buttons outside the form */}
      <div className="mt-6 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={back}
          disabled={step === 0 || isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button key="next-btn" type="button" onClick={next}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            key="submit-btn"
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                <span>Submitting...</span>
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
