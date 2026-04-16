"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-background min-h-[70vh]">
      <SectionWrapper className="pt-28">
        <Container>
          <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8 md:p-10 border border-zinc-800/80">
            <p className="text-sm uppercase tracking-wider text-orange-500 mb-2">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, {user.firstName}
            </h1>
            <p className="text-zinc-400 mb-6">
              Signed in as{" "}
              <span className="text-zinc-200">{user.email}</span>
              <span className="text-zinc-500"> · </span>
              <span className="text-zinc-300">{user.role}</span>
            </p>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
              Project tracking, tickets, and deliverables will appear here in
              upcoming releases. This area confirms your session is working.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl"
                onClick={() => router.push("/")}
              >
                Back to site
              </Button>
              <Button
                type="button"
                variant="primary"
                className="rounded-xl"
                onClick={() => void handleLogout()}
              >
                Sign out
              </Button>
            </div>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
