"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type {
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
  TicketComment,
} from "@illustriober/shared";
import { AlertCircle, Loader2, RotateCw, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface QueueTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string; slug: string };
  submittedBy: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
  comments: Array<{ createdAt: string }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TicketQueueProps {
  ticketCreatedSeq?: { seq: number; event: AdminTicketCreatedEvent } | null;
  statusChangedSeq?: { seq: number; event: AdminTicketStatusChangedEvent } | null;
  commentSeq?: { seq: number; event: TicketComment } | null;
}

const STATUS_OPTIONS = ["OPEN", "IN_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PAGE_SIZE = 20;

function statusColor(status: string) {
  switch (status) {
    case "OPEN": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "RESOLVED": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "CLOSED": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "IN_PROGRESS": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "IN_REVIEW": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "CRITICAL": return "text-red-500";
    case "HIGH": return "text-orange-500";
    case "MEDIUM": return "text-yellow-500";
    case "LOW": return "text-blue-500";
    default: return "text-zinc-500";
  }
}

function latestActivity(ticket: QueueTicket): string {
  const commentAt = ticket.comments[0]?.createdAt;
  if (!commentAt) return ticket.updatedAt;
  return Date.parse(commentAt) > Date.parse(ticket.updatedAt) ? commentAt : ticket.updatedAt;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function TicketQueue({ ticketCreatedSeq, statusChangedSeq, commentSeq }: TicketQueueProps) {
  const { fetchWithAuth } = useAuth();
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [status, priority, debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetchWithAuth(`/api/tickets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      setTickets(data.tickets);
      setPagination(data.pagination ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, status, priority, debouncedSearch, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!ticketCreatedSeq) return;
    setUnread((current) => new Set(current).add(ticketCreatedSeq.event.id));
  }, [ticketCreatedSeq]);

  useEffect(() => {
    if (!statusChangedSeq) return;
    const { id, status: nextStatus } = statusChangedSeq.event;
    setUnread((current) => new Set(current).add(id));
    setTickets((current) => current.map((ticket) => (ticket.id === id ? { ...ticket, status: nextStatus } : ticket)));
  }, [statusChangedSeq]);

  useEffect(() => {
    if (!commentSeq) return;
    setUnread((current) => new Set(current).add(commentSeq.event.ticketId));
  }, [commentSeq]);

  const clearUnread = useCallback((ticketId: string) => {
    setUnread((current) => {
      if (!current.has(ticketId)) return current;
      const next = new Set(current);
      next.delete(ticketId);
      return next;
    });
  }, []);

  const hasFilters = Boolean(status || priority || debouncedSearch);

  return (
    <section className="rounded-xl border border-glass-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-glass-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, client, or project"
            aria-label="Search tickets"
            className="w-full rounded-lg border border-glass-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-accent/60"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
          className="rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          aria-label="Filter by priority"
          className="rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
        >
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-12 text-sm text-foreground/40" aria-busy="true">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading tickets…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 p-12 text-center">
          <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          <p className="text-sm text-foreground/60">{error}</p>
          <button
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-lg border border-glass-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-glass-bg"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center text-sm text-foreground/40">
          {hasFilters ? "No tickets match these filters." : "No tickets found."}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-glass-border bg-glass-bg text-xs uppercase tracking-wider text-foreground/40">
                <tr>
                  <th className="px-6 py-3 font-semibold">Ticket</th>
                  <th className="px-6 py-3 font-semibold">Project</th>
                  <th className="px-6 py-3 font-semibold">Client</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Priority</th>
                  <th className="px-6 py-3 font-semibold">Latest activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-glass-bg transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        onClick={() => clearUnread(ticket.id)}
                        className="flex items-center gap-2 font-medium text-foreground hover:text-accent"
                      >
                        {unread.has(ticket.id) && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread activity" />
                        )}
                        {ticket.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-foreground/40">{ticket.type}</p>
                    </td>
                    <td className="px-6 py-4 text-foreground/60">{ticket.project.name}</td>
                    <td className="px-6 py-4 text-foreground/60">
                      {ticket.submittedBy.firstName} {ticket.submittedBy.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                    </td>
                    <td className="px-6 py-4 text-foreground/40">{formatTime(latestActivity(ticket))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-glass-border md:hidden">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                onClick={() => clearUnread(ticket.id)}
                className="flex flex-col gap-2 p-4"
              >
                <div className="flex items-center gap-2">
                  {unread.has(ticket.id) && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread activity" />
                  )}
                  <span className="font-medium text-foreground">{ticket.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`font-bold ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                  <span>{ticket.project.name}</span>
                </div>
                <p className="text-xs text-foreground/40">{formatTime(latestActivity(ticket))}</p>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-glass-border px-4 py-3 text-xs text-foreground/50">
              <span>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} tickets
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.page <= 1}
                  className="rounded-lg border border-glass-border px-3 py-1.5 font-medium text-foreground/70 hover:bg-glass-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-lg border border-glass-border px-3 py-1.5 font-medium text-foreground/70 hover:bg-glass-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
