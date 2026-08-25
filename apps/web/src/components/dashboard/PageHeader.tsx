"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const PAGE_HEADER_SLOT_ID = "dashboard-page-header-slot";

interface PageHeaderProps {
  title: ReactNode;
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
}

/**
 * Portals a compact title (+ optional back link / action) into the shell's
 * persistent header bar, so navigation and the current page name are always
 * visible at the top instead of leaving that bar empty. Each page mounts one
 * of these; the slot lives in DashboardShell and outlives page navigation.
 */
export function PageHeader({ title, backHref, backLabel, action }: PageHeaderProps) {
  // Auth guards (AdminGuard/ProtectedRoute) render a loading state first, so
  // DashboardShell's slot div and this component can both mount for the
  // first time in the same render pass — before either is committed to the
  // real DOM. A lazy useState initializer would run during that pre-commit
  // render and find nothing; this needs an effect, which fires after commit.
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlot(document.getElementById(PAGE_HEADER_SLOT_ID));
  }, []);

  if (!slot) return null;

  return createPortal(
    <div className="flex w-full min-w-0 items-center justify-between gap-4">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="group mb-0.5 flex items-center gap-1 text-xs font-medium text-foreground/50 transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            {backLabel ?? "Back"}
          </Link>
        )}
        <h1 className="truncate text-base font-bold text-foreground md:text-lg">{title}</h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>,
    slot
  );
}
