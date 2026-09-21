import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Illustriober client dashboard.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
