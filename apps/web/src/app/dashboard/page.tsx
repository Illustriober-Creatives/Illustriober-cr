"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FolderKanban, Ticket as TicketIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
}

interface TicketSummary {
  id: string;
  status: string;
}

const INACTIVE_PROJECT_STATUSES = new Set(["COMPLETE", "CANCELLED"]);
const CLOSED_TICKET_STATUSES = new Set(["RESOLVED", "CLOSED", "REJECTED"]);

export default function DashboardPage() {
  const { user, fetchWithAuth } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsError, setProjectsError] = useState(false);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      try {
        const [projectsRes, ticketsRes] = await Promise.all([
          fetchWithAuth("/api/projects"),
          fetchWithAuth("/api/tickets"),
        ]);

        if (cancelled) return;

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(data.projects);
        } else {
          setProjectsError(true);
        }
        if (ticketsRes.ok) {
          const data = await ticketsRes.json();
          setTickets(data.tickets);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        if (!cancelled) setProjectsError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, fetchWithAuth]);

  if (!user) {
    return null;
  }

  const activeProjectCount = projects.filter(
    (project) => !INACTIVE_PROJECT_STATUSES.has(project.status)
  ).length;
  const openTicketCount = tickets.filter(
    (ticket) => !CLOSED_TICKET_STATUSES.has(ticket.status)
  ).length;

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Welcome, {user.firstName}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/60">
          Track your projects and support tickets in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-glass-border bg-surface px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/40">
            <FolderKanban className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Active Projects
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {loading ? "–" : activeProjectCount}
          </p>
        </div>
        <div className="rounded-xl border border-glass-border bg-surface px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/40">
            <TicketIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Open Tickets
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {loading ? "–" : openTicketCount}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Your Projects</h2>
        {loading ? (
          <p className="text-foreground/50">Loading your projects...</p>
        ) : projectsError ? (
          <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
            <p className="text-foreground/50">Couldn&apos;t load your projects. Refresh to try again.</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
            <p className="text-foreground/50">No active projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.slug}`}
                className="group flex items-center justify-between rounded-xl border border-glass-border bg-surface p-6 transition-colors hover:border-accent/40"
              >
                <div>
                  <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-foreground/40">
                    {project.status.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  View →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/40">
          Recent Activity
        </h2>
        <p className="mt-2 text-sm text-foreground/60">
          Project updates from your team will appear here as they happen.
        </p>
      </div>
    </div>
  );
}
