"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { LoanTypeBreakdown } from "@/types/analytics";

interface LoanTypesTableProps {
  data: LoanTypeBreakdown[];
}

export function LoanTypesTable({ data }: LoanTypesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Type Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Total Disbursed</TableHead>
                <TableHead className="text-right">Approval Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.code}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">{row.count}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(row.total))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(row.approvalRate * 100)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
