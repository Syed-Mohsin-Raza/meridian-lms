"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageSpinner } from "@/components/ui/spinner";
import { CreditScoreChart } from "@/components/profile/credit-score-chart";
import { formatDate } from "@/lib/format";
import { Mail, Phone, User as UserIcon, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (!user) return null;

  // Placeholder — Phase 7 will fetch real score history from a
  // dedicated /api/v1/auth/me/credit-history endpoint.
  const scoreHistory = [
    { date: user.createdAt, score: user.creditScore, reason: "Initial score" },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Profile"
        description="Your personal information and credit profile."
      />

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Full name</p>
                <p className="text-sm font-medium">{user.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm font-medium">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold">{user.creditScore}</span>
              <span className="text-sm text-muted-foreground">
                of 850 maximum
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Your credit score changes based on your loan activity and payment
              history.
            </p>
          </CardContent>
        </Card>

        <CreditScoreChart points={scoreHistory} />
      </div>
    </div>
  );
}
