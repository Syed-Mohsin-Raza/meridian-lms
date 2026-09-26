"use client";

import { useState } from "react";
import useSWR from "swr";
import { AlertCircle, UserCog, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { usePagination } from "@/lib/hooks/use-pagination";
import { employeesApi } from "@/lib/api/employees";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { USER_STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { PermissionsDialog } from "@/components/employees/permissions-dialog";
import type { Employee } from "@/types/employee";
import type { Page } from "@/types/api";

export default function AdminEmployeesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { page, size, setPage, setSize } = usePagination();
  const toast = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [permissionsTarget, setPermissionsTarget] = useState<Employee | null>(
    null
  );

  const {
    data: pageData,
    error,
    isLoading: dataLoading,
    mutate,
  } = useSWR<Page<Employee>>(
    user && user.role === "ADMIN" ? `employees/${page}/${size}` : null,
    () => employeesApi.list(page, size),
    { revalidateOnFocus: false }
  );

  const isLoading = authLoading || dataLoading;
  if (isLoading) return <FullPageSpinner />;
  if (!user || user.role !== "ADMIN") return null;

  const employees = pageData?.content ?? [];

  function handleDeactivate(employee: Employee) {
    // Simple confirm for now; upgrade to a Dialog in Phase 7
    if (!window.confirm(`Deactivate ${employee.fullName}?`)) return;

    employeesApi
      .deactivate(employee.id)
      .then(() => {
        toast.success("Employee deactivated", employee.email);
        mutate();
      })
      .catch(() => {
        toast.error("Action failed", "Could not deactivate employee");
      });
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        title="Employees"
        description="Manage staff accounts and their permissions."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        }
      />

      <div className="mt-8">
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load employees"
            description="There was a problem loading the employee list."
          />
        ) : employees.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="No employees yet"
            description="Add your first employee to grant them staff access."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            }
          />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">
                        {emp.fullName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {emp.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {emp.permissions.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          ) : (
                            emp.permissions.map((code) => (
                              <Badge
                                key={code}
                                variant="secondary"
                                className="text-xs"
                              >
                                {code}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(USER_STATUS_STYLES[emp.status])}
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(emp.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPermissionsTarget(emp)}
                          >
                            Permissions
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivate(emp)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={pageData?.totalPages ?? 0}
              totalElements={pageData?.totalElements ?? 0}
              pageSize={size}
              onPageChange={setPage}
              onPageSizeChange={setSize}
              className="mt-4"
            />
          </>
        )}
      </div>

      <EmployeeFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => mutate()}
      />

      {permissionsTarget && (
        <PermissionsDialog
          employee={permissionsTarget}
          open={Boolean(permissionsTarget)}
          onOpenChange={(open: boolean) => !open && setPermissionsTarget(null)}
          onSuccess={() => {
            setPermissionsTarget(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}
