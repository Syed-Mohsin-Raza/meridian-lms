import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  className?: string;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: KpiCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs",
                  trend.direction === "up" ? "text-emerald-600" : "text-red-600"
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className="rounded-md bg-muted p-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
