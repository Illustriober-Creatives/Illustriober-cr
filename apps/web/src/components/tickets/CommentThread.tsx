"use client";

import type { TicketComment } from "@illustriober/shared";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { LockKeyhole, MessageCircle, SendHorizontal } from "lucide-react";
import { authMutationHeaders, useAuth } from "@/contexts/AuthContext";
import { createTicketSocket } from "@/lib/realtime";

interface CommentThreadProps {
  ticketId: string;
  initialComments: TicketComment[];
}

type ConnectionState = "connecting" | "live" | "offline";

function mergeComment(comments: TicketComment[], incoming: TicketComment): TicketComment[] {
  if (comments.some((comment) => comment.id === incoming.id)) return comments;
  return [...comments, incoming].sort(
    (left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)
  );
}

function formatCommentTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CommentThread({ ticketId, initialComments }: CommentThreadProps) {
  const { user, fetchWithAuth } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const commentListRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const addComment = useCallback((comment: TicketComment) => {
    setComments((current) => mergeComment(current, comment));
  }, []);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    const socket = createTicketSocket();

    socket.on("connect", () => {
      setConnectionState("connecting");
      socket.emit("ticket:join", { ticketId }, (result) => {
        if (result.ok) {
          setConnectionState("live");
          return;
        }
        setConnectionState("offline");
        setError(result.error);
      });
    });
    socket.on("ticket:comment-created", addComment);
    socket.on("disconnect", () => setConnectionState("connecting"));
    socket.on("connect_error", () => setConnectionState("offline"));
    socket.connect();

    return () => {
      if (socket.connected) socket.emit("ticket:leave", { ticketId });
      socket.disconnect();
    };
  }, [addComment, ticketId]);

  useEffect(() => {
    const list = commentListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [comments.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: authMutationHeaders(true),
        body: JSON.stringify({ content: trimmedContent, isInternal }),
      });
      const data = (await response.json()) as {
        comment?: TicketComment;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.comment) {
        throw new Error(data.error || data.message || "The reply could not be sent");
      }

      addComment(data.comment);
      setContent("");
      setIsInternal(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The reply could not be sent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    formRef.current?.requestSubmit();
  };

  const stateLabel =
    connectionState === "live"
      ? "Live"
      : connectionState === "connecting"
        ? "Connecting"
        : "Offline";

  return (
    <section className="overflow-hidden rounded-lg border border-glass-border bg-surface/30">
      <header className="flex items-center justify-between gap-4 border-b border-glass-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <MessageCircle className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/70">
            Discussion
          </h2>
          <span className="text-xs tabular-nums text-foreground/40">{comments.length}</span>
        </div>
        <div
          className="flex items-center gap-2 text-xs text-foreground/45"
          aria-live="polite"
          title="Realtime connection status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connectionState === "live"
                ? "bg-emerald-500"
                : connectionState === "connecting"
                  ? "animate-pulse bg-amber-500"
                  : "bg-zinc-500"
            }`}
          />
          {stateLabel}
        </div>
      </header>

      <div
        ref={commentListRef}
        className="flex max-h-[28rem] min-h-56 flex-col gap-4 overflow-y-auto px-5 py-5"
        aria-live="polite"
      >
        {comments.length === 0 ? (
          <div className="m-auto max-w-sm py-8 text-center">
            <MessageCircle className="mx-auto h-5 w-5 text-foreground/25" aria-hidden="true" />
            <p className="mt-3 text-sm text-foreground/45">No replies yet.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwnComment = comment.authorId === user?.id || comment.author.id === user?.id;
            return (
              <article
                key={comment.id}
                className={`flex max-w-[88%] flex-col ${isOwnComment ? "ml-auto items-end" : "items-start"}`}
              >
                <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[11px] text-foreground/45">
                  <span className="font-semibold text-foreground/65">
                    {comment.author.firstName} {comment.author.lastName}
                  </span>
                  {comment.author.role === "ADMIN" && (
                    <span className="font-semibold uppercase text-accent">Studio</span>
                  )}
                  {comment.isInternal && (
                    <span className="inline-flex items-center gap-1 font-semibold uppercase text-amber-600">
                      <LockKeyhole className="h-3 w-3" aria-hidden="true" />
                      Internal
                    </span>
                  )}
                  <time dateTime={comment.createdAt}>{formatCommentTime(comment.createdAt)}</time>
                </div>
                <div
                  className={`rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm ${
                    comment.isInternal
                      ? "border-amber-500/25 bg-amber-500/10 text-foreground/85"
                      : isOwnComment
                        ? "border-accent/25 bg-accent text-white"
                        : "border-glass-border bg-surface text-foreground/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{comment.content}</p>
                </div>
              </article>
            );
          })
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="border-t border-glass-border p-4">
        {error && (
          <p className="mb-3 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-end gap-3 rounded-lg border border-glass-border bg-surface px-3 py-2 transition-colors focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/10">
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setError(null);
            }}
            onKeyDown={handleComposerKeyDown}
            maxLength={4000}
            rows={2}
            placeholder={isInternal ? "Write an internal note" : "Write a reply"}
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-foreground/35"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={submitting ? "Sending reply" : "Send reply"}
            title="Send reply"
          >
            <SendHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {user?.role === "ADMIN" && (
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground/55">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(event) => setIsInternal(event.target.checked)}
              className="h-4 w-4 accent-amber-600"
            />
            Internal note
          </label>
        )}
      </form>
    </section>
  );
}
