"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { isAppRoute } from "@/lib/routes";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = isAppRoute(pathname);

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
