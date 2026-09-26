"use client";

import Link from "next/link";
import { Building2, Menu } from "lucide-react";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function AppHeader({ onMenuClick, showMobileMenu }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {showMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Building2 className="h-5 w-5" />
          <span className="hidden sm:inline">Meridian</span>
        </Link>

        <div className="flex-1" />

        <UserMenu />
      </div>
    </header>
  );
}
