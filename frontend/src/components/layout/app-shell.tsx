"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showMobileMenu onMenuClick={() => setMobileOpen(true)} />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 border-r bg-background lg:block">
          <AppSidebar className="sticky top-16" />
        </aside>

        {/* Mobile sidebar drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside
              className={cn(
                "fixed left-0 top-0 z-50 h-full w-64 border-r bg-background",
                "animate-in slide-in-from-top"
              )}
            >
              <div className="flex h-16 items-center justify-end border-b px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <AppSidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
