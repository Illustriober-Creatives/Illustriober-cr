"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MilestoneTracker } from "@/components/MilestoneTracker";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  ticketPriorityBadgeClass,
  ticketStatusBadgeClass,
  ticketTypeBadgeClass,
} from "@/lib/ticketBadgeStyles";

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

interface ProjectUpdate {
  id: string;
  content: string;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
}

const STATUS_COLUMNS: { key: TicketStatus; label: string }[] = [
  { key: "OPEN", label: "Open" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsError, setTicketsError] = useState(false);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [updatesError, setUpdatesError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, ticketRes, updatesRes] = await Promise.all([
          fetchWithAuth(`/api/projects/${slug}`),
          fetchWithAuth(`/api/projects/${slug}/tickets`),
          fetchWithAuth(`/api/projects/${slug}/updates`),
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
        } else {
          setTicketsError(true);
        }

        if (updatesRes.ok) {
          const updatesData = await updatesRes.json();
          setUpdates(updatesData.updates);
        } else {
          setUpdatesError(true);
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
      <div className="flex min-h-[60vh] items-center justify-center text-foreground/50">
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-foreground/60">{error ?? "Project not found."}</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-full border border-glass-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const ticketsByStatus = STATUS_COLUMNS.map((col) => ({
    ...col,
    tickets: tickets.filter((t) => t.status === col.key),
  }));

  return (
    <div className="flex flex-col gap-8 p-8">
      <PageHeader
        title={project.name}
        backHref="/dashboard"
        backLabel="Dashboard"
        action={
          <span className="rounded-full border border-glass-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground/70">
            {project.status.replace(/_/g, " ")}
          </span>
        }
      />
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">Project</p>
        <p className="max-w-2xl text-foreground/60">{project.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-glass-border bg-surface p-6 lg:col-span-1">
          <h2 className="mb-5 text-base font-bold text-foreground">Milestones</h2>
          <MilestoneTracker milestones={project.milestones} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              Tickets
              {tickets.length > 0 && (
                <span className="rounded-full bg-glass-bg px-2 py-0.5 text-xs text-foreground/50">
                  {tickets.length}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/projects/${slug}/tickets/new`)}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              New Ticket
            </button>
          </div>

          {ticketsError ? (
            <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
              <p className="text-foreground/50">Couldn&apos;t load tickets. Refresh to try again.</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
              <p className="text-foreground/50">No tickets yet.</p>
              <p className="mt-1 text-sm text-foreground/40">
                Submit a bug, feature request, or question to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ticketsByStatus
                .filter((col) => col.tickets.length > 0)
                .map((col) => (
                  <div key={col.key} className="overflow-hidden rounded-xl border border-glass-border">
                    <div className="flex items-center gap-2 border-b border-glass-border bg-glass-bg px-4 py-2.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${ticketStatusBadgeClass(col.key)}`}
                      >
                        {col.label}
                      </span>
                      <span className="rounded-full bg-glass-bg px-1.5 py-0.5 text-xs text-foreground/40">
                        {col.tickets.length}
                      </span>
                    </div>
                    <div className="divide-y divide-glass-border">
                      {col.tickets.map((ticket) => (
                        <Link
                          key={ticket.id}
                          href={`/dashboard/tickets/${ticket.id}`}
                          className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-glass-bg"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
                            <p className="mt-0.5 text-xs text-foreground/40">
                              {ticket.submittedBy.firstName} · {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketTypeBadgeClass(ticket.type)}`}
                            >
                              {ticket.type}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketPriorityBadgeClass(ticket.priority)}`}
                            >
                              {ticket.priority}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
          <MessageSquare className="h-4 w-4 text-accent" aria-hidden="true" />
          Updates
        </h2>
        {updatesError ? (
          <p className="text-sm text-foreground/50">Couldn&apos;t load updates. Refresh to try again.</p>
        ) : updates.length === 0 ? (
          <p className="text-sm text-foreground/50">
            Updates from your project team will appear here as they happen.
          </p>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border-l-2 border-accent/30 pl-4">
                <p className="whitespace-pre-wrap text-sm text-foreground/80">{update.content}</p>
                <p className="mt-1 text-xs text-foreground/40">
                  {update.sender.firstName} {update.sender.lastName} ·{" "}
                  {new Date(update.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
