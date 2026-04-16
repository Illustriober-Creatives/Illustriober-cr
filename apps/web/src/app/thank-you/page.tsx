/**
 * Thank You Page
 * Displayed after successful enquiry submission
 */

import { Suspense } from "react";
import { ThankYouContent } from "./ThankYouContent";

function ThankYouFallback() {
  return (
    <main className="flex flex-col w-full bg-background min-h-screen">
      <section className="relative overflow-hidden bg-background py-20 lg:py-32 flex-1 flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 bg-accent/5 rounded-full blur-3xl dark:opacity-100 light:opacity-50" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-accent/3 rounded-full blur-3xl dark:opacity-75 light:opacity-40" />
        </div>
      </section>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<ThankYouFallback />}>
      <ThankYouContent />
    </Suspense>
  );
}
