"use client";

import { resetPasswordSchema } from "@illustriober/shared";
import { type CSSProperties, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { authMutationHeaders } from "@/contexts/AuthContext";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is incomplete. Request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter a valid password");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: authMutationHeaders(true),
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to reset password");
      }
      setComplete(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F4EFE5] px-4 pb-10 pt-28 text-[#171717] sm:px-6 md:px-8 md:pb-12 md:pt-32">
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="hidden min-h-72 flex-col justify-between bg-[#F39314] p-7 text-[#171717] lg:flex lg:p-10"><Link className="flex items-center gap-2.5" href="/"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#171717] font-display text-lg font-bold text-[#F4EFE5]">il</span><span className="text-sm font-bold">Illustriober Creatives</span></Link><div className="mt-12 lg:mt-0"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/65">Account recovery</p><h1 className="mt-4 max-w-sm font-display text-4xl leading-[0.92] md:text-5xl">Fresh credentials. Same <em className="font-normal">workspace.</em></h1><p className="mt-5 max-w-sm leading-7 text-[#171717]/75">Choose a strong password you do not use for another account.</p></div><Link className="mt-12 inline-flex items-center gap-2 text-sm font-bold hover:underline" href="/login"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to sign in</Link></aside>
        <section className="flex min-w-0 items-center px-6 py-10 sm:px-8 lg:px-12" style={{ "--surface": "#FFFDF8", "--border-default": "rgba(23,23,23,0.15)", "--foreground": "#171717" } as CSSProperties}><div className="mx-auto w-full max-w-sm">{complete ? <div aria-live="polite"><CheckCircle2 className="h-7 w-7 text-[#1F4D3D]" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Password updated</p><h2 className="mt-3 font-display text-4xl leading-none">You are ready to sign in.</h2><p className="mt-5 text-sm leading-6 text-[#5F5A50]">Your previous sessions have been signed out.</p><Link className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-[#F4EFE5]" href="/login">Continue to sign in<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div> : <><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Choose a password</p><h2 className="mt-3 font-display text-4xl leading-none">Secure your account</h2><p className="mt-3 text-sm leading-6 text-[#5F5A50]">Use at least eight characters.</p><form className="mt-7 space-y-5" onSubmit={handleSubmit}>{error && <div className="rounded-xl border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</div>}<div><label className="mb-2 block text-sm font-medium" htmlFor="password">New password</label><input autoComplete="new-password" className="w-full rounded-lg border border-[#171717]/15 bg-[#FFFDF8] px-4 py-3 outline-none transition-colors hover:border-[#1F4D3D]/50 focus:border-[#1F4D3D] focus:ring-2 focus:ring-[#1F4D3D]/20 disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting} id="password" name="password" onChange={(event) => { setPassword(event.target.value); setError(null); }} required type="password" value={password} /></div><div><label className="mb-2 block text-sm font-medium" htmlFor="confirmPassword">Confirm new password</label><input autoComplete="new-password" className="w-full rounded-lg border border-[#171717]/15 bg-[#FFFDF8] px-4 py-3 outline-none transition-colors hover:border-[#1F4D3D]/50 focus:border-[#1F4D3D] focus:ring-2 focus:ring-[#1F4D3D]/20 disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting} id="confirmPassword" name="confirmPassword" onChange={(event) => { setConfirmPassword(event.target.value); setError(null); }} required type="password" value={confirmPassword} /></div><button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">{submitting ? "Updating password..." : "Update password"}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></button></form><Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1F4D3D] hover:underline lg:hidden" href="/login"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to sign in</Link></>}</div></section>
      </div>
    </main>
  );
}
