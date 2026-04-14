"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { FormInput } from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-background min-h-[70vh]">
      {/* Premium Header Section with theme-aware gradient */}
      <section className="relative overflow-hidden bg-background pt-32 pb-16 lg:pt-48 lg:pb-24">
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs - theme responsive */}
          <div className="absolute -top-40 -right-40 h-80 w-80 bg-accent/5 rounded-full blur-3xl dark:opacity-100 light:opacity-50" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 bg-accent/3 rounded-full blur-3xl dark:opacity-75 light:opacity-30" />
        </div>
        <Container className="relative z-10">
          <div className="max-w-xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Client <span className="text-accent italic">Portal</span>
            </h1>
            <p className="text-foreground/60">
              Sign in to access your dashboard. New here?{" "}
              <Link
                href="/register"
                className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
              >
                Create an account
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <SectionWrapper>
        <Container>
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 dark:bg-red-950/40 dark:border-red-900/50 light:bg-red-50 light:border-red-200 rounded-lg px-4 py-3"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <FormInput
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={submitting}
              />

              <FormInput
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={submitting}
              />

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/forgot-password"
                  className="text-accent hover:text-accent/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full rounded-lg"
                disabled={submitting}
              >
                {submitting ? "Signing in..." : "Sign in"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background dark:bg-black light:bg-white px-2 text-foreground/50">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="rounded-lg"
                  disabled={submitting}
                >
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="rounded-lg"
                  disabled={submitting}
                >
                  Google
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
