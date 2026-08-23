"use client";

import { useEffect, useState } from "react";
import type { TicketComment } from "@illustriober/shared";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Clock, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CommentThread } from "@/components/tickets/CommentThread";
import { ticketPriorityBadgeClass, ticketStatusBadgeClass } from "@/lib/ticketBadgeStyles";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string };
  createdAt: string;
  comments: TicketComment[];
}

export default function ClientTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetchWithAuth(`/api/tickets/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTicket(data.ticket);
        } else if (res.status === 403) {
          router.replace("/dashboard/tickets");
        }
      } catch (err) {
        console.error("Failed to load ticket", err);
      } finally {
        setLoading(false);
      }
    }
    void loadTicket();
  }, [id, fetchWithAuth, router]);

  if (loading) {
    return <div className="p-8 text-foreground/50">Loading ticket...</div>;
  }
  if (!ticket) return null;

  return (
    <div className="flex flex-col gap-6 p-8">
      <Link
        href="/dashboard/tickets"
        className="inline-flex w-fit items-center gap-1 text-xs font-medium text-foreground/50 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        Back to Tickets
      </Link>

      <div>
        <div className="mb-2 flex items-center gap-3">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${ticketStatusBadgeClass(ticket.status)}`}
          >
            {ticket.status}
          </span>
          <span className="text-xs font-bold uppercase tracking-tighter text-foreground/40">{ticket.type}</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">{ticket.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-glass-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-glass-border pb-3">
              <Briefcase className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/60">Context</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Project</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.project.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Priority</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ticketPriorityBadgeClass(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-glass-border bg-surface p-8">
            <div className="mb-6 flex items-center gap-2 border-b border-glass-border pb-4">
              <Info className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-lg font-bold text-foreground">Issue Description</h2>
            </div>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/70">
              {ticket.description}
            </p>

            <div className="mt-10 border-t border-glass-border pt-6">
              <p className="flex items-center gap-2 text-xs text-foreground/40">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Submitted on{" "}
                {new Date(ticket.createdAt).toLocaleString(undefined, {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <CommentThread ticketId={ticket.id} initialComments={ticket.comments} />
          </div>
        </div>
      </div>
    </div>
  );
}
