"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ticketStatusBadgeClass } from "@/lib/ticketBadgeStyles";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string };
  createdAt: string;
}

export default function ClientTicketsPage() {
  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetchWithAuth("/api/tickets");
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets);
        }
      } catch (err) {
        console.error("Failed to load tickets", err);
      } finally {
        setLoading(false);
      }
    }
    void loadTickets();
  }, [fetchWithAuth]);

  if (loading) {
    return <div className="p-8 text-foreground/50">Loading tickets...</div>;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-foreground/50 transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Back to Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">Your Support Tickets</h1>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/tickets/new")}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Ticket
        </button>
      </div>

      <div className="grid gap-3">
        {tickets.length === 0 ? (
          <div className="rounded-xl border border-glass-border bg-surface p-12 text-center">
            <p className="text-foreground/50">No tickets submitted yet. Have a bug or a feature request?</p>
            <button
              type="button"
              onClick={() => router.push("/dashboard/tickets/new")}
              className="mt-6 rounded-full border border-glass-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
            >
              Create your first ticket
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/tickets/${ticket.id}`}
              className="group flex flex-col justify-between gap-4 rounded-xl border border-glass-border bg-surface p-6 transition-colors hover:border-accent/40 sm:flex-row sm:items-center"
            >
              <div>
                <div className="mb-1 flex items-center gap-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ticketStatusBadgeClass(ticket.status)}`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-xs text-foreground/40">{ticket.project.name}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                  {ticket.title}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-foreground/40">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                <span className="rounded-full border border-glass-border px-4 py-1.5 text-xs font-semibold text-foreground/70 transition-colors group-hover:bg-glass-bg">
                  View
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
