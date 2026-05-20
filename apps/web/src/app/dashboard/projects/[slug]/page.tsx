"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { ArrowLeft, Clock, CheckCircle2, Circle, Layout, Terminal, Rocket } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETE";
  order: number;
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  milestones: Milestone[];
  tickets: Ticket[];
  liveUrl: string | null;
  stagingUrl: string | null;
  repositoryUrl: string | null;
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetchWithAuth(`/api/projects/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
        } else if (res.status === 404) {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Failed to load project", err);
      } finally {
        setLoading(false);
      }
    }
    void loadProject();
  }, [slug, fetchWithAuth, router]);

  if (loading) return <div className="p-8 text-center pt-40 text-zinc-500">Loading project details...</div>;
  if (!project) return null;

  const getMilestoneIcon = (status: string, index: number) => {
    if (status === "COMPLETE") return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    if (status === "IN_PROGRESS") return <Circle className="h-6 w-6 text-orange-500 fill-orange-500/20 animate-pulse" />;
    return <Circle className="h-6 w-6 text-zinc-700" />;
  };

  return (
    <div className="w-full bg-background min-h-screen">
      <SectionWrapper className="pt-32 pb-20">
        <Container>
          <div className="mb-8">
            <Link href="/dashboard" className="group mb-2 flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-accent">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white">{project.name}</h1>
                <p className="mt-2 text-zinc-400 max-w-2xl">{project.description}</p>
              </div>
              <div className="flex items-center gap-3">
                 <span className="rounded-full bg-orange-500/10 px-4 py-1 text-xs font-bold text-orange-500 border border-orange-500/20 uppercase tracking-widest">
                   {project.status}
                 </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Milestone Tracker (#39) */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
                <h2 className="mb-8 text-xl font-bold text-white">Project Roadmap</h2>
                <div className="relative space-y-8">
                  {/* Vertical Line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-zinc-800" />
                  
                  {project.milestones.length === 0 ? (
                    <p className="text-zinc-500 italic ml-10">Roadmap is currently being finalized by the team.</p>
                  ) : (
                    project.milestones.map((ms, i) => (
                      <div key={ms.id} className="relative flex gap-6 ml-0">
                        <div className="z-10 bg-background rounded-full">
                          {getMilestoneIcon(ms.status, i)}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${ms.status === 'COMPLETE' ? 'text-zinc-400' : 'text-white'}`}>
                            {ms.title}
                          </h3>
                          {ms.description && <p className="mt-1 text-sm text-zinc-500">{ms.description}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tickets Section */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Recent Tickets</h2>
                  <Link href={`/dashboard/tickets/new?projectId=${project.id}`} className="text-xs font-bold text-orange-500 uppercase tracking-widest hover:text-orange-400 transition-colors">
                    + Raise Ticket
                  </Link>
                </div>
                <div className="space-y-4">
                  {project.tickets.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No tickets found for this project.</p>
                  ) : (
                    project.tickets.map((t) => (
                      <Link
                        key={t.id}
                        href={`/dashboard/tickets/${t.id}`}
                        className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-black/20 p-4 hover:bg-black/40 transition-colors group"
                      >
                        <span className="text-zinc-300 group-hover:text-white transition-colors">{t.title}</span>
                        <span className="text-[10px] font-bold uppercase text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full">{t.status}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Meta */}
            <div className="space-y-6">
               <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
                 <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-500">Project Assets</h3>
                 <div className="space-y-3">
                   <div className="flex items-center gap-3 text-sm">
                      <Rocket className="h-4 w-4 text-orange-500" />
                      <span className="text-zinc-400">Live:</span>
                      {project.liveUrl ? <a href={project.liveUrl} className="text-white hover:underline">Visit Site</a> : <span className="text-zinc-600">Pending</span>}
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                      <Layout className="h-4 w-4 text-orange-500" />
                      <span className="text-zinc-400">Staging:</span>
                      {project.stagingUrl ? <a href={project.stagingUrl} className="text-white hover:underline">Preview</a> : <span className="text-zinc-600">Pending</span>}
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                      <Terminal className="h-4 w-4 text-orange-500" />
                      <span className="text-zinc-400">Repo:</span>
                      {project.repositoryUrl ? <a href={project.repositoryUrl} className="text-white hover:underline">Github</a> : <span className="text-zinc-600">Private</span>}
                   </div>
                 </div>
               </div>

               <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
                 <h3 className="mb-2 text-sm font-bold text-orange-500 uppercase tracking-widest">Need help?</h3>
                 <p className="text-xs text-zinc-500 mb-4 leading-relaxed">If you have questions about the progress or need to request a change, please submit a support ticket.</p>
                 <Button
                  variant="secondary"
                  size="sm"
                  className="w-full rounded-xl text-xs"
                  onClick={() => router.push(`/dashboard/tickets/new?projectId=${project.id}`)}
                >
                  Submit Ticket
                </Button>
               </div>
            </div>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
