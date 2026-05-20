"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { ArrowLeft, Clock, Info, Briefcase } from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string };
  createdAt: string;
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

  if (loading) return <div className="p-8">Loading ticket...</div>;
  if (!ticket) return null;

  return (
    <div className="page-medium">
      <SectionWrapper spacing="lg">
        <Container>
          <div className="mb-6">
            <Link href="/dashboard/tickets" className="group flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-accent">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              Back to Tickets
            </Link>
          </div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  ticket.status === "OPEN" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                  ticket.status === "RESOLVED" ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                  "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                }`}>
                  {ticket.status}
                </span>
                <span className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">{ticket.type}</span>
              </div>
              <h1 className="text-3xl font-bold text-white">{ticket.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
             <div className="space-y-6 lg:col-span-1">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
                  <div className="mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-3">
                    <Briefcase className="h-4 w-4 text-orange-500" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Context</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Project</p>
                      <p className="mt-0.5 text-base font-medium text-white">{ticket.project.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Priority</p>
                      <p className="mt-0.5 text-base font-medium text-white">{ticket.priority}</p>
                    </div>
                  </div>
                </div>
             </div>

             <div className="lg:col-span-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
                  <div className="mb-6 flex items-center gap-2 border-b border-zinc-800/50 pb-4">
                    <Info className="h-5 w-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-white">Issue Description</h2>
                  </div>
                  <p className="whitespace-pre-wrap text-lg leading-relaxed text-zinc-300">
                    {ticket.description}
                  </p>
                  
                  <div className="mt-12 pt-8 border-t border-zinc-800/50">
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Submitted on {new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-8 text-center">
                  <p className="text-zinc-500 text-sm italic">
                    Discussion threads and file attachments for tickets are coming soon.
                  </p>
                </div>
             </div>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
