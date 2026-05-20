"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateTicketInput } from "@illustriober/shared";

interface Project {
  id: string;
  name: string;
}

export default function NewTicketPage() {
  const router = useRouter();
  const { fetchWithAuth } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateTicketInput>>({
    title: "",
    description: "",
    type: "BUG",
    priority: "MEDIUM",
    projectId: "",
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetchWithAuth("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
          if (data.projects.length > 0) {
            setFormData(prev => ({ ...prev, projectId: data.projects[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    }
    void loadProjects();
  }, [fetchWithAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetchWithAuth("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit ticket");
      }

      router.push("/dashboard/tickets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading projects...</div>;

  return (
    <div className="w-full bg-background min-h-screen">
      <SectionWrapper className="pt-32 pb-20">
        <Container variant="narrow">
          <div className="mb-8">
            <Link href="/dashboard/tickets" className="group mb-2 flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-accent">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              Back to Tickets
            </Link>
            <h1 className="text-3xl font-bold text-white">Submit Support Ticket</h1>
            <p className="mt-2 text-zinc-500">Report a bug, request a feature, or ask a technical question.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
            {error && (
              <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Related Project</label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => setFormData((prev) => ({ ...prev, projectId: e.target.value }))}
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Issue Type</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as any }))}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                >
                  <option value="BUG">Bug Report</option>
                  <option value="FEATURE">Feature Request</option>
                  <option value="IDEA">Idea</option>
                  <option value="QUESTION">Question</option>
                  <option value="SUPPORT">General Support</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Priority</label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Summary</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="e.g. Navigation menu is broken on mobile"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Detailed Description</label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Please provide as much detail as possible..."
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl py-4 font-bold text-lg"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </Container>
      </SectionWrapper>
    </div>
  );
}
