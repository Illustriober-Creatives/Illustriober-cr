"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AdminDashboardStatusCounts,
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
} from "@illustriober/shared";
import { AlertCircle, CircleDot, Loader2, RotateCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_LABELS: Record<keyof AdminDashboardStatusCounts, string> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

const EMPTY_COUNTS: AdminDashboardStatusCounts = { OPEN: 0, IN_REVIEW: 0, IN_PROGRESS: 0, RESOLVED: 0 };

interface KpiStripProps {
  ticketCreatedSeq?: { seq: number; event: AdminTicketCreatedEvent } | null;
  statusChangedSeq?: { seq: number; event: AdminTicketStatusChangedEvent } | null;
}

interface PendingDelta {
  type: "created" | "statusChanged";
  event: AdminTicketCreatedEvent | AdminTicketStatusChangedEvent;
}

export function KpiStrip({ ticketCreatedSeq, statusChangedSeq }: KpiStripProps) {
  const { fetchWithAuth } = useAuth();
  const [counts, setCounts] = useState<AdminDashboardStatusCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInitialLoadCompleteRef = useRef(false);
  const pendingDeltasRef = useRef<PendingDelta[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load ticket counts");
      const data = await res.json();
      setCounts(data.statusCounts);

      // Mark initial load as complete, then replay any pending deltas
      isInitialLoadCompleteRef.current = true;
      const deltas = pendingDeltasRef.current;
      pendingDeltasRef.current = [];

      for (const delta of deltas) {
        if (delta.type === "created") {
          const event = delta.event as AdminTicketCreatedEvent;
          setCounts((current) => {
            const base = current ?? EMPTY_COUNTS;
            const status = event.status as keyof AdminDashboardStatusCounts;
            if (!(status in base)) return base;
            return { ...base, [status]: base[status] + 1 };
          });
        } else {
          const event = delta.event as AdminTicketStatusChangedEvent;
          setCounts((current) => {
            const base = current ?? EMPTY_COUNTS;
            const next = { ...base };
            const { previousStatus, status } = event;
            const prevKey = previousStatus as keyof AdminDashboardStatusCounts;
            const nextKey = status as keyof AdminDashboardStatusCounts;
            if (prevKey in next) next[prevKey] = Math.max(0, next[prevKey] - 1);
            if (nextKey in next) next[nextKey] += 1;
            return next;
          });
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load ticket counts");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!ticketCreatedSeq) return;

    if (isInitialLoadCompleteRef.current) {
      // Initial load is done, apply the delta directly
      setCounts((current) => {
        const base = current ?? EMPTY_COUNTS;
        const status = ticketCreatedSeq.event.status as keyof AdminDashboardStatusCounts;
        if (!(status in base)) return base;
        return { ...base, [status]: base[status] + 1 };
      });
    } else {
      // Initial load not done yet, buffer the delta
      pendingDeltasRef.current.push({
        type: "created",
        event: ticketCreatedSeq.event,
      });
    }
  }, [ticketCreatedSeq]);

  useEffect(() => {
    if (!statusChangedSeq) return;

    if (isInitialLoadCompleteRef.current) {
      // Initial load is done, apply the delta directly
      setCounts((current) => {
        const base = current ?? EMPTY_COUNTS;
        const next = { ...base };
        const { previousStatus, status } = statusChangedSeq.event;
        const prevKey = previousStatus as keyof AdminDashboardStatusCounts;
        const nextKey = status as keyof AdminDashboardStatusCounts;
        if (prevKey in next) next[prevKey] = Math.max(0, next[prevKey] - 1);
        if (nextKey in next) next[nextKey] += 1;
        return next;
      });
    } else {
      // Initial load not done yet, buffer the delta
      pendingDeltasRef.current.push({
        type: "statusChanged",
        event: statusChangedSeq.event,
      });
    }
  }, [statusChangedSeq]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-24 items-center justify-center rounded-xl border border-glass-border bg-surface"
          >
            <Loader2 className="h-5 w-5 animate-spin text-foreground/30" aria-hidden="true" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-glass-border bg-surface px-5 py-4 text-sm text-foreground/60">
        <span className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
          {error}
        </span>
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

  const safeCounts = counts ?? EMPTY_COUNTS;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {(Object.keys(STATUS_LABELS) as Array<keyof AdminDashboardStatusCounts>).map((status) => (
        <div key={status} className="rounded-xl border border-glass-border bg-surface px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/40">
            <CircleDot className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {STATUS_LABELS[status]}
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{safeCounts[status]}</p>
        </div>
      ))}
    </div>
  );
}
