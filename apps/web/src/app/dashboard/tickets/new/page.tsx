"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateTicketInput } from "@illustriober/shared";
import { Select } from "@/components/ui/Select";

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

  if (loading) return <div className="p-8 text-foreground/60">Loading projects...</div>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link href="/dashboard/tickets" className="group mb-2 flex w-fit items-center gap-1 text-xs font-medium text-foreground/50 transition-colors hover:text-accent">
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
        Back to Tickets
      </Link>
      <h1 className="text-3xl font-bold text-foreground">Submit Support Ticket</h1>
      <p className="mt-2 text-foreground/60">Report a bug, request a feature, or ask a technical question.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-glass-border bg-surface p-8">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">Related Project</label>
          <Select
            value={formData.projectId ?? ""}
            onChange={(next) => setFormData((prev) => ({ ...prev, projectId: next }))}
            aria-label="Related project"
            fullWidth
            className="py-3"
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/70">Issue Type</label>
            <Select
              value={formData.type ?? "BUG"}
              onChange={(next) =>
                setFormData((prev) => ({ ...prev, type: next as CreateTicketInput["type"] }))
              }
              aria-label="Issue type"
              fullWidth
              className="py-3"
              options={[
                { value: "BUG", label: "Bug Report" },
                { value: "FEATURE", label: "Feature Request" },
                { value: "IDEA", label: "Idea" },
                { value: "QUESTION", label: "Question" },
                { value: "SUPPORT", label: "General Support" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/70">Priority</label>
            <Select
              value={formData.priority ?? "MEDIUM"}
              onChange={(next) =>
                setFormData((prev) => ({ ...prev, priority: next as CreateTicketInput["priority"] }))
              }
              aria-label="Priority"
              fullWidth
              className="py-3"
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "CRITICAL", label: "Critical" },
              ]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">Summary</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-xl border border-glass-border bg-background px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-accent focus:outline-none transition-colors"
            placeholder="e.g. Navigation menu is broken on mobile"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">Detailed Description</label>
          <textarea
            required
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-xl border border-glass-border bg-background px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-accent focus:outline-none transition-colors"
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
    </div>
  );
}
