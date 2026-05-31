"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Author {
  firstName: string;
  lastName: string;
  role: string;
}

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author: Author;
}

interface CommentThreadProps {
  ticketId: string;
  projectSlug: string;
  initialComments: Comment[];
}

export function CommentThread({ ticketId, projectSlug, initialComments }: CommentThreadProps) {
  const { user, fetchWithAuth } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetchWithAuth(`/api/projects/${projectSlug}/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isInternal }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to post comment");
      }

      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setContent("");
      setIsInternal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Comments {comments.length > 0 && `· ${comments.length}`}
      </h3>

      {/* Comment list */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-zinc-600">No comments yet. Be the first to reply.</p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`rounded-xl border p-4 ${
              comment.isInternal
                ? "border-amber-800/40 bg-amber-900/10"
                : "border-zinc-800 bg-zinc-900/30"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                  {comment.author.firstName[0]}{comment.author.lastName[0]}
                </div>
                <span className="text-sm font-medium text-zinc-300">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                {comment.author.role === "ADMIN" && (
                  <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
                    Team
                  </span>
                )}
                {comment.isInternal && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                    Internal
                  </span>
                )}
              </div>
              <time className="text-xs text-zinc-600">
                {new Date(comment.createdAt).toLocaleDateString()}
              </time>
            </div>
            <div
              className="prose prose-sm prose-invert max-w-none text-zinc-300"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>
        ))}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-orange-500/50 focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          {user?.role === "ADMIN" && (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="accent-amber-500"
              />
              Internal note
            </label>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
