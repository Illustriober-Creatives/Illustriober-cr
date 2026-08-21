"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { MilestoneTracker } from "@/components/MilestoneTracker";

type TicketStatus = "OPEN" | "IN_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type TicketType = "BUG" | "FEATURE" | "IDEA" | "QUESTION" | "SUPPORT";

interface Ticket {
  id: string;
  title: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  submittedBy: { firstName: string; lastName: string };
}

interface Milestone {
  id: string;
  title: string;
  order: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETE";
  dueDate?: string | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  startDate?: string | null;
  estimatedEnd?: string | null;
  milestones: Milestone[];
}

const STATUS_COLUMNS: { key: TicketStatus; label: string; color: string }[] = [
  { key: "OPEN",        label: "Open",        color: "text-zinc-400" },
  { key: "IN_REVIEW",   label: "In Review",   color: "text-blue-400" },
  { key: "IN_PROGRESS", label: "In Progress", color: "text-orange-400" },
  { key: "RESOLVED",    label: "Resolved",    color: "text-green-400" },
  { key: "CLOSED",      label: "Closed",      color: "text-zinc-500" },
];

const PRIORITY_BADGE: Record<TicketPriority, string> = {
  LOW:      "bg-zinc-800 text-zinc-400",
  MEDIUM:   "bg-blue-500/10 text-blue-400",
  HIGH:     "bg-orange-500/10 text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-400",
};

const TYPE_BADGE: Record<TicketType, string> = {
  BUG:      "bg-red-500/10 text-red-400",
  FEATURE:  "bg-purple-500/10 text-purple-400",
  IDEA:     "bg-yellow-500/10 text-yellow-400",
  QUESTION: "bg-sky-500/10 text-sky-400",
  SUPPORT:  "bg-zinc-500/10 text-zinc-400",
};

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, ticketRes] = await Promise.all([
          fetchWithAuth(`/api/projects/${slug}`),
          fetchWithAuth(`/api/projects/${slug}/tickets`),
        ]);

        if (!projRes.ok) {
          setError(projRes.status === 404 ? "Project not found." : "Failed to load project.");
          return;
        }

        const projData = await projRes.json();
        setProject(projData.project);

        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          setTickets(ticketData.tickets);
        }
      } catch {
        setError("Failed to load project.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [slug, fetchWithAuth]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">{error ?? "Project not found."}</p>
        <Button variant="secondary" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const ticketsByStatus = STATUS_COLUMNS.map((col) => ({
    ...col,
    tickets: tickets.filter((t) => t.status === col.key),
  }));

  return (
    <div className="w-full bg-background min-h-screen">
      <SectionWrapper className="pt-40 pb-20 lg:pt-44 lg:pb-24">
        <Container>
          {/* Back link */}
          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Dashboard
          </Link>

          {/* Project header */}
          <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-sm uppercase tracking-[0.18em] text-orange-500">Project</p>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{project.name}</h1>
              <p className="mt-2 max-w-2xl text-zinc-400">{project.description}</p>
            </div>
            <span className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-300">
              {project.status}
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Milestone tracker */}
            <div className="glass-card rounded-2xl border border-zinc-800/80 p-6 lg:col-span-1">
              <h2 className="mb-5 text-base font-semibold text-white">Milestones</h2>
              <MilestoneTracker milestones={project.milestones} />
            </div>

            {/* Ticket board */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">
                  Tickets
                  {tickets.length > 0 && (
                    <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                      {tickets.length}
                    </span>
                  )}
                </h2>
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl text-xs"
                  onClick={() => router.push(`/dashboard/projects/${slug}/tickets/new`)}
                >
                  + New Ticket
                </Button>
              </div>

              {tickets.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <p className="text-zinc-500">No tickets yet.</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Submit a bug, feature request, or question to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ticketsByStatus
                    .filter((col) => col.tickets.length > 0)
                    .map((col) => (
                      <div key={col.key} className="rounded-xl border border-zinc-800/80 overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
                          <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>
                            {col.label}
                          </span>
                          <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
                            {col.tickets.length}
                          </span>
                        </div>
                        <div className="divide-y divide-zinc-800/60">
                          {col.tickets.map((ticket) => (
                            <div
                              key={ticket.id}
                              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-zinc-900/40"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-zinc-200">
                                  {ticket.title}
                                </p>
                                <p className="mt-0.5 text-xs text-zinc-600">
                                  {ticket.submittedBy.firstName} · {new Date(ticket.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-1.5">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[ticket.type]}`}>
                                  {ticket.type}
                                </span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[ticket.priority]}`}>
                                  {ticket.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
