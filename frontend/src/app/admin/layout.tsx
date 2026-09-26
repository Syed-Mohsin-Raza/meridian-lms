import { AuthGuard } from "@/components/layout/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["ADMIN", "EMPLOYEE"]}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
