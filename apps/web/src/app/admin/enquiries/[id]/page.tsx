"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";

type Enquiry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  projectType: string;
  description: string;
  budgetRange: string | null;
  timeline: string | null;
  referralSource: string | null;
  status: string;
  adminNotes: string | null;
  convertedToId: string | null;
  createdAt: string;
};

type ConvertResult = { inviteToken: string; email: string } | null;

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem("illustriober_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function EnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<ConvertResult>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/enquiries/${id}`, {
          headers: authHeaders(),
          credentials: "include",
        });
        if (res.status === 404) { router.replace("/admin/enquiries"); return; }
        if (!res.ok) return;
        const data = await res.json();
        setEnquiry(data.enquiry);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id, router]);

  const handleConvert = async () => {
    if (!enquiry) return;
    setConverting(true);
    setConvertError(null);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}/convert`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setConvertError(data.error || "Conversion failed");
        return;
      }
      setConvertResult({ inviteToken: data.inviteToken, email: data.email });
      setEnquiry((prev) => prev ? { ...prev, status: "CONVERTED" } : prev);
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-foreground/40">Loading…</div>
    );
  }

  if (!enquiry) return null;

  const canConvert = enquiry.status !== "CONVERTED" && enquiry.status !== "ARCHIVED";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/enquiries" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Enquiries
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-400">{enquiry.firstName} {enquiry.lastName}</span>
      </div>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {enquiry.firstName} {enquiry.lastName}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{enquiry.email}</p>
          {enquiry.company && <p className="text-sm text-zinc-500">{enquiry.company}</p>}
        </div>

        {canConvert && !convertResult && (
          <Button
            type="button"
            variant="primary"
            size="md"
            className="rounded-xl shrink-0"
            disabled={converting}
            onClick={() => void handleConvert()}
          >
            {converting ? "Converting…" : "Convert to client"}
          </Button>
        )}
      </div>

      {/* Conversion result banner */}
      {convertResult && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-5">
          <p className="mb-2 font-semibold text-green-400">Invite sent to {convertResult.email}</p>
          <p className="mb-3 text-sm text-zinc-400">Share this link if the email doesn&apos;t arrive:</p>
          <code className="block rounded-lg bg-zinc-900 px-4 py-2 text-xs text-zinc-300 break-all select-all">
            {baseUrl}/invite/{convertResult.inviteToken}
          </code>
        </div>
      )}

      {convertError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {convertError}
        </div>
      )}

      {/* Detail fields */}
      <div className="grid gap-4">
        {[
          ["Status", enquiry.status],
          ["Project type", enquiry.projectType],
          ["Budget", enquiry.budgetRange ?? "—"],
          ["Timeline", enquiry.timeline ?? "—"],
          ["Phone", enquiry.phone ?? "—"],
          ["Referral source", enquiry.referralSource ?? "—"],
          ["Submitted", new Date(enquiry.createdAt).toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4">
            <span className="w-36 shrink-0 text-sm text-zinc-500">{label}</span>
            <span className="text-sm text-zinc-200">{value}</span>
          </div>
        ))}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4">
          <p className="mb-2 text-sm text-zinc-500">Description</p>
          <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {enquiry.description}
          </p>
        </div>

        {enquiry.adminNotes && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4">
            <p className="mb-2 text-sm text-yellow-500/70">Admin notes</p>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {enquiry.adminNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
