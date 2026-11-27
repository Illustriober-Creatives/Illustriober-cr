import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Work", description: "Concept websites, software and mobile products by Illustriober Creatives.", path: "/work" });

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-[#F4EFE5] px-5 pb-20 pt-10 text-[#171717] md:px-8 md:pt-14">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal blur y={22} scale={0.99}>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Concept projects</p>
          <div className="mt-5">
            <h1 className="max-w-4xl text-balance font-display text-5xl leading-[0.9] tracking-[-0.05em] md:text-7xl">Websites, systems and apps in practice.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#5F5A50]">These are concept builds that show the kinds of business problems we can solve. They are examples of our approach, not client case studies.</p>
          </div>
        </ScrollReveal>
        <div className="mt-12">
          <ProjectGallery showFilter />
        </div>
        <ScrollReveal blur className="mt-16" scale={0.985} y={24}>
          <div className="flex flex-col gap-6 rounded-[2.25rem] border border-[#171717]/10 bg-[#F39314] px-7 py-8 shadow-[0_18px_50px_rgba(243,147,20,0.18)] transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 sm:px-10 md:flex-row md:items-center md:justify-between md:py-10">
            <h2 className="max-w-xl text-balance font-display text-[clamp(1.7rem,4vw,3.5rem)] leading-tight text-[#171717]">
              Have a product you want us to build?
            </h2>
            <Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#171717] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-[transform,box-shadow] duration-300 hover:bg-[#2A2824] hover:shadow-xl active:scale-[0.98] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none" href="/enquiry">
              Discuss your project
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
