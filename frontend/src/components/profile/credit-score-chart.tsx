"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/format";

interface ScorePoint {
  date: string;
  score: number;
  reason: string;
}

interface CreditScoreChartProps {
  points: ScorePoint[];
}

export function CreditScoreChart({ points }: CreditScoreChartProps) {
  if (points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="No credit history yet"
            description="Your score changes will appear here as you take out and repay loans."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Score History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={points}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatDate(value)}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                domain={["dataMin - 20", "dataMax + 20"]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip
                formatter={(value) => {
                  const score = typeof value === "number" ? value : 0;
                  return [`Score: ${score}`, ""];
                }}
                labelFormatter={(label) => formatDate(String(label))}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
