"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";
import type { LoanTypeBreakdown } from "@/types/analytics";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

interface LoanTypesChartProps {
  data: LoanTypeBreakdown[];
}

export function LoanTypesChart({ data }: LoanTypesChartProps) {
  const nonEmpty = data.filter((d) => d.count > 0);

  if (nonEmpty.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loans by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="No loan data yet"
            description="Distribution by loan type will appear here once loans are submitted."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loans by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nonEmpty}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
                label={(entry) => {
                  const payload = entry.payload as {
                    name: string;
                    count: number;
                  };
                  return `${payload.name}: ${payload.count}`;
                }}
                labelLine={false}
              >
                {nonEmpty.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} loans`, ""]}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
