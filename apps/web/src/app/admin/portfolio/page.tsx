"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface PortfolioEntry {
  id: string;
  title: string;
  featured: boolean;
  clientApproved: boolean;
  order: number;
  tags: string[];
  project: { name: string; slug: string };
  createdAt: string;
}

export default function AdminPortfolioPage() {
  const { fetchWithAuth } = useAuth();
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth("/api/admin/portfolio");
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [fetchWithAuth]);

  const toggleApproved = async (id: string, current: boolean) => {
    const res = await fetchWithAuth(`/api/admin/portfolio/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientApproved: !current }),
    });
    if (res.ok) {
      setEntries((prev) => prev.map((e) => e.id === id ? { ...e, clientApproved: !current } : e));
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this portfolio entry?")) return;
    const res = await fetchWithAuth(`/api/admin/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) return <div className="p-8 text-foreground/40">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio CMS</h1>
        <Link
          href="/admin/portfolio/new"
          className="rounded-lg bg-accent px-4 py-2 font-medium text-accent-foreground hover:opacity-90 transition-opacity"
        >
          Add Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-glass-border bg-surface/50 p-12 text-center">
          <p className="text-foreground/40">No portfolio entries yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-glass-border bg-surface p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{entry.title}</h3>
                  {entry.featured && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">Featured</span>
                  )}
                  {entry.clientApproved ? (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">Live</span>
                  ) : (
                    <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs text-zinc-400">Draft</span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-foreground/40">
                  {entry.project.name} · Order {entry.order}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {entry.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-glass-border px-2 py-0.5 text-xs text-foreground/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => void toggleApproved(entry.id, entry.clientApproved)}
                  className="rounded-lg border border-glass-border px-3 py-1.5 text-xs font-medium hover:border-accent/40 transition-colors"
                >
                  {entry.clientApproved ? "Unpublish" : "Publish"}
                </button>
                <Link
                  href={`/admin/portfolio/${entry.id}`}
                  className="rounded-lg border border-glass-border px-3 py-1.5 text-xs font-medium hover:border-accent/40 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => void deleteEntry(entry.id)}
                  className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-500/40 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
