"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, Ticket, User } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";

const CLIENT_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tickets", label: "Support Tickets", icon: Ticket },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell navItems={CLIENT_NAV} eyebrow="Client" profileHref="/dashboard/profile">
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
