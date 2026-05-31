"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/Button";

type TicketType = "BUG" | "FEATURE" | "IDEA" | "QUESTION" | "SUPPORT";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const TYPE_OPTIONS: { value: TicketType; label: string; description: string }[] = [
  { value: "BUG",      label: "Bug",             description: "Something isn't working" },
  { value: "FEATURE",  label: "Feature Request", description: "New functionality or improvement" },
  { value: "IDEA",     label: "Idea",            description: "A suggestion or concept" },
  { value: "QUESTION", label: "Question",        description: "Need clarification or help" },
  { value: "SUPPORT",  label: "Support",         description: "General support request" },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "LOW",      label: "Low" },
  { value: "MEDIUM",   label: "Medium" },
  { value: "HIGH",     label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export default function NewTicketPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TicketType>("BUG");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const plainText = description.replace(/<[^>]*>/g, "").trim();
    if (plainText.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchWithAuth(`/api/projects/${slug}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, priority }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create ticket");
      }

      router.push(`/dashboard/projects/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-32">
        <Link
          href={`/dashboard/projects/${slug}`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to project
        </Link>

        <p className="mb-1 text-sm uppercase tracking-[0.18em] text-orange-500">New Ticket</p>
        <h1 className="mb-8 text-3xl font-bold text-white">Submit a ticket</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Title</label>
            <input
              type="text"
              required
              minLength={5}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of the issue"
              className="w-full rounded-lg border border-glass-border bg-glass-bg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-all ${
                    type === opt.value
                      ? "border-accent bg-accent/10 text-white"
                      : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Priority</label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${
                    priority === opt.value
                      ? "border-accent bg-accent/10 text-white"
                      : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description — TipTap */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Description</label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe the issue in detail. Include steps to reproduce for bugs."
              minHeight="180px"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="rounded-xl"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              onClick={() => router.push(`/dashboard/projects/${slug}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
