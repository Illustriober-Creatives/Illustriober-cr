"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CLIENT" | "ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_FILTERS = [
  { value: "", label: "All" },
  { value: "CLIENT", label: "Clients" },
  { value: "ADMIN", label: "Admins" },
] as const;

export default function AdminUsersPage() {
  const { fetchWithAuth } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (role) params.set("role", role);
        if (search.trim()) params.set("search", search.trim());
        const qs = params.toString();

        const res = await fetchWithAuth(`/api/admin/users${qs ? `?${qs}` : ""}`);
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setUsers(data.users);
            setError(false);
          } else {
            setError(true);
          }
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timeout = setTimeout(() => void load(), search ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [role, search, fetchWithAuth]);

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader title="Users" />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-full border border-glass-border bg-surface py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-foreground/40"
          />
        </div>
        <div className="flex gap-1.5">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setRole(filter.value)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                role === filter.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-glass-border text-foreground/60 hover:bg-glass-bg"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-foreground/60">Loading users...</p>
      ) : error ? (
        <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-foreground/60">Couldn&apos;t load users. Refresh to try again.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-foreground/60">No users match this filter.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="group flex flex-col justify-between gap-3 rounded-xl border border-glass-border bg-surface p-5 transition-colors hover:border-accent/40 sm:flex-row sm:items-center"
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="rounded-full bg-glass-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                    {user.role}
                  </span>
                  {!user.isActive && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                      Deactivated
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/60">{user.email}</p>
              </div>
              <div className="text-xs text-foreground/50">
                {user.lastLoginAt
                  ? `Last login ${new Date(user.lastLoginAt).toLocaleDateString()}`
                  : "Never logged in"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
