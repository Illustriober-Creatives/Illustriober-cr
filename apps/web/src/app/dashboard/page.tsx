"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, fetchWithAuth } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!user) return;
      try {
        const res = await fetchWithAuth("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    }
    void loadProjects();
  }, [user, fetchWithAuth]);

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
              Project tracking, tickets, and deliverables will appear here.
              Click a project to see its progress and tickets.
            </p>

            <div className="mt-12 space-y-4">
              <h2 className="text-xl font-bold text-white">Your Projects</h2>
              {loading ? (
                <p className="text-zinc-500">Loading your projects...</p>
              ) : projects.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <p className="text-zinc-500">No active projects found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="group flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-orange-500 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-zinc-500 uppercase tracking-wider">
                          Status: <span className="text-zinc-300">{project.status}</span>
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-xl text-xs"
                        onClick={() => router.push(`/dashboard/projects/${project.slug}`)}
                      >
                        View Project
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                type="button"
                variant="primary"
                className="rounded-xl px-8"
                onClick={() => router.push("/dashboard/tickets")}
              >
                Support Tickets
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl px-8"
                onClick={() => router.push("/dashboard/tickets/new")}
              >
                Submit New Ticket
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-4 border-t border-zinc-800/50 pt-10">
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
