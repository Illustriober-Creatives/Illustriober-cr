import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Password Help", description: "Get help recovering access to the Illustriober client portal.", path: "/forgot-password", noIndex: true });

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F4EFE5] px-5 py-6 text-[#171717] md:px-8 md:py-8"><div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] p-6 md:p-10"><section className="w-full max-w-xl"><Link className="inline-flex items-center gap-2 text-sm font-bold text-[#1F4D3D] hover:underline" href="/login"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to sign in</Link><div className="mt-10 rounded-[1.5rem] bg-[#1F4D3D] p-7 text-[#F4EFE5] md:p-10"><Mail className="h-6 w-6 text-[#f7ad45]" aria-hidden="true" /><p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#f7ad45]">Password help</p><h1 className="mt-4 font-display text-5xl leading-[0.92] tracking-[-0.04em]">Let&apos;s get you back in.</h1><p className="mt-6 max-w-md leading-7 text-[#F4EFE5]/75">Password reset automation isn&apos;t public yet. Email us from the address linked to your account and include your company name so we can verify the request.</p><a className="mt-8 inline-flex rounded-full bg-[#F4EFE5] px-5 py-3 text-sm font-bold text-[#171717] transition-transform hover:-translate-y-0.5" href="mailto:hello@illustriober.com">Email hello@illustriober.com</a></div></section></div></main>
  );
}
