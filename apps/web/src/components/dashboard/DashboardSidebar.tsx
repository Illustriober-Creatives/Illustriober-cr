"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, type LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  navItems: DashboardNavItem[];
  eyebrow: string;
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
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

export function DashboardSidebar({
  navItems,
  eyebrow,
  isOpen,
  onClose,
  collapsed,
  onToggleCollapsed,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const allHrefs = navItems.map((item) => item.href);

  function renderSidebarContent(onNavigate?: () => void, isCollapsed = false, showCollapseToggle = false) {
    return (
      <>
        <Link
          href="/"
          className={`mb-8 flex items-center gap-2.5 px-2 ${isCollapsed ? "justify-center px-0" : ""}`}
          onClick={onNavigate}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent font-display text-lg font-bold text-foreground">
            il
          </span>
          {!isCollapsed && <span className="text-sm font-bold tracking-tight text-foreground">Illustriober</span>}
        </Link>

        {!isCollapsed && (
          <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        )}

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isNavItemActive(pathname, href, allHrefs);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                title={isCollapsed ? label : undefined}
                aria-label={isCollapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  isCollapsed ? "justify-center px-0" : "px-3"
                } ${active ? "bg-accent/10 text-accent" : "text-foreground/60 hover:bg-glass-bg hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && label}
              </Link>
            );
          })}
        </nav>

        {showCollapseToggle && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mt-4 flex items-center gap-2 rounded-lg border-t border-glass-border pt-4 text-xs font-medium text-foreground/50 transition-colors hover:text-foreground ${
              isCollapsed ? "justify-center" : "px-2"
            }`}
          >
            {isCollapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                Collapse
              </>
            )}
          </button>
        )}
      </>
    );
  }

  return (
    <>
      {/* Desktop sidebar: static, visible at md: and up. Width transitions on
          collapse so the flex-1 content column resizes with it — no
          scrollbars or dead space, just less horizontal room. */}
      <aside
        className={`hidden shrink-0 flex-col overflow-hidden border-r border-glass-border bg-surface py-8 transition-[width] duration-200 ease-in-out md:flex ${
          collapsed ? "w-[4.5rem] px-3" : "w-60 px-4"
        }`}
      >
        {renderSidebarContent(undefined, collapsed, true)}
      </aside>

      {/* Mobile drawer: slide-in panel + backdrop, only relevant below md: */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-60 flex-col border-r border-glass-border bg-surface px-4 py-8 shadow-xl">
            {renderSidebarContent(onClose, false)}
          </aside>
        </div>
      )}
    </>
  );
}
