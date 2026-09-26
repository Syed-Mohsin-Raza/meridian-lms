// TODO: Support partial payments once the backend's
// PaymentService respects PaymentRequest.amount. Requires a
// Payment.amountPaid column and PARTIAL status transitions.

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Wallet } from "lucide-react";
import { paymentsApi } from "@/lib/api/payments";
import { ApiClientError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Payment } from "@/types/payment";

const METHODS = [
  { value: "card", label: "Credit / Debit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "mobile_wallet", label: "Mobile Wallet" },
] as const;

const paySchema = z.object({
  paymentMethod: z.string().min(1, "Select a payment method"),
});

type PayFormData = z.infer<typeof paySchema>;

interface PayDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PayDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: PayDialogProps) {
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PayFormData>({
    resolver: zodResolver(paySchema),
    defaultValues: {
      paymentMethod: "card",
    },
  });

  async function onSubmit(data: PayFormData) {
    if (!payment) return;
    setFormError(null);
    try {
      await paymentsApi.pay({
        paymentId: payment.id,
        paymentMethod: data.paymentMethod,
        idempotencyKey: crypto.randomUUID(),
        amount: Number(payment.amount),
      });
      toast.success("Payment recorded", "Your loan balance has been updated");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormError(error.message);
      } else {
        setFormError("Could not record the payment. Please try again.");
      }
    }
  }

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Pay installment #{payment.installmentNumber} due on{" "}
            {formatDate(payment.dueDate)}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                {...register("paymentMethod")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="text-sm text-destructive">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 text-sm font-medium">
                {formatCurrency(Number(payment.amount))}
              </div>
              <p className="text-xs text-muted-foreground">
                Partial payments are not yet supported. The full installment
                amount will be recorded.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  <span>Record Payment</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
