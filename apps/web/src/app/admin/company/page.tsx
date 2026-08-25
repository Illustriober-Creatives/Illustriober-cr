"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";

interface CompanyProfile {
  name: string;
  tagline: string | null;
  contactEmail: string;
  phone: string | null;
  address: string | null;
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export default function AdminCompanyPage() {
  const { fetchWithAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchWithAuth("/api/admin/company");
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as { company: CompanyProfile | null };
          if (data.company) {
            setName(data.company.name);
            setTagline(data.company.tagline ?? "");
            setContactEmail(data.company.contactEmail);
            setPhone(data.company.phone ?? "");
            setAddress(data.company.address ?? "");
          }
        } else {
          setLoadError(true);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchWithAuth]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetchWithAuth("/api/admin/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tagline, contactEmail, phone, address }),
      });
      if (!res.ok) {
        setSaveError(await readErrorMessage(res));
        return;
      }
      setSaveSuccess(true);
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader title="Company Profile" />
      <div>
        <p className="max-w-2xl text-base leading-relaxed text-foreground/60">
          Studio settings — not client-facing yet.
        </p>
      </div>

      {loading ? (
        <p className="text-foreground/60">Loading...</p>
      ) : loadError ? (
        <div className="max-w-xl rounded-xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-foreground/60">Couldn&apos;t load company profile. Refresh to try again.</p>
        </div>
      ) : (
        <div className="max-w-xl rounded-xl border border-glass-border bg-surface p-6">
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="company-name"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Business Name
              </label>
              <input
                id="company-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="company-tagline"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Tagline
              </label>
              <input
                id="company-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="company-email"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Contact Email
              </label>
              <input
                id="company-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="company-phone"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Phone
              </label>
              <input
                id="company-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="company-address"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Address
              </label>
              <textarea
                id="company-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Optional"
                rows={2}
                className="w-full resize-none rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            {saveSuccess && <p className="text-sm text-accent">Company profile saved.</p>}

            <button
              type="submit"
              disabled={saving}
              className="self-start rounded-full bg-accent px-6 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
