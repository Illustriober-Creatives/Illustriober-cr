"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, ShieldCheck, ShieldOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ticketStatusBadgeClass } from "@/lib/ticketBadgeStyles";
import { PageHeader } from "@/components/dashboard/PageHeader";

interface UserProject {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface UserTicket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "CLIENT" | "ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  projects: UserProject[];
  tickets: UserTicket[];
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchWithAuth } = useAuth();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [resetSending, setResetSending] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchWithAuth(`/api/admin/users/${id}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setError(res.status === 404 ? "User not found." : "Failed to load user.");
        }
      } catch {
        if (!cancelled) setError("Failed to load user.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, fetchWithAuth]);

  const handleToggleActive = async () => {
    if (!user) return;
    setStatusSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetchWithAuth(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) {
        setStatusMessage(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setUser((current) => (current ? { ...current, isActive: data.user.isActive } : current));
      setStatusMessage(data.user.isActive ? "Account reactivated." : "Account deactivated.");
    } catch {
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSendReset = async () => {
    setResetSending(true);
    setResetMessage(null);
    setResetError(null);
    try {
      const res = await fetchWithAuth(`/api/admin/users/${id}/reset-password`, {
        method: "POST",
      });
      if (!res.ok) {
        setResetError(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setResetMessage(data.message ?? "Reset link sent.");
    } catch {
      setResetError("Something went wrong. Please try again.");
    } finally {
      setResetSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-foreground/60">Loading user...</div>;
  }

  if (error || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
        <p className="text-foreground/60">{error ?? "User not found."}</p>
        <Link
          href="/admin/users"
          className="rounded-full border border-glass-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        backHref="/admin/users"
        backLabel="Users"
        action={
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              user.isActive ? "border-glass-border text-foreground/70" : "border-red-500/20 bg-red-500/10 text-red-700"
            }`}
          >
            {user.isActive ? "Active" : "Deactivated"}
          </span>
        }
      />
      <Link
        href="/admin/users"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Users
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {user.firstName} {user.lastName}
            </h1>
            <span className="rounded-full bg-glass-bg px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-foreground/60">
              {user.role}
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-foreground/60">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {user.email}
          </p>
          {user.phone && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground/60">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {user.phone}
            </p>
          )}
        </div>
        <span
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            user.isActive
              ? "border-glass-border text-foreground/70"
              : "border-red-500/20 bg-red-500/10 text-red-700"
          }`}
        >
          {user.isActive ? "Active" : "Deactivated"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-glass-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground/60">Account</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">Joined</p>
                <p className="mt-0.5 text-foreground/80">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">Last Login</p>
                <p className="mt-0.5 text-foreground/80">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-glass-border pt-4">
              <button
                type="button"
                onClick={() => void handleToggleActive()}
                disabled={statusSaving}
                className="flex items-center justify-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg disabled:opacity-50"
              >
                {user.isActive ? (
                  <ShieldOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {statusSaving ? "Saving..." : user.isActive ? "Deactivate Account" : "Reactivate Account"}
              </button>
              {statusMessage && <p className="text-xs text-foreground/60">{statusMessage}</p>}

              <button
                type="button"
                onClick={() => void handleSendReset()}
                disabled={resetSending || !user.isActive}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {resetSending ? "Sending..." : "Send Password Reset"}
              </button>
              {resetMessage && <p className="text-xs text-accent">{resetMessage}</p>}
              {resetError && <p className="text-xs text-red-600">{resetError}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-glass-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground/60">
              Projects {user.projects.length > 0 && `(${user.projects.length})`}
            </h2>
            {user.projects.length === 0 ? (
              <p className="text-sm text-foreground/60">No projects.</p>
            ) : (
              <div className="space-y-2">
                {user.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.slug}`}
                    className="flex items-center justify-between rounded-lg border border-glass-border px-4 py-3 text-sm transition-colors hover:bg-glass-bg"
                  >
                    <span className="font-medium text-foreground">{project.name}</span>
                    <span className="text-xs text-foreground/50">{project.status.replace(/_/g, " ")}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-glass-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground/60">
              Recent Tickets {user.tickets.length > 0 && `(${user.tickets.length})`}
            </h2>
            {user.tickets.length === 0 ? (
              <p className="text-sm text-foreground/60">No tickets.</p>
            ) : (
              <div className="space-y-2">
                {user.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-lg border border-glass-border px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-foreground">{ticket.title}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ticketStatusBadgeClass(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
