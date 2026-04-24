"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="w-full bg-background min-h-screen">
      <SectionWrapper className="pt-40 pb-20 lg:pt-44 lg:pb-24">
        <Container variant="narrow">
          <div className="mx-auto w-full glass-card rounded-[2rem] border border-zinc-800/80 p-8 md:p-10 lg:p-12">
            <p className="mb-3 text-sm uppercase tracking-[0.18em] text-orange-500">
              Dashboard
            </p>
            <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
              Welcome, {user.firstName}
            </h1>
            <p className="mb-8 text-lg text-zinc-400">
              Signed in as{" "}
              <span className="text-zinc-200">{user.email}</span>
              <span className="text-zinc-500"> · </span>
              <span className="text-zinc-300">{user.role}</span>
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-500 md:text-lg">
              Project tracking, tickets, and deliverables will appear here in
              upcoming releases. This area confirms your session is working.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
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
