/**
 * Thank You Page
 * Displayed after successful enquiry submission
 */

import { Suspense } from "react";
import { createMetadata } from "@/lib/seo";
import { ThankYouContent } from "./ThankYouContent";

export const metadata = createMetadata({
  title: "Thank You",
  description: "Illustriober enquiry submission confirmation page.",
  path: "/thank-you",
  noIndex: true,
});

function ThankYouFallback() {
  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-var(--navbar-height))]">
      <section className="relative overflow-hidden section-xl flex-1 flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 bg-accent/5 rounded-full blur-3xl dark:opacity-100 light:opacity-50" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-accent/3 rounded-full blur-3xl dark:opacity-75 light:opacity-40" />
        </div>
      </section>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<ThankYouFallback />}>
      <ThankYouContent />
    </Suspense>
  );
}
