"use client";

import { useState } from "react";
import type { AdminTicketCreatedEvent, AdminTicketStatusChangedEvent, TicketComment } from "@illustriober/shared";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityPanel } from "@/components/admin/dashboard/ActivityPanel";
import { KpiStrip } from "@/components/admin/dashboard/KpiStrip";
import { TicketQueue } from "@/components/admin/dashboard/TicketQueue";
import { useAdminRealtime } from "@/lib/useAdminRealtime";

type SeqEvent<T> = { seq: number; event: T };

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [ticketCreated, setTicketCreated] = useState<SeqEvent<AdminTicketCreatedEvent> | null>(null);
  const [statusChanged, setStatusChanged] = useState<SeqEvent<AdminTicketStatusChangedEvent> | null>(null);
  const [comment, setComment] = useState<SeqEvent<TicketComment> | null>(null);

  useAdminRealtime({
    onTicketCreated: (event) => setTicketCreated((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
    onStatusChanged: (event) => setStatusChanged((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
    onComment: (event) => setComment((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Welcome, {user.firstName}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/60">
          Here&apos;s what&apos;s happening across tickets, enquiries, and projects today.
        </p>
      </div>

      <KpiStrip ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <TicketQueue ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} commentSeq={comment} />
        <ActivityPanel ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} commentSeq={comment} />
      </div>
    </div>
  );
}
