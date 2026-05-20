"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { FormInput } from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";

type PageState = "loading" | "valid" | "invalid" | "expired" | "submitting" | "done";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { refreshSession } = useAuth();

  const [state, setState] = useState<PageState>("loading");
  const [inviteEmail, setInviteEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/invites/${params.token}`);
        if (res.status === 404) { setState("invalid"); return; }
        if (res.status === 410) { setState("expired"); return; }
        if (!res.ok) { setState("invalid"); return; }
        const data = await res.json();
        setInviteEmail(data.email);
        setState("valid");
      } catch {
        setState("invalid");
      }
    }
    validateToken();
  }, [params.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setState("submitting");
    try {
      const res = await fetch(`/api/invites/${params.token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setState("valid");
        return;
      }

      // Persist the token so refreshSession() can load the user profile
      sessionStorage.setItem("illustriober_access_token", data.accessToken);
      await refreshSession();
      setState("done");
      router.replace("/dashboard");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setState("valid");
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="flex items-center justify-center page-small">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/60 text-sm">Validating your invitation…</p>
        </div>
      </div>
    );
  }

  // ── Invalid ────────────────────────────────────────────────────────────────
  if (state === "invalid" || state === "expired") {
    return (
      <div className="page-small">
        <section className="relative overflow-hidden section-lg">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 bg-accent/5 rounded-full blur-3xl" />
          </div>
          <Container className="relative z-10">
            <div className="max-w-xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Invite{" "}
                <span className="text-accent italic">
                  {state === "expired" ? "Expired" : "Invalid"}
                </span>
              </h1>
              <p className="text-foreground/60 mb-8">
                {state === "expired"
                  ? "This invitation link has expired or has already been used."
                  : "This invitation link is not valid."}
              </p>
              <Link
                href="/login"
                className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
              >
                Go to login
              </Link>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="page-small">
      <section className="relative overflow-hidden section-lg">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 bg-accent/5 rounded-full blur-3xl dark:opacity-100 light:opacity-50" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 bg-accent/3 rounded-full blur-3xl dark:opacity-75 light:opacity-30" />
        </div>
        <Container className="relative z-10">
          <div className="max-w-xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Welcome to{" "}
              <span className="text-accent italic">Illustriober</span>
            </h1>
            <p className="text-foreground/60">
              You&apos;ve been invited.{" "}
              {inviteEmail && (
                <span>
                  Set up your account for{" "}
                  <strong className="text-foreground">{inviteEmail}</strong>.
                </span>
              )}
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
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  disabled={state === "submitting"}
                />
                <FormInput
                  type="text"
                  label="Last name"
                  name="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  disabled={state === "submitting"}
                />
              </div>

              <FormInput
                type="password"
                label="Password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={state === "submitting"}
              />

              <FormInput
                type="password"
                label="Confirm password"
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={state === "submitting"}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full rounded-lg"
                disabled={state === "submitting"}
              >
                {state === "submitting" ? "Creating your account…" : "Activate account"}
              </Button>
            </form>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
