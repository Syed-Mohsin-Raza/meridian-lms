"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { FullPageSpinner } from "@/components/ui/spinner";

export default function HomePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role === "ADMIN" || user.role === "EMPLOYEE") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <FullPageSpinner />;
}
