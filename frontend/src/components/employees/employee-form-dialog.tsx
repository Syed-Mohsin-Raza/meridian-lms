"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { employeesApi } from "@/lib/api/employees";
import { ApiClientError } from "@/lib/api/client";
import {
  PasswordStrength,
  isPasswordStrong,
} from "@/components/auth/password-strength";
import { strongPasswordSchema } from "@/lib/validators/password";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const createSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(20).optional().or(z.literal("")),
  password: strongPasswordSchema,
});

type CreateFormData = z.infer<typeof createSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: EmployeeFormDialogProps) {
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
      setFieldErrors({});
    }
  }, [open, reset]);

  async function onSubmit(data: CreateFormData) {
    setFormError(null);
    setFieldErrors({});
    try {
      await employeesApi.create({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      });
      toast.success("Employee created", `${data.fullName} can now sign in`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.isValidationError() && error.fieldErrors) {
          setFieldErrors(error.fieldErrors);
          setFormError("Please correct the errors below.");
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("Could not create employee. Please try again.");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Create a staff account. Permissions can be granted separately.
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register("fullName")} />
              {(errors.fullName || fieldErrors.fullName) && (
                <p className="text-sm text-destructive">
                  {errors.fullName?.message ?? fieldErrors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {(errors.email || fieldErrors.email) && (
                <p className="text-sm text-destructive">
                  {errors.email?.message ?? fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              <PasswordStrength password={watch("password") ?? ""} />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
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
            <Button
              type="submit"
              disabled={
                isSubmitting || !isPasswordStrong(watch("password") ?? "")
              }
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Creating...</span>
                </>
              ) : (
                "Create Employee"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
