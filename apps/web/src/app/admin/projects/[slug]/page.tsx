"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Plus, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ticketPriorityBadgeClass,
  ticketStatusBadgeClass,
  ticketTypeBadgeClass,
} from "@/lib/ticketBadgeStyles";

type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETE";

interface Milestone {
  id: string;
  title: string;
  order: number;
  status: MilestoneStatus;
  dueDate: string | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  client: { firstName: string; lastName: string; email: string };
  milestones: Milestone[];
}

interface Ticket {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  submittedBy: { firstName: string; lastName: string };
}

interface ProjectUpdate {
  id: string;
  content: string;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

const MILESTONE_STATUS_OPTIONS: MilestoneStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETE"];

export default function AdminProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, fetchWithAuth } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsError, setTicketsError] = useState(false);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [updatesError, setUpdatesError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneError, setMilestoneError] = useState<string | null>(null);

  const [updateContent, setUpdateContent] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [projRes, ticketRes, updatesRes] = await Promise.all([
          fetchWithAuth(`/api/projects/${slug}`),
          fetchWithAuth(`/api/projects/${slug}/tickets`),
          fetchWithAuth(`/api/projects/${slug}/updates`),
        ]);

        if (cancelled) return;

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
        if (!cancelled) setError("Failed to load project.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, fetchWithAuth]);

  const handleAddMilestone = async (event: FormEvent) => {
    event.preventDefault();
    if (!project) return;
    setAddingMilestone(true);
    setMilestoneError(null);
    try {
      const res = await fetchWithAuth(`/api/admin/projects/${slug}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newMilestoneTitle,
          order: project.milestones.length,
          dueDate: newMilestoneDueDate ? new Date(newMilestoneDueDate).toISOString() : undefined,
        }),
      });
      if (!res.ok) {
        setMilestoneError(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setProject((current) =>
        current ? { ...current, milestones: [...current.milestones, data.milestone] } : current
      );
      setNewMilestoneTitle("");
      setNewMilestoneDueDate("");
    } catch {
      setMilestoneError("Something went wrong. Please try again.");
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleMilestoneStatusChange = async (milestoneId: string, status: MilestoneStatus) => {
    const res = await fetchWithAuth(`/api/admin/milestones/${milestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setProject((current) =>
      current
        ? {
            ...current,
            milestones: current.milestones.map((m) => (m.id === milestoneId ? data.milestone : m)),
          }
        : current
    );
  };

  const handlePostUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setPostingUpdate(true);
    setUpdateError(null);
    try {
      const res = await fetchWithAuth(`/api/admin/projects/${slug}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: updateContent }),
      });
      if (!res.ok) {
        setUpdateError(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setUpdates((current) => [
        {
          id: data.update.id,
          content: data.update.content,
          createdAt: data.update.createdAt,
          sender: { firstName: user.firstName, lastName: user.lastName, role: user.role },
        },
        ...current,
      ]);
      setUpdateContent("");
    } catch {
      setUpdateError("Something went wrong. Please try again.");
    } finally {
      setPostingUpdate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-foreground/60">
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-foreground/60">{error ?? "Project not found."}</p>
        <Link
          href="/admin/projects"
          className="rounded-full border border-glass-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <Link
        href="/admin/projects"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">Project</p>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{project.name}</h1>
          <p className="mt-2 max-w-2xl text-foreground/60">{project.description}</p>
          <p className="mt-2 text-sm text-foreground/60">
            Client: {project.client.firstName} {project.client.lastName} ({project.client.email})
          </p>
        </div>
        <span className="rounded-full border border-glass-border px-4 py-1.5 text-sm font-medium text-foreground/70">
          {project.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-glass-border bg-surface p-6 lg:col-span-1">
          <h2 className="mb-4 text-base font-bold text-foreground">Milestones</h2>

          {project.milestones.length === 0 ? (
            <p className="mb-4 text-sm text-foreground/60">No milestones yet.</p>
          ) : (
            <div className="mb-4 space-y-3">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-lg border border-glass-border p-3">
                  <p className="text-sm font-medium text-foreground">{milestone.title}</p>
                  {milestone.dueDate && (
                    <p className="mt-0.5 text-xs text-foreground/50">
                      Due {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <select
                    value={milestone.status}
                    onChange={(e) =>
                      void handleMilestoneStatusChange(milestone.id, e.target.value as MilestoneStatus)
                    }
                    className="mt-2 w-full rounded-lg border border-glass-border bg-background px-2 py-1.5 text-xs text-foreground"
                  >
                    {MILESTONE_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={(e) => void handleAddMilestone(e)} className="flex flex-col gap-2 border-t border-glass-border pt-4">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/70">
              Add Milestone
            </label>
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="Milestone title"
              required
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
            />
            <input
              type="date"
              value={newMilestoneDueDate}
              onChange={(e) => setNewMilestoneDueDate(e.target.value)}
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
            />
            {milestoneError && <p className="text-xs text-red-600">{milestoneError}</p>}
            <button
              type="submit"
              disabled={addingMilestone}
              className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {addingMilestone ? "Adding..." : "Add Milestone"}
            </button>
          </form>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            Tickets
            {tickets.length > 0 && (
              <span className="rounded-full bg-glass-bg px-2 py-0.5 text-xs text-foreground/60">
                {tickets.length}
              </span>
            )}
          </h2>
          {ticketsError ? (
            <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
              <p className="text-foreground/60">Couldn&apos;t load tickets. Refresh to try again.</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
              <p className="text-foreground/60">No tickets yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/admin/tickets/${ticket.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-glass-border bg-surface p-4 transition-colors hover:border-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
                    <p className="mt-0.5 text-xs text-foreground/50">
                      {ticket.submittedBy.firstName} · {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ticketStatusBadgeClass(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketTypeBadgeClass(ticket.type)}`}>
                      {ticket.type}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketPriorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </Link>
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

        <form onSubmit={(e) => void handlePostUpdate(e)} className="mb-6 flex flex-col gap-2">
          <textarea
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            placeholder="Share a progress update with the client..."
            required
            rows={3}
            className="w-full resize-none rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
          />
          {updateError && <p className="text-xs text-red-600">{updateError}</p>}
          <button
            type="submit"
            disabled={postingUpdate}
            className="flex w-fit items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            {postingUpdate ? "Posting..." : "Post Update"}
          </button>
        </form>

        {updatesError ? (
          <p className="text-sm text-foreground/60">Couldn&apos;t load updates. Refresh to try again.</p>
        ) : updates.length === 0 ? (
          <p className="text-sm text-foreground/60">No updates posted yet.</p>
        ) : (
          <div className="space-y-4 border-t border-glass-border pt-4">
            {updates.map((update) => (
              <div key={update.id} className="border-l-2 border-accent/30 pl-4">
                <p className="whitespace-pre-wrap text-sm text-foreground/80">{update.content}</p>
                <p className="mt-1 text-xs text-foreground/50">
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
