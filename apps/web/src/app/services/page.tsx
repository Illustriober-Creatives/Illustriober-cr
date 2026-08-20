import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Services", description: "Product strategy, interface design, and software development from Illustriober Creatives.", path: "/services" });

const services = [
  ["01", "Product direction", "Find the right shape before a build begins: priorities, user flows, a technical approach, and a practical roadmap."],
  ["02", "Product design", "Turn complex work into an interface people understand, backed by a reusable design system."],
  ["03", "Software delivery", "Build responsive websites, platforms, dashboards, and internal tools that have a clear job to do."],
  ["04", "Product improvement", "Untangle an existing experience, remove friction, and create a sounder foundation for the next release."],
];

const engagements = [
  ["Product foundation", "For an idea that needs sharper scope before a build.", "Strategy workshop, journey map, prototype, technical direction, and delivery roadmap."],
  ["Focused build", "For a defined product or operational problem that needs shipping.", "Product design, full-stack implementation, quality checks, deployment, and handover."],
  ["Product partner", "For a live product that needs consistent design and engineering momentum.", "A prioritized delivery rhythm across research, design, development, and iteration."],
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#F4EFE5] pb-20 pt-36 text-[#171717] md:pt-48">
      <section className="mx-auto max-w-7xl px-5 md:px-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">What we do</p><div className="mt-5 flex flex-wrap items-end justify-between gap-8"><h1 className="max-w-4xl font-display text-6xl leading-[0.87] tracking-[-0.055em] md:text-8xl">A good idea needs a <em className="font-normal text-[#F39314]">useful</em> shape.</h1><p className="max-w-sm text-lg leading-8 text-[#5F5A50]">We join the strategic thinking, visual craft, and technical delivery needed to take a product forward.</p></div></section>
      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8"><div className="grid overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] md:grid-cols-2">{services.map(([number, title, copy], index) => <article className={`p-8 md:p-10 ${index < 2 ? "border-b border-[#171717]/10" : ""} ${index % 2 === 0 ? "md:border-r" : ""}`} key={title}><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F39314]">{number}</p><h2 className="mt-12 font-display text-4xl leading-none md:text-5xl">{title}</h2><p className="mt-5 max-w-md leading-7 text-[#5F5A50]">{copy}</p></article>)}</div></section>
      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
        <div className="grid gap-9 lg:grid-cols-[0.72fr_1.28fr]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Ways to work together</p><h2 className="mt-4 font-display text-4xl leading-none md:text-5xl">Choose the shape that matches the risk.</h2></div><div className="divide-y divide-black/10 border-y border-black/10">{engagements.map(([title, fit, includes], index) => <article className="grid gap-3 py-7 sm:grid-cols-[3rem_0.7fr_1fr] sm:gap-6" key={title}><p className="text-xs font-bold text-[#F39314]">0{index + 1}</p><div><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#5F5A50]">{fit}</p></div><p className="text-sm leading-6 text-[#5F5A50]"><span className="font-bold text-[#171717]">Includes: </span>{includes}</p></article>)}</div></div>
      </section>
      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8"><div className="grid gap-8 rounded-[2rem] bg-[#1F4D3D] p-8 text-[#F4EFE5] md:grid-cols-[1fr_auto] md:items-end md:p-12"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7ad45]">How we work</p><h2 className="mt-5 max-w-2xl font-display text-4xl leading-none md:text-5xl">Start with the real question. Keep the delivery moving.</h2></div><Link className="inline-flex items-center gap-2 rounded-full bg-[#F4EFE5] px-6 py-3.5 text-sm font-bold text-[#171717] transition-transform hover:-translate-y-0.5" href="/enquiry">Start a project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    </main>
  );
}
