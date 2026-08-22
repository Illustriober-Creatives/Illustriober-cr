import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { demoProjects } from "@/content/demoProjects";
import { createMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return demoProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = demoProjects.find((item) => item.slug === slug);
  if (!project) return {};

  return createMetadata({
    title: project.name,
    description: project.brief,
    path: `/work/${project.slug}`,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = demoProjects.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-[#F4EFE5] pb-20 text-[#171717]">
      <section className="relative min-h-[620px] overflow-hidden bg-[#171717]">
        <Image alt={`${project.name} project cover`} className="object-cover opacity-80" fill priority sizes="100vw" src={project.image} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/45 to-[#171717]/10" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-between px-5 pb-12 pt-32 md:px-8 md:pb-16">
          <Link className="inline-flex w-fit items-center gap-2 text-sm font-bold text-white transition-opacity hover:opacity-70" href="/work"><ArrowLeft className="h-4 w-4" aria-hidden="true" />All projects</Link>
          <div className="max-w-4xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.19em] text-[#f7ad45]">{project.category} · Demo concept</p>
            <h1 className="font-display text-6xl leading-[0.86] tracking-[-0.055em] text-white md:text-8xl">{project.name}</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">The idea</p>
            <p className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] tracking-[-0.035em] md:text-5xl">{project.brief}</p>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5F5A50]">{project.story}</p>
          </div>
          <dl className="border-t border-[#171717]/15">
            <div className="flex items-baseline justify-between border-b border-[#171717]/15 py-5"><dt className="text-sm text-[#5F5A50]">Built</dt><dd className="text-right font-bold">{project.built}</dd></div>
            <div className="flex items-baseline justify-between border-b border-[#171717]/15 py-5"><dt className="text-sm text-[#5F5A50]">Delivery window</dt><dd className="font-bold">{project.duration}</dd></div>
            <div className="flex items-baseline justify-between border-b border-[#171717]/15 py-5"><dt className="text-sm text-[#5F5A50]">Focus</dt><dd className="text-right font-bold">{project.category}</dd></div>
          </dl>
        </div>

        <div className="mt-16 border-y border-[#171717]/15 py-14 text-center md:mt-24 md:py-20">
          <p className="mx-auto max-w-lg text-sm leading-6 text-[#5F5A50]">A live client URL can be added here when this project is replaced in the admin area.</p>
          {project.liveUrl ? (
            <a className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5" href={project.liveUrl} rel="noreferrer" target="_blank">Open site <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          ) : (
            <span aria-disabled="true" className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-[#171717]/35 px-6 py-3.5 text-sm font-bold text-[#F4EFE5]">Open site <span className="text-white/65">· link pending</span></span>
          )}
        </div>
      </section>
    </main>
  );
}
