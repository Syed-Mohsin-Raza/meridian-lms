"use client";

import { useState } from "react";
import useSWR from "swr";
import { AlertCircle, Users, UserX, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { usePagination } from "@/lib/hooks/use-pagination";
import { customersApi } from "@/lib/api/customers";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
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
import type { Customer, CustomerFilter } from "@/types/customer";
import type { Page } from "@/types/api";

export default function AdminCustomersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { page, size, setPage, setSize } = usePagination({
    defaultSort: "createdAt,desc",
  });
  const toast = useToast();
  const [pendingAction, setPendingAction] = useState<number | null>(null);

  const filter: CustomerFilter = { page, size, sort: "createdAt,desc" };

  const {
    data: pageData,
    error,
    isLoading: dataLoading,
    mutate,
  } = useSWR<Page<Customer>>(
    user ? `admin/customers/${JSON.stringify(filter)}` : null,
    () => customersApi.list(filter),
    { revalidateOnFocus: false }
  );

  async function toggleSuspend(customer: Customer) {
    setPendingAction(customer.id);
    try {
      if (customer.status === "ACTIVE") {
        await customersApi.suspend(customer.id);
        toast.success("Customer suspended", customer.email);
      } else {
        await customersApi.activate(customer.id);
        toast.success("Customer activated", customer.email);
      }
      mutate();
    } catch {
      toast.error("Action failed", "Could not update customer status");
    } finally {
      setPendingAction(null);
    }
  }

  const isLoading = authLoading || dataLoading;
  if (isLoading) return <FullPageSpinner />;
  if (!user || user.role === "CUSTOMER") return null;

  const customers = pageData?.content ?? [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        title="Customers"
        description="View and manage customer accounts."
      />

      <div className="mt-8">
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load customers"
            description="There was a problem loading the customer list."
          />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Customers will appear here after they register."
          />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Credit Score</TableHead>
                    {/* <TableHead className="text-right">Total Loans</TableHead> */}
                    {/* <TableHead className="text-right">Active</TableHead> */}
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="hover:underline"
                        >
                          {customer.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.email}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {customer.creditScore}
                      </TableCell>
                      {/* <TableCell className="text-right">
                        {formatNumber(customer.totalLoans)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(customer.activeLoans)}
                      </TableCell> */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(USER_STATUS_STYLES[customer.status])}
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pendingAction === customer.id}
                          onClick={() => toggleSuspend(customer)}
                        >
                          {customer.status === "ACTIVE" ? (
                            <>
                              <UserX className="h-3.5 w-3.5" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              Activate
                            </>
                          )}
                        </Button>
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
    </div>
  );
}
