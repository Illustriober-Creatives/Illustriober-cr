"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";

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
  const router = useRouter();
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
      <PageHeader title="Enquiries" />
      <p className="mb-8 max-w-2xl text-sm text-foreground/50">Manage inbound leads and convert them to clients.</p>

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
                  : "border-glass-border text-foreground/50 hover:border-accent/30 hover:text-foreground"
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
        <div className="overflow-hidden rounded-2xl border border-glass-border bg-surface shadow-[0_1px_2px_rgba(23,23,23,0.04)]">
          <table className="w-full text-sm">
            <thead className="bg-background/60">
              <tr>
                {["Name", "Email", "Project type", "Budget", "Status", "Date"].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-foreground/40">
                    {h}
                  </th>
                ))}
                <th className="w-10" aria-hidden="true" />
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {enquiries.map((enq) => (
                <tr
                  key={enq.id}
                  onClick={() => router.push(`/admin/enquiries/${enq.id}`)}
                  className="group cursor-pointer transition-colors hover:bg-glass-bg"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                        {enq.firstName.charAt(0).toUpperCase()}
                        {enq.lastName.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/enquiries/${enq.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-foreground transition-colors group-hover:text-accent"
                        >
                          {enq.firstName} {enq.lastName}
                        </Link>
                        {enq.company && <p className="truncate text-xs text-foreground/40">{enq.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground/60">{enq.email}</td>
                  <td className="px-6 py-4 text-foreground/60">{enq.projectType}</td>
                  <td className="px-6 py-4 text-foreground/60">{enq.budgetRange ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOURS[enq.status]}`}>
                      {STATUS_LABELS[enq.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs tabular-nums text-foreground/40">
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="pr-4">
                    <ChevronRight
                      className="h-4 w-4 text-foreground/20 transition-colors group-hover:text-accent"
                      aria-hidden="true"
                    />
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
