"use client";

import { forgotPasswordSchema } from "@illustriober/shared";
import { type CSSProperties, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { authMutationHeaders } from "@/contexts/AuthContext";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.email?.[0] || "Enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: authMutationHeaders(true),
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to request a reset link");
      }
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to request a reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F4EFE5] px-4 pb-10 pt-28 text-[#171717] sm:px-6 md:px-8 md:pb-12 md:pt-32">
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="hidden min-h-72 flex-col justify-between bg-[#1F4D3D] p-7 text-[#F4EFE5] lg:flex lg:p-10">
          <Link className="flex items-center gap-2.5" href="/"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#F39314] font-display text-lg font-bold text-[#171717]">il</span><span className="text-sm font-bold">Illustriober Creatives</span></Link>
          <div className="mt-12 lg:mt-0"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7ad45]">Account recovery</p><h1 className="mt-4 max-w-sm font-display text-4xl leading-[0.92] md:text-5xl">A secure way <em className="font-normal">back in.</em></h1><p className="mt-5 max-w-sm leading-7 text-[#F4EFE5]/75">We will send a private, time-limited link to the email on your account.</p></div>
          <Link className="mt-12 inline-flex items-center gap-2 text-sm font-bold hover:underline" href="/login"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to sign in</Link>
        </aside>
        <section className="flex min-w-0 items-center px-6 py-10 sm:px-8 lg:px-12" style={{ "--surface": "#FFFDF8", "--border-default": "rgba(23,23,23,0.15)", "--foreground": "#171717" } as CSSProperties}>
          <div className="mx-auto w-full max-w-sm">
            {submitted ? (
              <div aria-live="polite"><CheckCircle2 className="h-7 w-7 text-[#1F4D3D]" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Check your inbox</p><h2 className="mt-3 font-display text-4xl leading-none">Reset link requested.</h2><p className="mt-5 text-sm leading-6 text-[#5F5A50]">If an active account exists for that email, its reset link will arrive shortly and remain valid for 30 minutes.</p><Link className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#1F4D3D] hover:underline" href="/login"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Return to sign in</Link></div>
            ) : (
              <><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Password help</p><h2 className="mt-3 font-display text-4xl leading-none">Reset your password</h2><p className="mt-3 text-sm leading-6 text-[#5F5A50]">Enter the email linked to your portal account.</p><form className="mt-7 space-y-5" onSubmit={handleSubmit}>{error && <div className="rounded-xl border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</div>}<div><label className="mb-2 block text-sm font-medium" htmlFor="email">Email</label><input autoComplete="email" className="w-full rounded-lg border border-[#171717]/15 bg-[#FFFDF8] px-4 py-3 outline-none transition-colors hover:border-[#1F4D3D]/50 focus:border-[#1F4D3D] focus:ring-2 focus:ring-[#1F4D3D]/20 disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting} id="email" name="email" onChange={(event) => { setEmail(event.target.value); setError(null); }} placeholder="you@company.com" required type="email" value={email} /></div><button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">{submitting ? "Sending link..." : "Send reset link"}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></button></form><Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1F4D3D] hover:underline lg:hidden" href="/login"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to sign in</Link></>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
