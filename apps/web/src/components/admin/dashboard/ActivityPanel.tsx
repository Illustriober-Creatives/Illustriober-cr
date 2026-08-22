"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type {
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
  RecentActivityEntry,
  TicketComment,
} from "@illustriober/shared";
import { AlertCircle, Loader2, MessageCircle, PlusCircle, RefreshCcw, RotateCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ActivityPanelProps {
  ticketCreatedSeq?: { seq: number; event: AdminTicketCreatedEvent } | null;
  statusChangedSeq?: { seq: number; event: AdminTicketStatusChangedEvent } | null;
  commentSeq?: { seq: number; event: TicketComment } | null;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function activityIcon(kind: RecentActivityEntry["kind"]) {
  if (kind === "ticket_created") return PlusCircle;
  if (kind === "status_changed") return RefreshCcw;
  return MessageCircle;
}

function activityText(entry: RecentActivityEntry): ReactNode {
  if (entry.kind === "ticket_created") {
    return (
      <>
        <span className="font-medium text-foreground">{entry.actorName}</span> opened{" "}
        {entry.ticketTitle ? <span className="font-medium">{entry.ticketTitle}</span> : "a ticket"}
      </>
    );
  }
  if (entry.kind === "status_changed") {
    return (
      <>
        {entry.ticketTitle ? <span className="font-medium">{entry.ticketTitle}</span> : "A ticket"} moved from{" "}
        {entry.previousStatus.replace("_", " ")} to {entry.status.replace("_", " ")}
      </>
    );
  }
  return (
    <>
      <span className="font-medium text-foreground">{entry.actorName}</span> commented on{" "}
      {entry.ticketTitle ? <span className="font-medium">{entry.ticketTitle}</span> : "a ticket"}
      {entry.isInternal && <span className="ml-2 text-[10px] font-bold uppercase text-amber-600">Internal</span>}
    </>
  );
}

export function ActivityPanel({ ticketCreatedSeq, statusChangedSeq, commentSeq }: ActivityPanelProps) {
  const { fetchWithAuth } = useAuth();
  const [entries, setEntries] = useState<RecentActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The initial fetch below only runs once on mount. If a live socket event
  // arrives before it resolves, a bare prepend() would write into the still-empty
  // `entries` state, and the fetch's eventual setEntries(fromServer) would then
  // blindly overwrite that state, silently dropping the live entry. To avoid that,
  // buffer any entries that arrive before the first successful load completes, then
  // merge them with the fetched baseline once it resolves.
  const isInitialLoadCompleteRef = useRef(false);
  const pendingEntriesRef = useRef<RecentActivityEntry[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load recent activity");
      const data = await res.json();
      const baseline: RecentActivityEntry[] = data.recentActivity ?? [];

      const pending = pendingEntriesRef.current;
      pendingEntriesRef.current = [];
      isInitialLoadCompleteRef.current = true;

      if (pending.length === 0) {
        setEntries(baseline);
      } else {
        const merged = new Map<string, RecentActivityEntry>();
        for (const entry of baseline) {
          merged.set(`${entry.kind}-${entry.id}`, entry);
        }
        for (const entry of pending) {
          merged.set(`${entry.kind}-${entry.id}`, entry);
        }
        const sorted = Array.from(merged.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setEntries(sorted.slice(0, 20));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load recent activity");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void load();
  }, [load]);

  const prepend = useCallback((entry: RecentActivityEntry) => {
    if (!isInitialLoadCompleteRef.current) {
      pendingEntriesRef.current = [entry, ...pendingEntriesRef.current];
      return;
    }
    setEntries((current) => [entry, ...current].slice(0, 20));
  }, []);

  useEffect(() => {
    if (!ticketCreatedSeq) return;
    const event = ticketCreatedSeq.event;
    prepend({
      id: event.id,
      kind: "ticket_created",
      ticketId: event.id,
      ticketTitle: event.title,
      projectName: event.projectName,
      actorName: event.submitterName,
      createdAt: event.createdAt,
    });
  }, [ticketCreatedSeq, prepend]);

  useEffect(() => {
    if (!statusChangedSeq) return;
    const event = statusChangedSeq.event;
    prepend({
      id: `${event.id}-${event.updatedAt}`,
      kind: "status_changed",
      ticketId: event.id,
      ticketTitle: event.title,
      projectName: event.projectName,
      previousStatus: event.previousStatus,
      status: event.status,
      createdAt: event.updatedAt,
    });
  }, [statusChangedSeq, prepend]);

  useEffect(() => {
    if (!commentSeq) return;
    const comment = commentSeq.event;
    prepend({
      id: comment.id,
      kind: "comment_created",
      ticketId: comment.ticketId,
      ticketTitle: "",
      projectName: "",
      actorName: `${comment.author.firstName} ${comment.author.lastName}`,
      isInternal: comment.isInternal,
      createdAt: comment.createdAt,
    });
  }, [commentSeq, prepend]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-xl border border-glass-border bg-surface p-8 text-sm text-foreground/40"
        aria-busy="true"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading activity…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-glass-border bg-surface p-8 text-center">
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
    );
  }

  return (
    <div className="rounded-xl border border-glass-border bg-surface">
      <h2 className="border-b border-glass-border px-5 py-4 text-sm font-bold uppercase tracking-widest text-foreground/70">
        Recent activity
      </h2>
      {entries.length === 0 ? (
        <p className="p-8 text-center text-sm text-foreground/40">Nothing in the last 24 hours.</p>
      ) : (
        <ul className="divide-y divide-glass-border">
          {entries.map((entry) => {
            const Icon = activityIcon(entry.kind);
            return (
              <li key={`${entry.kind}-${entry.id}`} className="px-5 py-3">
                <Link href={`/admin/tickets/${entry.ticketId}`} className="flex items-start gap-3 hover:text-accent">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="flex-1 text-sm text-foreground/80">{activityText(entry)}</span>
                  <time dateTime={entry.createdAt} className="shrink-0 text-xs text-foreground/40">
                    {formatTime(entry.createdAt)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
