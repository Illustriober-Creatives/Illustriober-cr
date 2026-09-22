import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About",
  description: "Illustriober Creatives builds websites, custom software and mobile apps with performance, scalability and security in mind.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F4EFE5] pb-20 pt-36 text-[#171717] md:pt-48">
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <ScrollReveal blur scale={0.99} y={24}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">About Illustriober</p>
          <div className="mt-5 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <h1 className="max-w-4xl font-display text-6xl leading-[0.9] tracking-[-0.055em] md:text-7xl">Websites and software built for your business.</h1>
            <div className="lg:pt-3">
              <p className="max-w-lg text-lg leading-8 text-[#5F5A50]">Illustriober Creatives designs and develops websites, custom systems and mobile apps. We work with businesses that need their technology to do a clear job and keep working as they grow.</p>
              <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="/services">See our services <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
        <ScrollReveal blur scale={0.985} y={28}>
          <div className="grid overflow-hidden rounded-[2rem] bg-[#1F4D3D] lg:grid-cols-2">
            <div className="p-8 text-[#F4EFE5] md:p-12 lg:p-16">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">Our approach</p>
              <h2 className="mt-7 max-w-xl font-display text-4xl leading-[1.02] tracking-[-0.035em] md:text-5xl">Define the job. Build what is needed. Make it last.</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#F4EFE5]/80">A good project starts with the people who will use it and the work they need to finish. That gives us a useful scope, a practical first release and a way to judge whether the product is doing its job.</p>
            </div>
            <div className="relative min-h-[340px]"><Image alt="Concept interfaces for web and mobile products" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 50vw" src="/projects/concept-project-gallery.png" /></div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
        <ScrollReveal className="grid gap-8 border-b border-[#171717]/20 pb-8 lg:grid-cols-[0.55fr_1fr]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">What matters in the build</p>
          <h2 className="font-display text-4xl leading-none md:text-5xl">Performance, scalability and security are design decisions.</h2>
        </ScrollReveal>
        <div className="divide-y divide-[#171717]/20">
          <div className="grid gap-3 py-7 md:grid-cols-[0.55fr_1fr] md:gap-10"><h3 className="font-display text-2xl">Performance</h3><p className="max-w-2xl leading-7 text-[#5F5A50]">We pay attention to loading, navigation and the speed of everyday tasks, especially on the devices your customers use.</p></div>
          <div className="grid gap-3 py-7 md:grid-cols-[0.55fr_1fr] md:gap-10"><h3 className="font-display text-2xl">Scalability</h3><p className="max-w-2xl leading-7 text-[#5F5A50]">We structure the product so your team can add features, handle more data and improve the experience without starting again.</p></div>
          <div className="grid gap-3 py-7 md:grid-cols-[0.55fr_1fr] md:gap-10"><h3 className="font-display text-2xl">Security</h3><p className="max-w-2xl leading-7 text-[#5F5A50]">We consider who can access what, how information is handled and what needs checking before a release.</p></div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
        <ScrollReveal blur scale={0.985} y={24}>
          <div className="grid gap-8 rounded-[2rem] bg-[#F39314] px-7 py-12 md:grid-cols-[1fr_auto] md:items-end md:px-12">
            <div>
              <h2 className="max-w-3xl font-display text-4xl leading-none md:text-6xl">Tell us what your business needs to build.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#171717]/75">A new website, a custom system or a mobile app can start with a conversation about the problem.</p>
            </div>
            <Link className="inline-flex w-fit items-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" href="/enquiry">Discuss your project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
