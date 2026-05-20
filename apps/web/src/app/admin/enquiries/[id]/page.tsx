"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { 
  User, 
  Briefcase, 
  Info, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

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
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    if (!convertResult) return;
    const url = `${baseUrl}/invite/${convertResult.inviteToken}`;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link href="/admin/enquiries" className="group flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-accent">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              Back to Enquiries
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {enquiry.firstName} {enquiry.lastName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {canConvert && !convertResult && (
            <Button
              type="button"
              variant="primary"
              className="rounded-xl px-6"
              disabled={converting}
              onClick={() => void handleConvert()}
            >
              {converting ? "Converting..." : "Convert to Client"}
            </Button>
          )}
          {enquiry.status === "CONVERTED" && (
            <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-400 border border-green-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              CONVERTED
            </div>
          )}
        </div>
      </div>

      {/* Conversion result banner */}
      {convertResult && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-3 bg-green-500/10 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-400 uppercase tracking-wide">Client Successfully Converted</p>
              <p className="text-xs text-muted-foreground">An invitation email has been sent to {convertResult.email}</p>
            </div>
          </div>
          <div className="p-6">
            <p className="mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Direct Invitation Link</p>
            <div className="flex items-center gap-2 rounded-xl bg-black/40 p-1 pl-4 border border-white/5">
              <code className="flex-1 text-sm text-zinc-300 break-all truncate">
                {baseUrl}/invite/{convertResult.inviteToken}
              </code>
              <Button 
                type="button"
                variant="secondary" 
                size="sm" 
                className="rounded-lg text-xs min-w-[80px]"
                aria-label="Copy invitation link to clipboard"
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {convertError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {convertError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Meta & Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Identity Card */}
          <div className="glass-card rounded-2xl bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-3">
              <User className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Client Identity</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Full Name", value: `${enquiry.firstName} ${enquiry.lastName}` },
                { label: "Email Address", value: enquiry.email },
                { label: "Phone Number", value: enquiry.phone ?? "Not provided" },
                { label: "Company", value: enquiry.company ?? "Individual" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</p>
                  <p className="mt-0.5 text-base font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specs Card */}
          <div className="glass-card rounded-2xl bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-3">
              <Briefcase className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Project Specs</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Project Type", value: enquiry.projectType },
                { label: "Budget Range", value: enquiry.budgetRange ?? "Unspecified" },
                { label: "Timeline", value: enquiry.timeline ?? "Flexible" },
                { label: "Referral Source", value: enquiry.referralSource ?? "Direct" },
                { label: "Submitted On", value: new Date(enquiry.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</p>
                  <p className="mt-0.5 text-base font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2">
          <div className="glass-card h-full rounded-2xl bg-surface/30 p-8">
            <div className="mb-6 flex items-center gap-2 border-b border-zinc-800/50 pb-4">
              <Info className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-foreground">Project Description</h2>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/80">
                {enquiry.description}
              </p>
            </div>

            {enquiry.adminNotes && (
              <div className="mt-12 rounded-xl border border-accent/20 bg-accent/5 p-6">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
                  <Info className="h-3 w-3" />
                  Admin Notes
                </p>
                <p className="text-sm leading-relaxed text-foreground/70">
                  {enquiry.adminNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
