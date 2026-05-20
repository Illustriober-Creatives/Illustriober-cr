"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/Button";
import { ArrowLeft, Clock, User, Briefcase, Info } from "lucide-react";

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
        const data = await res.json();
        setTicket(data.ticket);
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
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/tickets" className="group flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-accent">
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          Back to Tickets
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{ticket.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ticket #{ticket.id.slice(-6).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={ticket.status}
            onChange={(e) => void updateStatus(e.target.value)}
            disabled={updating}
            className="rounded-lg border border-glass-border bg-glass-bg px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
          >
            {["OPEN", "IN_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card rounded-2xl bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-3">
              <User className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Reporter</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Name</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.submittedBy.firstName} {ticket.submittedBy.lastName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.submittedBy.email}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-3">
              <Briefcase className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Project Context</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Project</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.project.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Type</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Priority</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.priority}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card h-full rounded-2xl bg-surface/30 p-8">
            <div className="mb-6 flex items-center gap-2 border-b border-zinc-800/50 pb-4">
              <Info className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-foreground">Issue Description</h2>
            </div>
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/80">
              {ticket.description}
            </p>
            
            <div className="mt-12 pt-8 border-t border-zinc-800/50">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Submitted on {new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
