"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface PortfolioEntry {
  id: string;
  title: string;
  summary: string;
  coverImageUrl: string;
  liveUrl?: string | null;
  tags: string[];
  images: string[];
  featured: boolean;
  order: number;
  clientApproved: boolean;
  project: { name: string; slug: string };
}

export default function EditPortfolioEntryPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchWithAuth } = useAuth();
  const router = useRouter();

  const [entry, setEntry] = useState<PortfolioEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
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
      const res = await fetchWithAuth("/api/admin/portfolio");
      if (res.ok) {
        const data = await res.json();
        const found = (data.entries as PortfolioEntry[]).find((e) => e.id === id);
        if (found) {
          setEntry(found);
          setForm({
            title: found.title,
            summary: found.summary,
            coverImageUrl: found.coverImageUrl,
            liveUrl: found.liveUrl ?? "",
            tags: found.tags.join(", "),
            featured: found.featured,
            order: found.order,
            clientApproved: found.clientApproved,
          });
        }
      }
      setLoading(false);
    }
    void load();
  }, [fetchWithAuth, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(`/api/admin/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          liveUrl: form.liveUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-foreground/40">Loading...</div>;
  if (!entry) return (
    <div className="p-8">
      <p className="text-foreground/40">Entry not found.</p>
      <Link href="/admin/portfolio" className="mt-4 inline-block text-sm text-accent hover:underline">Back to portfolio</Link>
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/portfolio" className="text-sm text-foreground/40 hover:text-foreground transition-colors">
          ← Portfolio
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Entry</h1>
          <p className="text-sm text-foreground/40">{entry.project.name}</p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
        {saved && <p className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">Saved successfully.</p>}

        <div>
          <label className="mb-1.5 block text-sm font-medium">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Summary *</label>
          <textarea
            required
            rows={4}
            value={form.summary}
            onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
            className="w-full resize-none rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Cover Image URL *</label>
          <input
            required
            type="url"
            value={form.coverImageUrl}
            onChange={(e) => setForm((p) => ({ ...p, coverImageUrl: e.target.value }))}
            className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Live URL</label>
          <input
            type="url"
            value={form.liveUrl}
            onChange={(e) => setForm((p) => ({ ...p, liveUrl: e.target.value }))}
            className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Tags (comma-separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            placeholder="React, TypeScript, SaaS"
            className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Display Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
              className="w-full rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-3 pt-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="accent-accent"
              />
              Featured
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.clientApproved}
                onChange={(e) => setForm((p) => ({ ...p, clientApproved: e.target.checked }))}
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
            {submitting ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/portfolio")}
            className="rounded-xl border border-glass-border px-6 py-2.5 text-sm font-semibold hover:border-accent/40 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
