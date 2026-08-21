import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GitHubActivity } from "@/components/GitHubActivity";
import { ProjectGallery } from "@/components/ProjectGallery";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Work", description: "Studio demo projects exploring clear digital products and systems.", path: "/work" });

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-[#F4EFE5] px-5 pb-20 pt-40 text-[#171717] md:px-8 md:pt-48">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Concept studies</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-7"><h1 className="max-w-4xl font-display text-5xl leading-[0.9] tracking-[-0.05em] md:text-7xl">Ideas made <em className="font-normal text-[#F39314]">useful.</em></h1><p className="max-w-sm text-base leading-7 text-[#5F5A50]">Product directions that show how a clearer interface can make everyday work easier.</p></div>
        <div className="mt-14"><ProjectGallery /></div>
        <GitHubActivity />
        <div className="mt-12 flex flex-col gap-5 rounded-[2rem] bg-[#F39314] px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between md:py-8">
          <h2 className="whitespace-nowrap font-display text-[clamp(1.7rem,4vw,3.5rem)] leading-none">
            Let&apos;s put your story here.
          </h2>
          <Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" href="/enquiry">
            Start a project
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
