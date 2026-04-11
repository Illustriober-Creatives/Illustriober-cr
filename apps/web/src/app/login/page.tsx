"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors";

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
    <div className="flex flex-col w-full bg-surface-950 min-h-[70vh]">
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 bg-orange-500/10 rounded-full blur-3xl" />
        </div>
        <Container className="relative z-10">
          <div className="max-w-xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Client <span className="text-orange-500">portal</span>
            </h1>
            <p className="text-zinc-400">
              Sign in to access your dashboard. New here?{" "}
              <Link
                href="/register"
                className="text-orange-500 hover:text-orange-400 underline underline-offset-4"
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
                <p
                  className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-3"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full rounded-xl"
                disabled={submitting || authLoading}
              >
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
