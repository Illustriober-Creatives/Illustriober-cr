"use client";

import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar, type DashboardNavItem } from "./DashboardSidebar";

interface DashboardShellProps {
  navItems: DashboardNavItem[];
  eyebrow: string;
  children: ReactNode;
}

export function DashboardShell({ navItems, eyebrow, children }: DashboardShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar navItems={navItems} eyebrow={eyebrow} />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-glass-border bg-surface px-6 py-4 md:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
            <p className="mt-0.5 text-sm text-foreground/60">
              {user ? `Welcome, ${user.firstName}` : "Welcome"}
            </p>
          </div>
          <button
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
            type="button"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
