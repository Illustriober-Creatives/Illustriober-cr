"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type EnquiryStatus = "NEW" | "REVIEWED" | "RESPONDED" | "CONVERTED" | "ARCHIVED";

type EnquirySummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  projectType: string;
  status: EnquiryStatus;
  budgetRange: string | null;
  createdAt: string;
};

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  REVIEWED: "Reviewed",
  RESPONDED: "Responded",
  CONVERTED: "Converted",
  ARCHIVED: "Archived",
};

const STATUS_COLOURS: Record<EnquiryStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  REVIEWED: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  RESPONDED: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  CONVERTED: "bg-green-500/10 text-green-600 border-green-500/30",
  ARCHIVED: "bg-foreground/5 text-foreground/50 border-foreground/10",
};

const ALL_STATUSES: EnquiryStatus[] = ["NEW", "REVIEWED", "RESPONDED", "CONVERTED", "ARCHIVED"];

export default function EnquiriesPage() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<EnquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<EnquiryStatus | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchEnquiries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const accessToken = sessionStorage.getItem("illustriober_access_token");
      const res = await fetch(`/api/admin/enquiries?${params}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setEnquiries(data.enquiries);
    } finally {
      setLoading(false);
    }
  }, [user, status, debouncedSearch]);

  useEffect(() => { void fetchEnquiries(); }, [fetchEnquiries]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
          <p className="mt-1 text-sm text-foreground/50">Manage inbound leads and convert them to clients.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, email, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-glass-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent w-64"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setStatus("")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              status === ""
                ? "border-accent bg-accent/10 text-accent"
                : "border-glass-border text-foreground/50 hover:border-accent/30 hover:text-foreground"
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-foreground/40">Loading…</div>
      ) : enquiries.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-foreground/40">
          No enquiries found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-glass-border">
          <table className="w-full text-sm">
            <thead className="border-b border-glass-border bg-surface">
              <tr>
                {["Name", "Email", "Project type", "Budget", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr
                  key={enq.id}
                  className="border-b border-glass-border transition-colors hover:bg-glass-bg"
                >
                  <td className="px-4 py-3">
                    <Link href={`/admin/enquiries/${enq.id}`} className="font-medium text-foreground hover:text-accent transition-colors">
                      {enq.firstName} {enq.lastName}
                    </Link>
                    {enq.company && <p className="text-xs text-foreground/40">{enq.company}</p>}
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{enq.email}</td>
                  <td className="px-4 py-3 text-foreground/60">{enq.projectType}</td>
                  <td className="px-4 py-3 text-foreground/60">{enq.budgetRange ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOURS[enq.status]}`}>
                      {STATUS_LABELS[enq.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/40 tabular-nums text-xs">
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
