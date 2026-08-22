"use client";

import { useState } from "react";
import type { AdminTicketCreatedEvent, AdminTicketStatusChangedEvent, TicketComment } from "@illustriober/shared";
import { ActivityPanel } from "@/components/admin/dashboard/ActivityPanel";
import { KpiStrip } from "@/components/admin/dashboard/KpiStrip";
import { TicketQueue } from "@/components/admin/dashboard/TicketQueue";
import { useAdminRealtime } from "@/lib/useAdminRealtime";

type SeqEvent<T> = { seq: number; event: T };

export default function AdminDashboardPage() {
  const [ticketCreated, setTicketCreated] = useState<SeqEvent<AdminTicketCreatedEvent> | null>(null);
  const [statusChanged, setStatusChanged] = useState<SeqEvent<AdminTicketStatusChangedEvent> | null>(null);
  const [comment, setComment] = useState<SeqEvent<TicketComment> | null>(null);

  useAdminRealtime({
    onTicketCreated: (event) => setTicketCreated((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
    onStatusChanged: (event) => setStatusChanged((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
    onComment: (event) => setComment((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

      <KpiStrip ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <TicketQueue ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} commentSeq={comment} />
        <ActivityPanel ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} commentSeq={comment} />
      </div>
    </div>
  );
}
