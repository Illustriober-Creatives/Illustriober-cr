"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span aria-hidden="true" className="h-9 w-9 animate-pulse rounded-full bg-[#F4EFE5]" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-[#F4EFE5] text-[#171717] transition-transform hover:-translate-y-0.5"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      type="button"
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
