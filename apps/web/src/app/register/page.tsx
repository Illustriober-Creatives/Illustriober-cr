"use client";

import type { RegisterInput } from "@illustriober/shared";
import { registerSchema } from "@illustriober/shared";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { FormInput } from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";

type RegisterFieldErrors = Partial<Record<keyof RegisterInput, string>> & {
  confirmPassword?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse({
      email,
      password,
      firstName,
      lastName,
    });
    const nextFieldErrors: RegisterFieldErrors = parsed.success
      ? {}
      : {
          email: parsed.error.flatten().fieldErrors.email?.[0],
          password: parsed.error.flatten().fieldErrors.password?.[0],
          firstName: parsed.error.flatten().fieldErrors.firstName?.[0],
          lastName: parsed.error.flatten().fieldErrors.lastName?.[0],
        };

    if (confirmPassword !== password) {
      nextFieldErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await register({ email, password, firstName, lastName });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
          <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-accent/5 rounded-full blur-3xl dark:opacity-100 light:opacity-50" />
          <div className="absolute -top-20 -right-20 h-60 w-60 bg-accent/3 rounded-full blur-3xl dark:opacity-75 light:opacity-30" />
        </div>
        <Container className="relative z-10">
          <div className="max-w-xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Create <span className="text-accent italic">Account</span>
            </h1>
            <p className="text-foreground/60">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
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

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  type="text"
                  label="First name"
                  name="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors((current) => ({
                      ...current,
                      firstName: undefined,
                    }));
                  }}
                  required
                  autoComplete="given-name"
                  disabled={submitting}
                  error={fieldErrors.firstName}
                />
                <FormInput
                  type="text"
                  label="Last name"
                  name="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setFieldErrors((current) => ({
                      ...current,
                      lastName: undefined,
                    }));
                  }}
                  required
                  autoComplete="family-name"
                  disabled={submitting}
                  error={fieldErrors.lastName}
                />
              </div>

              <FormInput
                type="email"
                label="Email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((current) => ({ ...current, email: undefined }));
                }}
                required
                autoComplete="email"
                disabled={submitting}
                error={fieldErrors.email}
              />

              <FormInput
                type="password"
                label="Password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    password: undefined,
                    confirmPassword: undefined,
                  }));
                }}
                required
                autoComplete="new-password"
                helperText="At least 8 characters"
                disabled={submitting}
                error={fieldErrors.password}
              />

              <FormInput
                type="password"
                label="Confirm password"
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    confirmPassword: undefined,
                  }));
                }}
                required
                autoComplete="new-password"
                disabled={submitting}
                error={fieldErrors.confirmPassword}
              />

              <div className="text-xs text-foreground/50">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-accent hover:text-accent/80">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-accent hover:text-accent/80">
                  Privacy Policy
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full rounded-lg"
                disabled={submitting}
              >
                {submitting ? "Creating account..." : "Create account"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background dark:bg-black light:bg-white px-2 text-foreground/50">
                    Or sign up with
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
