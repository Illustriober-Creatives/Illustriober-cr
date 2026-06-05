"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  name: string;
  slug: string;
}

export default function NewPortfolioEntryPage() {
  const { fetchWithAuth } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    projectId: "",
    title: "",
    summary: "",
    coverImageUrl: "",
    liveUrl: "",
    tags: "",
    featured: false,
    order: 0,
    clientApproved: false,
  });

  useEffect(() => {
    async function load() {
      const res = await fetchWithAuth("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    }
    void load();
  }, [fetchWithAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          images: [],
          liveUrl: form.liveUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to create entry");
      }
      router.push("/admin/portfolio");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/portfolio" className="text-sm text-foreground/40 hover:text-foreground transition-colors">
          ← Portfolio
        </Link>
        <h1 className="text-2xl font-bold">New Portfolio Entry</h1>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

        <div>
          <label className="mb-1.5 block text-sm font-medium">Project *</label>
          <select
            required
            {...field("projectId")}
            className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Title *</label>
          <input required {...field("title")} className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Summary *</label>
          <textarea required rows={4} {...field("summary")} className="w-full resize-none rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Cover Image URL *</label>
          <input required type="url" {...field("coverImageUrl")} className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Live URL</label>
          <input type="url" {...field("liveUrl")} className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Tags (comma-separated)</label>
          <input {...field("tags")} placeholder="React, TypeScript, SaaS" className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Display Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
              className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-3 pt-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                className="accent-accent"
              />
              Featured
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.clientApproved}
                onChange={(e) => setForm((prev) => ({ ...prev, clientApproved: e.target.checked }))}
                className="accent-accent"
              />
              Publish (client approved)
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {submitting ? "Creating…" : "Create Entry"}
          </button>
          <Link href="/admin/portfolio" className="rounded-xl border border-glass-border px-6 py-2.5 text-sm font-semibold hover:border-accent/40 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
