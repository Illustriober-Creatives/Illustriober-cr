import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About",
  description: "Illustriober Creatives is a design and development studio for clear, useful digital products.",
  path: "/about",
});

const principles = [
  ["Useful first", "Every screen should make a decision, task, or next step feel easier."],
  ["Built together", "We keep the work visible, make the trade-offs plain, and stay close to the problem."],
  ["Ready to grow", "Good foundations give a product room to change without losing its shape."],
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F4EFE5] pb-20 pt-36 text-[#171717] md:pt-48">
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">About Illustriober</p>
        <div className="mt-5 grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <h1 className="max-w-4xl font-display text-6xl leading-[0.87] tracking-[-0.055em] md:text-8xl">We make the complicated feel <em className="font-normal text-[#F39314]">clear.</em></h1>
          <p className="max-w-md text-lg leading-8 text-[#5F5A50]">Illustriober is a small, practical studio for digital products that need to look considered and work hard.</p>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-5 md:mt-20 md:px-8">
        <div className="grid overflow-hidden rounded-[2rem] bg-[#1F4D3D] lg:grid-cols-2">
          <div className="p-8 text-[#F4EFE5] md:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7ad45]">Our point of view</p>
            <p className="mt-7 max-w-xl font-display text-4xl leading-[1.02] tracking-[-0.035em] md:text-5xl">Strong digital work needs a sharp idea, a calm interface, and the engineering to hold it together.</p>
          </div>
          <div className="relative min-h-[340px]"><Image alt="A considered product interface concept" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 50vw" src="/projects/concept-project-gallery.png" /></div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
        <div className="grid gap-5 md:grid-cols-3">{principles.map(([title, copy], index) => <article className="rounded-[1.5rem] border border-[#171717]/10 bg-[#FFFDF8] p-7 md:p-8" key={title}><p className="text-xs font-bold text-[#F39314]">0{index + 1}</p><h2 className="mt-10 font-display text-3xl">{title}</h2><p className="mt-4 leading-7 text-[#5F5A50]">{copy}</p></article>)}</div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8"><div className="rounded-[2rem] bg-[#F39314] px-7 py-12 text-center md:px-12"><h2 className="font-display text-4xl leading-none md:text-6xl">Have something worth making?</h2><Link className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" href="/enquiry">Tell us about it <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    </main>
  );
}
