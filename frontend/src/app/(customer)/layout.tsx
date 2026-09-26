import { AuthGuard } from "@/components/layout/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["CUSTOMER"]}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
