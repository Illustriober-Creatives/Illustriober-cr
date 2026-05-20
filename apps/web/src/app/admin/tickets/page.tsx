"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string; slug: string };
  submittedBy: { firstName: string; lastName: string };
  createdAt: string;
}

export default function AdminTicketsPage() {
  const { fetchWithAuth } = useAuth();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "RESOLVED": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "CLOSED": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      case "IN_PROGRESS": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "text-red-500";
      case "HIGH": return "text-orange-500";
      case "MEDIUM": return "text-yellow-500";
      case "LOW": return "text-blue-500";
      default: return "text-zinc-500";
    }
  };

  if (loading) return <div className="p-8">Loading tickets...</div>;

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold">Support Tickets</h1>

      <div className="overflow-hidden rounded-xl border border-glass-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-glass-bg border-b border-glass-border text-xs uppercase tracking-wider text-foreground/40">
            <tr>
              <th className="px-6 py-4 font-semibold">Ticket</th>
              <th className="px-6 py-4 font-semibold">Project</th>
              <th className="px-6 py-4 font-semibold">Client</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Priority</th>
              <th className="px-6 py-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-foreground/40">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-glass-bg transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/tickets/${ticket.id}`} className="font-medium text-foreground hover:text-accent">
                      {ticket.title}
                    </Link>
                    <p className="text-xs text-foreground/40 mt-0.5">{ticket.type}</p>
                  </td>
                  <td className="px-6 py-4 text-foreground/60">{ticket.project.name}</td>
                  <td className="px-6 py-4 text-foreground/60">{ticket.submittedBy.firstName} {ticket.submittedBy.lastName}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground/40">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
