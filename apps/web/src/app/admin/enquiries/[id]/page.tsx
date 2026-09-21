"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { User, Briefcase, Info, CheckCircle2 } from "lucide-react";

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
      <PageHeader
        title={`${enquiry.firstName} ${enquiry.lastName}`}
        backHref="/admin/enquiries"
        backLabel="Back to Enquiries"
        action={
          canConvert && !convertResult ? (
            <Button
              type="button"
              variant="primary"
              className="rounded-xl px-4 py-1.5 text-xs"
              disabled={converting}
              onClick={() => void handleConvert()}
            >
              {converting ? "Converting..." : "Convert to Client"}
            </Button>
          ) : enquiry.status === "CONVERTED" ? (
            <span className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Converted
            </span>
          ) : undefined
        }
      />
      {/* Conversion result banner */}
      {convertResult && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-3 bg-green-500/10 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Client Successfully Converted</p>
              <p className="text-xs text-foreground/50">An invitation email has been sent to {convertResult.email}</p>
            </div>
          </div>
          <div className="p-6">
            <p className="mb-3 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Direct Invitation Link</p>
            <div className="flex items-center gap-2 rounded-xl bg-background p-1 pl-4 border border-glass-border">
              <code className="flex-1 text-sm text-foreground/70 break-all truncate">
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
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {convertError}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Meta & Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Identity Card */}
          <div className="glass-card rounded-2xl bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-glass-border pb-3">
              <User className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Client Identity</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Full Name", value: `${enquiry.firstName} ${enquiry.lastName}` },
                { label: "Email Address", value: enquiry.email },
                { label: "Phone Number", value: enquiry.phone ?? "Not provided" },
                { label: "Company", value: enquiry.company ?? "Individual" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{item.label}</p>
                  <p className="mt-0.5 text-base font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specs Card */}
          <div className="glass-card rounded-2xl bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-glass-border pb-3">
              <Briefcase className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Project Specs</h2>
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{item.label}</p>
                  <p className="mt-0.5 text-base font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2">
          <div className="glass-card h-full rounded-2xl bg-surface/30 p-8">
            <div className="mb-6 flex items-center gap-2 border-b border-glass-border pb-4">
              <Info className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-foreground">Project Description</h2>
            </div>
            
            <div className="max-w-none">
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
