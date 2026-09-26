"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Wallet,
  User as UserIcon,
  Users,
  BarChart3,
  UserCog,
  Home,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import type { UserRole } from "@/types/auth";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  // Customer
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["CUSTOMER"],
  },
  {
    label: "My Loans",
    href: "/loans",
    icon: FileText,
    roles: ["CUSTOMER"],
  },
  {
    label: "Payments",
    href: "/payments",
    icon: Wallet,
    roles: ["CUSTOMER"],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: UserIcon,
    roles: ["CUSTOMER"],
  },
  // Admin / Employee
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    label: "Loans",
    href: "/admin/loans",
    icon: FileText,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    label: "Employees",
    href: "/admin/employees",
    icon: UserCog,
    roles: ["ADMIN"],
  },
];

interface AppSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <nav
      className={cn("flex flex-col gap-1 p-4", className)}
      aria-label="Main navigation"
    >
      <Link
        href={user.role === "CUSTOMER" ? "/dashboard" : "/admin"}
        className="mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        onClick={onNavigate}
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>

      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/admin" &&
            pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
