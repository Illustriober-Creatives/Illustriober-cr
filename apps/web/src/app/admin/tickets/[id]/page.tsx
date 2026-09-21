"use client";

import { useEffect, useState } from "react";
import type { TicketComment } from "@illustriober/shared";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CommentThread } from "@/components/tickets/CommentThread";
import { Clock, User, Briefcase, Info } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/dashboard/PageHeader";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string; slug: string };
  submittedBy: { firstName: string; lastName: string; email: string };
  createdAt: string;
  comments: TicketComment[];
}

export default function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetchWithAuth(`/api/tickets/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTicket(data.ticket);
        } else if (res.status === 404) {
          router.replace("/admin/tickets");
        }
      } catch (err) {
        console.error("Failed to load ticket", err);
      } finally {
        setLoading(false);
      }
    }
    void loadTicket();
  }, [id, fetchWithAuth, router]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetchWithAuth(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = (await res.json()) as { ticket: Partial<Ticket> };
        setTicket((current) => (current ? { ...current, ...data.ticket } : current));
      }
    } catch (err) {
      console.error("Failed to update ticket", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8">Loading ticket...</div>;
  if (!ticket) return null;

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title={ticket.title}
        backHref="/admin/tickets"
        backLabel="Back to Tickets"
        action={
          <Select
            value={ticket.status}
            onChange={(next) => void updateStatus(next)}
            disabled={updating}
            aria-label="Ticket status"
            options={["OPEN", "IN_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((s) => ({
              value: s,
              label: s,
            }))}
          />
        }
      />
      <p className="mb-8 text-sm text-foreground/50">Ticket #{ticket.id.slice(-6).toUpperCase()}</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card rounded-2xl bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-glass-border pb-3">
              <User className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Reporter</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Name</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.submittedBy.firstName} {ticket.submittedBy.lastName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Email</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.submittedBy.email}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-glass-border pb-3">
              <Briefcase className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Project Context</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Project</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.project.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Type</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Priority</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.priority}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="glass-card rounded-2xl bg-surface/30 p-8">
            <div className="mb-6 flex items-center gap-2 border-b border-glass-border pb-4">
              <Info className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-foreground">Issue Description</h2>
            </div>
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/80">
              {ticket.description}
            </p>

            <div className="mt-12 pt-8 border-t border-glass-border">
              <p className="text-xs text-foreground/50 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Submitted on {new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          <CommentThread
            ticketId={ticket.id}
            initialComments={ticket.comments}
          />
        </div>
      </div>
    </div>
  );
}
