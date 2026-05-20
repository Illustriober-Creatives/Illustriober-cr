"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tickets", label: "Tickets" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside className="flex h-full w-56 flex-col border-r border-glass-border bg-surface px-4 py-8">
      <p className="mb-8 text-xs font-bold uppercase tracking-widest text-accent">
        Admin
      </p>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-foreground/60 hover:bg-glass-bg hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => void handleLogout()}
        className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-foreground/40 transition-colors hover:bg-glass-bg hover:text-foreground/80"
      >
        Sign out
      </button>
    </aside>
  );
}
