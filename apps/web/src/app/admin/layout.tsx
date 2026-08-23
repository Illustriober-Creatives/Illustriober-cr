"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, Mail, FolderKanban, Ticket, Users, ListTodo, Building2, User } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";

const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { href: "/admin/company", label: "Company", icon: Building2 },
  { href: "/admin/profile", label: "Profile", icon: User },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <DashboardShell navItems={ADMIN_NAV} eyebrow="Admin">
        {children}
      </DashboardShell>
    </AdminGuard>
  );
}
