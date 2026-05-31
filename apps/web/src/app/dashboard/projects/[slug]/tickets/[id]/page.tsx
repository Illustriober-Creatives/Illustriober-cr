"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/Button";
import { CommentThread } from "@/components/CommentThread";

type TicketStatus = "OPEN" | "IN_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type TicketType = "BUG" | "FEATURE" | "IDEA" | "QUESTION" | "SUPPORT";

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author: { firstName: string; lastName: string; role: string };
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  submittedBy: { firstName: string; lastName: string };
  comments: Comment[];
}

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN:        "bg-zinc-800 text-zinc-300",
  IN_REVIEW:   "bg-blue-500/10 text-blue-400",
  IN_PROGRESS: "bg-orange-500/10 text-orange-400",
  RESOLVED:    "bg-green-500/10 text-green-400",
  CLOSED:      "bg-zinc-800 text-zinc-500",
  REJECTED:    "bg-red-500/10 text-red-400",
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW:      "bg-zinc-800 text-zinc-400",
  MEDIUM:   "bg-blue-500/10 text-blue-400",
  HIGH:     "bg-orange-500/10 text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-400",
};

const ALL_STATUSES: TicketStatus[] = ["OPEN", "IN_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

export default function TicketDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { user, fetchWithAuth } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth(`/api/projects/${slug}/tickets/${id}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Ticket not found." : "Failed to load ticket.");
          return;
        }
        const data = await res.json();
        setTicket(data.ticket);
      } catch {
        setError("Failed to load ticket.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [slug, id, fetchWithAuth]);

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return;
    setUpdatingStatus(true);
    try {
      const res = await fetchWithAuth(`/api/projects/${slug}/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setTicket((prev) => prev ? { ...prev, status: data.ticket.status } : prev);
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">Loading...</div>;
  if (error || !ticket) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-zinc-400">{error ?? "Ticket not found."}</p>
      <Button variant="secondary" onClick={() => router.push(`/dashboard/projects/${slug}`)}>Back to project</Button>
    </div>
  );

  return (
    <div className="w-full bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-32">
        <Link
          href={`/dashboard/projects/${slug}`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to project
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[ticket.status]}`}>
              {ticket.status.replace("_", " ")}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_COLORS[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-400">
              {ticket.type}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">{ticket.title}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Submitted by {ticket.submittedBy.firstName} · {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Description */}
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div
            className="prose prose-sm prose-invert max-w-none text-zinc-300"
            dangerouslySetInnerHTML={{ __html: ticket.description }}
          />
        </div>

        {/* Admin: status controls */}
        {user?.role === "ADMIN" && (
          <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={updatingStatus || s === ticket.status}
                  onClick={() => void handleStatusChange(s)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                    s === ticket.status
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment thread */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6">
          <CommentThread
            ticketId={ticket.id}
            projectSlug={slug}
            initialComments={ticket.comments}
          />
        </div>
      </div>
    </div>
  );
}
