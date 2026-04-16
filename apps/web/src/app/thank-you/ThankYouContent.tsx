"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { CheckCircle, Mail, Home, MessageSquare } from "lucide-react";

export function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!email) {
      router.push("/enquiry");
      return;
    }

    setIsCountingDown(true);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  return (
    <main className="flex flex-col w-full bg-background min-h-screen">
      {/* Thank You Section */}
      <section className="relative overflow-hidden bg-background py-20 lg:py-32 flex-1 flex items-center">
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 bg-accent/5 rounded-full blur-3xl dark:opacity-100 light:opacity-50" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-accent/3 rounded-full blur-3xl dark:opacity-75 light:opacity-40" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8 flex justify-center">
              <div className="p-4 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
            </div>

            {/* Main Message */}
            <h1 className="text-5xl md:text-6xl font-display font-semibold leading-tight tracking-tight mb-6 text-foreground">
              Thank You!
            </h1>

            <p className="text-xl text-foreground/70 mb-4">
              We&apos;ve received your inquiry and appreciate you getting in touch.
            </p>

            {/* Email Confirmation */}
            <div className="p-6 rounded-lg bg-accent-soft/20 border border-accent/20 mb-8 inline-block">
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="w-5 h-5 text-accent" />
                <p className="text-sm font-medium">
                  Confirmation sent to <span className="font-semibold">{email}</span>
                </p>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="space-y-6 mb-12">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-8">
                What Happens Next
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4 text-left">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 flex-shrink-0">
                    <span className="text-accent font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Review</h3>
                    <p className="text-foreground/60">
                      Our team will review your project details and requirements.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-left">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 flex-shrink-0">
                    <span className="text-accent font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Follow Up</h3>
                    <p className="text-foreground/60">
                      We typically respond to all inquiries within 24 hours during business days.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-left">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 flex-shrink-0">
                    <span className="text-accent font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Discussion</h3>
                    <p className="text-foreground/60">
                      Let&apos;s talk about your vision, timeline, and budget.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-lg"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Button>
              </Link>
              <Button
                onClick={() => window.location.href = "mailto:hello@illustriober.com"}
                variant="secondary"
                size="lg"
                className="rounded-lg"
              >
                <MessageSquare className="w-5 h-5" />
                Send us an Email
              </Button>
            </div>

            {/* Redirect Message */}
            <p className="text-sm text-foreground/50">
              Redirecting to home in {countdown} seconds...
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
