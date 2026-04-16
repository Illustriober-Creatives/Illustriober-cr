import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Start a Project",
  description:
    "Tell Illustriober about your product, platform, or brand build and get a response from the studio.",
  path: "/enquiry",
});

export default function EnquiryLayout({ children }: { children: ReactNode }) {
  return children;
}
