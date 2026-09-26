"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { FullPageSpinner } from "@/components/ui/spinner";

interface AuthGuardProps {
  allowedRoles: Array<"ADMIN" | "EMPLOYEE" | "CUSTOMER">;
  children: React.ReactNode;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const target = user.role === "CUSTOMER" ? "/dashboard" : "/admin";
      router.replace(target);
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

  // Show spinner while checking; render nothing once redirected
  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated || !user) return <FullPageSpinner />;
  if (!allowedRoles.includes(user.role)) return <FullPageSpinner />;

  return <>{children}</>;
}
