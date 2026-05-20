"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { ArrowLeft, Plus } from "lucide-react";

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

  if (loading) return <div className="p-8">Loading tickets...</div>;

  return (
    <div className="page-medium">
      <SectionWrapper spacing="lg">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="group mb-2 flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-accent">
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">Your Support Tickets</h1>
            </div>
            <Button
              variant="primary"
              className="rounded-xl"
              onClick={() => router.push("/dashboard/tickets/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </div>

          <div className="grid gap-4">
            {tickets.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
                <p className="text-zinc-500">No tickets submitted yet. Have a bug or a feature request?</p>
                <Button
                  variant="secondary"
                  className="mt-6 rounded-xl"
                  onClick={() => router.push("/dashboard/tickets/new")}
                >
                  Create your first ticket
                </Button>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                         ticket.status === "OPEN" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                         ticket.status === "RESOLVED" ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                         "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                       }`}>
                         {ticket.status}
                       </span>
                       <span className="text-xs text-zinc-500">{ticket.project.name}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-orange-500 transition-colors">
                      {ticket.title}
                    </h3>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-4 text-sm">
                    <span className="text-zinc-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <Button variant="secondary" size="sm" className="rounded-xl px-4 text-xs">View</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
