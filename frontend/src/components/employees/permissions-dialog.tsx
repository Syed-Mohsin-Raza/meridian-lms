"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { employeesApi } from "@/lib/api/employees";
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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { Employee } from "@/types/employee";

/**
 * Known permission codes — should match backend's Permission table seeds.
 * In Phase 7, replace this with a GET /api/v1/permissions endpoint.
 */
const AVAILABLE_PERMISSIONS: {
  code: string;
  label: string;
  description: string;
}[] = [
  {
    code: "manage_loans",
    label: "Manage Loans",
    description: "View, assign, and update loan applications",
  },
  {
    code: "approve_loans",
    label: "Approve Loans",
    description: "Approve or reject loan decisions",
  },
  {
    code: "manage_payments",
    label: "Manage Payments",
    description: "Record payments and apply late fees",
  },
  {
    code: "view_analytics",
    label: "View Analytics",
    description: "Access the analytics dashboard",
  },
  {
    code: "manage_customers",
    label: "Manage Customers",
    description: "Suspend or activate customer accounts",
  },
];

interface PermissionsDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PermissionsDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: PermissionsDialogProps) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(new Set(employee.permissions));
      setFormError(null);
    }
  }, [open, employee]);

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function submit() {
    setSubmitting(true);
    setFormError(null);
    try {
      // Backend's UpdatePermissionsRequest expects permission codes.
      await employeesApi.updatePermissions(employee.id, {
        permissions: Array.from(selected),
      });
      toast.success("Permissions updated", employee.email);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormError(error.message);
      } else {
        setFormError("Could not update permissions. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Permissions</DialogTitle>
          <DialogDescription>
            Manage what {employee.fullName} can do in the admin panel.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-2">
          {AVAILABLE_PERMISSIONS.map((permission) => {
            const isSelected = selected.has(permission.code);
            return (
              <button
                key={permission.code}
                type="button"
                onClick={() => toggle(permission.code)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/50"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{permission.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {permission.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Permissions"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
