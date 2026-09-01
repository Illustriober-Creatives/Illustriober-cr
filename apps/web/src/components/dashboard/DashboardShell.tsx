"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { DashboardSidebar, type DashboardNavItem } from "./DashboardSidebar";
import { ProfileMenu } from "./ProfileMenu";
import { PAGE_HEADER_SLOT_ID } from "./PageHeader";

export type { DashboardNavItem };

const SIDEBAR_COLLAPSED_KEY = "illustriober_sidebar_collapsed";

interface DashboardShellProps {
  navItems: DashboardNavItem[];
  eyebrow: string;
  profileHref: string;
  children: ReactNode;
}

export function DashboardShell({ navItems, eyebrow, profileHref, children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"
  );

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <DashboardSidebar
        navItems={navItems}
        eyebrow={eyebrow}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-glass-border bg-surface px-6 py-3 md:px-8">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="flex shrink-0 items-center justify-center rounded-full border border-glass-border p-2 text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground md:hidden"
            type="button"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          {/* Populated by each page's <PageHeader>, so navigation + the current
              page name are always shown here instead of leaving this bar empty. */}
          <div id={PAGE_HEADER_SLOT_ID} className="min-w-0 flex-1" />
          <div className="shrink-0">
            <ProfileMenu profileHref={profileHref} />
          </div>
        </header>
        {/* data-app-shell opts this <main> out of the global marketing-navbar
            padding-top rule in globals.css. overflow-y-auto + min-h-0 together
            are load-bearing for the internal-scroll height model: min-h-0
            stops this flex item's min-height:auto from growing past the
            column's height, which is what lets overflow-y-auto actually
            scroll internally instead of the whole page scrolling. */}
        <main data-app-shell className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
