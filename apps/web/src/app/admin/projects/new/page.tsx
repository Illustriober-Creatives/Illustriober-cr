"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CreateProjectInput } from "@illustriober/shared";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { fetchWithAuth } = useAuth();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateProjectInput>>({
    name: "",
    slug: "",
    description: "",
    clientId: "",
    status: "PLANNING",
  });

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetchWithAuth("/api/admin/clients");
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients);
        }
      } catch (err) {
        console.error("Failed to load clients", err);
      } finally {
        setLoading(false);
      }
    }
    void loadClients();
  }, [fetchWithAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetchWithAuth("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      router.push("/admin/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  if (loading) return <div className="p-8">Loading clients...</div>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Initialize New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Project Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-lg border border-glass-border bg-glass-bg px-4 py-2 focus:border-accent focus:outline-none"
            placeholder="e.g. Acme Web Portal"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Project Slug (URL part)</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            className="w-full rounded-lg border border-glass-border bg-glass-bg/50 px-4 py-2 text-foreground/60 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assign to Client</label>
          <select
            required
            value={formData.clientId}
            onChange={(e) => setFormData((prev) => ({ ...prev, clientId: e.target.value }))}
            className="w-full rounded-lg border border-glass-border bg-glass-bg px-4 py-2 focus:border-accent focus:outline-none"
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-glass-border bg-glass-bg px-4 py-2 focus:border-accent focus:outline-none"
            placeholder="What are we building?"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
