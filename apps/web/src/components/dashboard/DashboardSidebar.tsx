"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  navItems: DashboardNavItem[];
  eyebrow: string;
}

function isNavItemActive(pathname: string, href: string, allHrefs: string[]): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  return !allHrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      (pathname === other || pathname.startsWith(`${other}/`))
  );
}

export function DashboardSidebar({ navItems, eyebrow }: DashboardSidebarProps) {
  const pathname = usePathname();
  const allHrefs = navItems.map((item) => item.href);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-glass-border bg-surface px-4 py-8">
      <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-display text-lg font-bold text-foreground">
          il
        </span>
        <span className="text-sm font-bold tracking-tight text-foreground">Illustriober</span>
      </Link>

      <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(pathname, href, allHrefs);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-foreground/60 hover:bg-glass-bg hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
