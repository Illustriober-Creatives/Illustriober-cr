"use client";

import type { LoginInput } from "@illustriober/shared";
import { loginSchema } from "@illustriober/shared";
import { type CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { FormInput } from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";

type LoginFieldErrors = Partial<Record<keyof LoginInput, string>>;

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setFieldErrors({ email: fields.email?.[0], password: fields.password?.[0] });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F4EFE5] px-4 pb-10 pt-28 text-[#171717] sm:px-6 md:px-8 md:pb-12 md:pt-32">
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="hidden min-h-72 flex-col justify-between bg-[#1F4D3D] p-7 text-[#F4EFE5] lg:flex lg:p-10">
          <Link className="flex items-center gap-2.5" href="/"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#F39314] font-display text-lg font-bold text-[#171717]">il</span><span className="text-sm font-bold">Illustriober Creatives</span></Link>
          <div className="mt-12 lg:mt-0"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7ad45]">Client portal</p><h1 className="mt-4 max-w-sm font-display text-4xl leading-[0.92] tracking-[-0.045em] md:text-5xl">Your project, kept in <em className="font-normal">view.</em></h1><p className="mt-5 max-w-sm leading-7 text-[#F4EFE5]/75">Sign in to follow delivery and keep your work moving with the studio.</p></div>
          <Link className="mt-12 inline-flex items-center gap-2 text-sm font-bold hover:underline" href="/enquiry">Need to start a project? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </aside>
        <section className="flex min-w-0 items-center px-6 py-8 sm:px-8 sm:py-10 lg:px-12" style={{ "--surface": "#FFFDF8", "--border-default": "rgba(23,23,23,0.15)", "--foreground": "#171717" } as CSSProperties}><div className="mx-auto w-full max-w-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Welcome back</p><h2 className="mt-3 font-display text-4xl leading-none">Sign in</h2><p className="mt-3 text-sm leading-6 text-[#5F5A50]">New to the portal? <Link className="font-bold text-[#1F4D3D] underline underline-offset-4" href="/register">Create an account</Link>.</p>
          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            {error && <div className="rounded-xl border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</div>}
            <FormInput autoComplete="email" disabled={submitting} error={fieldErrors.email} label="Email" name="email" onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }} placeholder="you@company.com" required type="email" value={email} />
            <FormInput autoComplete="current-password" disabled={submitting} error={fieldErrors.password} label="Password" name="password" onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })); }} placeholder="••••••••" required type="password" value={password} />
            <div className="flex justify-end"><Link className="text-sm font-bold text-[#1F4D3D] hover:underline" href="/forgot-password">Forgot password?</Link></div>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">{submitting ? "Signing in…" : "Sign in"}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></button>
          </form>
        </div></section>
      </div>
    </main>
  );
}
