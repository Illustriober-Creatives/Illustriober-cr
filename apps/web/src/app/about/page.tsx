import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About",
  description: "Illustriober Creatives builds websites, custom software and mobile apps with performance, scalability and security in mind.",
  path: "/about",
});

const buildPillars = [
  {
    number: "01",
    tag: "USABILITY",
    title: "Performance",
    description: "We pay attention to loading, navigation and the speed of everyday tasks, especially on the devices your customers use.",
    icon: Zap,
  },
  {
    number: "02",
    tag: "ARCHITECTURE",
    title: "Scalability",
    description: "We structure the product so your team can add features, handle more data and improve the experience without starting again.",
    icon: TrendingUp,
  },
  {
    number: "03",
    tag: "INTEGRITY",
    title: "Security",
    description: "We consider who can access what, how information is handled and what needs checking before a release.",
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F4EFE5] pb-20 pt-10 text-[#171717] md:pt-14">
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <ScrollReveal blur scale={0.99} y={24}>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">About Illustriober</p>
          <div className="mt-5 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <h1 className="max-w-4xl text-balance font-display text-5xl leading-[0.9] tracking-[-0.055em] md:text-7xl">Websites and software built for your business.</h1>
            <div className="lg:pt-3">
              <p className="max-w-lg text-lg leading-8 text-[#5F5A50]">Illustriober Creatives designs and develops websites, custom systems and mobile apps. We work with businesses that need their technology to do a clear job and keep working as they grow.</p>
              <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1F4D3D] underline decoration-[#F39314] decoration-2 underline-offset-4 hover:text-[#171717]" href="/services">See our services <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
        <ScrollReveal blur scale={0.985} y={28}>
          <div className="grid overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#1F4D3D] shadow-sm lg:grid-cols-2">
            <div className="flex flex-col justify-between p-8 text-[#F4EFE5] md:p-12 lg:p-16">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">Our approach</p>
                <h2 className="mt-6 max-w-xl text-balance font-display text-4xl leading-[1.02] tracking-[-0.035em] md:text-5xl">Define the job. Build what is needed. Make it last.</h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#F4EFE5]/80">A good project starts with the people who will use it and the work they need to finish. That gives us a useful scope, a practical first release and a way to judge whether the product is doing its job.</p>
              </div>
              <div className="mt-8 border-t border-white/15 pt-6 text-xs text-[#F4EFE5]/70">
                <span className="font-bold text-[#F7AD45]">Boutique studio model:</span> Every build is engineered with focused attention and direct founder collaboration.
              </div>
            </div>
            <div className="relative min-h-[360px] overflow-hidden">
              <div className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#171717]/85 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F4EFE5]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F7AD45]" />
                Studio practice · Nairobi, KE
              </div>
              <Image alt="Concept interfaces for web and mobile products" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 50vw" src="/projects/concept-project-gallery.png" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
        <ScrollReveal className="grid gap-6 border-b border-[#171717]/15 pb-8 lg:grid-cols-[0.45fr_1fr]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">What matters in the build</p>
          <h2 className="text-balance font-display text-4xl leading-tight md:text-5xl">We plan for performance, scalability and security at the design stage.</h2>
        </ScrollReveal>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {buildPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <ScrollReveal delay={index * 0.06} key={pillar.title}>
                <article className="group flex h-full flex-col justify-between rounded-[1.75rem] border border-[#171717]/10 bg-[#FFFDF8] p-7 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[#171717]/25 hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#1F4D3D]">
                        {pillar.number} / {pillar.tag}
                      </span>
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4EFE5] text-[#1F4D3D] transition-colors group-hover:bg-[#1F4D3D] group-hover:text-[#F4EFE5]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-[#171717]">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#5F5A50]">
                      {pillar.description}
                    </p>
                  </div>
                  <div className="mt-6 border-t border-[#171717]/10 pt-4">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#1F4D3D]">
                      Core engineering standard
                    </span>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
        <ScrollReveal blur scale={0.985} y={24}>
          <div className="grid gap-8 rounded-[2.25rem] border border-[#171717]/10 bg-[#F39314] px-7 py-12 shadow-[0_18px_50px_rgba(243,147,20,0.18)] md:grid-cols-[1fr_auto] md:items-end md:px-12">
            <div>
              <h2 className="max-w-3xl text-balance font-display text-4xl leading-tight md:text-6xl">Tell us what your business needs to build.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#171717]/80">A new website, a custom system or a mobile app can start with a conversation about the problem.</p>
            </div>
            <Link className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#171717] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-[transform,box-shadow] duration-300 hover:bg-[#2A2824] hover:shadow-xl active:scale-[0.98] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none" href="/enquiry">Discuss your project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
