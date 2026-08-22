import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ServicesExplorer } from "@/components/ServicesExplorer";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Services",
  description:
    "Full-stack software development, product design, mobile apps, AI automation, and custom technical setups from Illustriober Creatives.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#F4EFE5] pb-20 pt-36 text-[#171717] md:pt-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ScrollReveal blur scale={0.99} y={24}>
          <section className="relative overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] px-6 py-8 sm:px-8 lg:px-10 lg:py-9">
            <div aria-hidden="true" className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#F39314]/20 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-[#1F4D3D]/15 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">
                  Full-stack software studio
                </p>
                <h1 className="mt-4 max-w-4xl text-balance font-display text-[clamp(3.1rem,6vw,6.2rem)] leading-[1.02] tracking-[-0.055em]">
                  We design, <em className="font-normal text-[#F39314]">build,</em> and improve software.
                </h1>
              </div>
              <div className="lg:pb-1">
                <p className="max-w-lg text-base leading-7 text-[#5F5A50] lg:text-lg lg:leading-8">
                  Full products or focused frontend, backend, mobile, automation,
                  and custom setup work, shaped around the job.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#171717] px-6 text-sm font-bold text-white transition-transform duration-300 motion-safe:hover:-translate-y-0.5"
                    href="/enquiry"
                  >
                    Start a project
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  <a
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#171717]/15 bg-white/70 px-5 text-sm font-bold transition-colors hover:border-[#1F4D3D]/45 hover:bg-white"
                    href="#services-explorer"
                  >
                    Explore services
                    <ArrowDown aria-hidden="true" className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ServicesExplorer />
      </div>
    </main>
  );
}
