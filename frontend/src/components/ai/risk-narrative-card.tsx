"use client";

import { Brain, Info, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/format";
import type { CreditRiskNarrative } from "@/types/ai";

interface RiskNarrativeCardProps {
  narrative: CreditRiskNarrative | undefined;
  isLoading: boolean;
  error: Error | null;
  onRegenerate?: () => void;
}

export function RiskNarrativeCard({
  narrative,
  isLoading,
  error,
  onRegenerate,
}: RiskNarrativeCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Credit Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" />
            <span>Analyzing credit profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Credit Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={AlertTriangle}
            title="Could not load narrative"
            description="The AI service is unavailable. A loan officer should review the credit profile manually."
            action={
              onRegenerate ? (
                <Button variant="outline" size="sm" onClick={onRegenerate}>
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (!narrative) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Credit Risk Assessment
          </CardTitle>
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              aria-label="Regenerate narrative"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{narrative.narrative}</p>

        <div className="flex flex-wrap items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Info className="h-3 w-3" />
            {narrative.fallbackUsed ? "Template fallback" : narrative.model}
          </span>
          {narrative.cached && <span>· Cached</span>}
          <span>· Generated {formatDateTime(narrative.generatedAt)}</span>
        </div>

        <p className="text-xs text-muted-foreground/80">
          This is an automated assessment to support loan officer decisions. It
          is not a substitute for human review.
        </p>
      </CardContent>
    </Card>
  );
}
