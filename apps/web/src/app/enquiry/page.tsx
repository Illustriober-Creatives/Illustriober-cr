"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const fieldClass = "mt-2 w-full rounded-xl border border-[#171717]/15 bg-[#FFFDF8] px-4 py-3 text-[#171717] outline-none transition focus:border-[#1F4D3D] focus:ring-2 focus:ring-[#1F4D3D]/15 disabled:cursor-not-allowed disabled:opacity-60";

export default function EnquiryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", company: "", projectType: "", budget: "", timeline: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!response.ok) throw new Error("The form could not be sent.");
      router.push(`/thank-you?email=${encodeURIComponent(formData.email)}`);
    } catch {
      setError("We couldn’t send that just now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4EFE5] pb-16 pt-32 text-[#171717] md:pt-40">
      <section className="mx-auto max-w-6xl px-5 md:px-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Start a project</p><div className="mt-5 grid gap-9 lg:grid-cols-[1.1fr_0.9fr]"><h1 className="max-w-4xl font-display text-5xl leading-[0.9] tracking-[-0.05em] md:text-7xl">Tell us what you&apos;re trying to <em className="font-normal text-[#F39314]">make.</em></h1><p className="self-end max-w-md text-base leading-7 text-[#5F5A50]">A few practical details are enough to begin. We’ll use them to understand the work, not to send a generic reply.</p></div></section>

      <section className="mx-auto mt-14 w-full max-w-5xl px-4 sm:px-6 md:mt-16 lg:px-8"><div className="grid w-full overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative min-h-[280px] min-w-0 overflow-hidden bg-[#1F4D3D] p-6 text-[#F4EFE5] sm:p-7 md:p-8 lg:min-h-full"><Image alt="Product workspace concept" className="object-cover opacity-35" fill sizes="(max-width: 1024px) 100vw, 40vw" src="/projects/concept-portal-dashboard.png" /><div className="relative flex h-full flex-col justify-between"><p className="max-w-sm font-display text-4xl leading-none">Good work starts with a clear conversation.</p><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7ad45]">Prefer email?</p><a className="mt-2 inline-block text-lg font-bold hover:underline" href="mailto:hello@illustriober.com">hello@illustriober.com</a></div></div></aside>
        <div className="min-w-0 p-6 sm:p-7 md:p-8"><h2 className="font-display text-4xl leading-none">Project enquiry</h2><p className="mt-3 text-sm leading-6 text-[#5F5A50]">Fields marked with * are needed to send your enquiry.</p>
          {error && <div aria-live="assertive" className="mt-6 rounded-xl border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}
          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Name *<input className={fieldClass} disabled={loading} name="name" onChange={handleChange} required value={formData.name} /></label><label className="text-sm font-bold">Email *<input className={fieldClass} disabled={loading} name="email" onChange={handleChange} required type="email" value={formData.email} /></label></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Company <input className={fieldClass} disabled={loading} name="company" onChange={handleChange} value={formData.company} /></label><label className="text-sm font-bold">When do you want to begin?<select className={fieldClass} disabled={loading} name="timeline" onChange={handleChange} value={formData.timeline}><option value="">Choose one</option><option value="asap">As soon as possible</option><option value="1-month">Within a month</option><option value="2-3-months">In 2–3 months</option><option value="flexible">Flexible</option></select></label></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">What do you need? *<select className={fieldClass} disabled={loading} name="projectType" onChange={handleChange} required value={formData.projectType}><option value="">Choose one</option><option value="web">Website or web product</option><option value="mobile">Mobile product</option><option value="design">Brand or interface design</option><option value="consulting">Product direction</option><option value="other">Something else</option></select></label><label className="text-sm font-bold">Budget range<select className={fieldClass} disabled={loading} name="budget" onChange={handleChange} value={formData.budget}><option value="">Choose one</option><option value="under-10k">Under $10k</option><option value="10-50k">$10k–$50k</option><option value="50-100k">$50k–$100k</option><option value="100k-plus">$100k+</option></select></label></div>
            <label className="block text-sm font-bold">A little about the project *<textarea className={`${fieldClass} min-h-24 resize-y`} disabled={loading} name="description" onChange={handleChange} placeholder="The problem, the audience, and anything we should know." required value={formData.description} /></label>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-4 text-sm font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">{loading ? "Sending…" : "Send enquiry"}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></button>
          </form>
        </div>
      </div></section>
    </main>
  );
}
