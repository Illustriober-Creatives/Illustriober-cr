import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Password Help", description: "Get help recovering access to the Illustriober client portal.", path: "/forgot-password", noIndex: true });

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F4EFE5] px-4 pb-10 pt-28 text-[#171717] sm:px-6 md:px-8 md:pb-12 md:pt-32"><div className="mx-auto flex w-full max-w-2xl items-center justify-center overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] p-6 sm:p-8"><section className="w-full max-w-lg"><Link className="inline-flex items-center gap-2 text-sm font-bold text-[#1F4D3D] hover:underline" href="/login"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to sign in</Link><div className="mt-8 rounded-[1.5rem] bg-[#1F4D3D] p-6 text-[#F4EFE5] sm:p-8"><Mail className="h-6 w-6 text-[#f7ad45]" aria-hidden="true" /><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#f7ad45]">Password help</p><h1 className="mt-4 font-display text-4xl leading-[0.92] tracking-[-0.04em] sm:text-5xl">Let&apos;s get you back in.</h1><p className="mt-5 max-w-md leading-7 text-[#F4EFE5]/75">Password reset automation isn&apos;t public yet. Email us from the address linked to your account and include your company name so we can verify the request.</p><a className="mt-7 inline-flex rounded-full bg-[#F4EFE5] px-5 py-3 text-sm font-bold text-[#171717] transition-transform hover:-translate-y-0.5" href="mailto:hello@illustriober.com">Email hello@illustriober.com</a></div></section></div></main>
  );
}
