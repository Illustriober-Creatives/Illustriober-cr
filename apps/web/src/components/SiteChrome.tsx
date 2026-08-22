"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const CHROME_LESS_PREFIXES = ["/dashboard", "/admin"];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = CHROME_LESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
