"use client";

import type { RegisterInput } from "@illustriober/shared";
import { registerSchema } from "@illustriober/shared";
import { type CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { FormInput } from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";

type RegisterFieldErrors = Partial<Record<keyof RegisterInput, string>> & { confirmPassword?: string };

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!authLoading && user) router.replace("/dashboard"); }, [authLoading, router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse({ email, password, firstName, lastName });
    const nextErrors: RegisterFieldErrors = parsed.success ? {} : { email: parsed.error.flatten().fieldErrors.email?.[0], password: parsed.error.flatten().fieldErrors.password?.[0], firstName: parsed.error.flatten().fieldErrors.firstName?.[0], lastName: parsed.error.flatten().fieldErrors.lastName?.[0] };
    if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match";
    if (Object.values(nextErrors).some(Boolean)) { setFieldErrors(nextErrors); return; }
    setFieldErrors({});
    setSubmitting(true);
    try { await register({ email, password, firstName, lastName }); router.push("/dashboard"); } catch (caught) { setError(caught instanceof Error ? caught.message : "Registration failed"); } finally { setSubmitting(false); }
  };

  return (
    <main className="min-h-screen bg-[#F4EFE5] px-5 py-6 text-[#171717] md:px-8 md:py-8"><div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] lg:grid-cols-[0.88fr_1.12fr]">
      <aside className="hidden min-h-72 flex-col justify-between bg-[#F39314] p-7 text-[#171717] lg:flex lg:min-h-full lg:p-12"><Link className="flex items-center gap-2.5" href="/"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#171717] font-display text-lg font-bold text-[#F4EFE5]">il</span><span className="text-sm font-bold">Illustriober Creatives</span></Link><div className="mt-16 lg:mt-0"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/65">Client portal</p><h1 className="mt-5 max-w-sm font-display text-5xl leading-[0.9] tracking-[-0.045em] md:text-6xl">A better place to keep work <em className="font-normal">moving.</em></h1><p className="mt-6 max-w-sm leading-7 text-[#171717]/75">Create your account to see project updates and stay close to the decisions that matter.</p></div><Link className="mt-12 inline-flex items-center gap-2 text-sm font-bold hover:underline" href="/login">Already have an account? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></aside>
      <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16" style={{ "--surface": "#FFFDF8", "--border-default": "rgba(23,23,23,0.15)", "--foreground": "#171717" } as CSSProperties}><div className="mx-auto w-full max-w-md"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Client portal</p><h2 className="mt-3 font-display text-4xl leading-none">Create account</h2><p className="mt-3 text-sm leading-6 text-[#5F5A50]">Already registered? <Link className="font-bold text-[#1F4D3D] underline underline-offset-4" href="/login">Sign in</Link>.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>{error && <div className="rounded-xl border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</div>}<div className="grid gap-4 sm:grid-cols-2"><FormInput autoComplete="given-name" disabled={submitting} error={fieldErrors.firstName} label="First name" name="firstName" onChange={(event) => { setFirstName(event.target.value); setFieldErrors((current) => ({ ...current, firstName: undefined })); }} required value={firstName} /><FormInput autoComplete="family-name" disabled={submitting} error={fieldErrors.lastName} label="Last name" name="lastName" onChange={(event) => { setLastName(event.target.value); setFieldErrors((current) => ({ ...current, lastName: undefined })); }} required value={lastName} /></div><FormInput autoComplete="email" disabled={submitting} error={fieldErrors.email} label="Email" name="email" onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }} required type="email" value={email} /><FormInput autoComplete="new-password" disabled={submitting} error={fieldErrors.password} helperText="At least 8 characters" label="Password" name="password" onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined, confirmPassword: undefined })); }} required type="password" value={password} /><FormInput autoComplete="new-password" disabled={submitting} error={fieldErrors.confirmPassword} label="Confirm password" name="confirmPassword" onChange={(event) => { setConfirmPassword(event.target.value); setFieldErrors((current) => ({ ...current, confirmPassword: undefined })); }} required type="password" value={confirmPassword} /><p className="text-xs leading-5 text-[#5F5A50]">By creating an account, you agree to our <Link className="font-bold text-[#1F4D3D] underline underline-offset-2" href="/terms">Terms</Link> and <Link className="font-bold text-[#1F4D3D] underline underline-offset-2" href="/privacy">Privacy Policy</Link>.</p><button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">{submitting ? "Creating account…" : "Create account"}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></button></form>
      </div></section>
    </div></main>
  );
}
