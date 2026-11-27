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
  const currentIndex = demoProjects.findIndex((item) => item.slug === slug);
  if (currentIndex === -1) notFound();
  const project = demoProjects[currentIndex];

  const prevProject = demoProjects[(currentIndex - 1 + demoProjects.length) % demoProjects.length];
  const nextProject = demoProjects[(currentIndex + 1) % demoProjects.length];

  return (
    <div className="min-h-screen bg-[#F4EFE5] pb-20 text-[#171717]">
      <section className="relative min-h-[560px] overflow-hidden bg-[#171717]">
        <Image
          alt={`${project.name} project cover`}
          className="object-cover opacity-75"
          fill
          priority
          sizes="100vw"
          src={project.image}
        />
        <div className="absolute inset-0 bg-[#171717]/65" />
        <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-between px-5 pb-12 pt-16 md:px-8 md:pb-16 md:pt-20">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            <Link className="inline-flex items-center gap-1.5 transition-colors hover:text-white" href="/work">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              All concept builds
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-[#f7ad45]">{project.category}</span>
          </nav>
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f7ad45]/30 bg-[#171717]/80 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#f7ad45]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f7ad45]" />
              {project.category} · Concept exploration
            </div>
            <h1 className="text-balance font-display text-5xl leading-[0.9] tracking-[-0.05em] text-white md:text-8xl">
              {project.name}
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">
              The problem and idea
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl leading-[1.08] tracking-[-0.035em] text-[#171717] md:text-5xl">
              {project.brief}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#5F5A50] md:text-lg">
              {project.story}
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] p-8 shadow-sm">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">
              Project parameters
            </span>
            <dl className="mt-6 divide-y divide-[#171717]/10">
              <div className="flex items-baseline justify-between py-4">
                <dt className="text-sm text-[#5F5A50]">Format</dt>
                <dd className="font-bold text-[#171717]">{project.built}</dd>
              </div>
              <div className="flex items-baseline justify-between py-4">
                <dt className="text-sm text-[#5F5A50]">Typical delivery</dt>
                <dd className="font-mono text-sm font-bold text-[#171717]">{project.duration}</dd>
              </div>
              <div className="flex items-baseline justify-between py-4">
                <dt className="text-sm text-[#5F5A50]">Domain focus</dt>
                <dd className="text-right font-bold text-[#171717]">{project.category}</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-[#171717]/10 pt-6">
              {project.liveUrl ? (
                <a
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                  href={project.liveUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open live preview <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : (
                <div className="flex items-center justify-between text-xs text-[#5F5A50]">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#1F4D3D]">
                    <span className="h-2 w-2 rounded-full bg-[#1F4D3D]" />
                    Studio prototype
                  </span>
                  <span>Interactive review upon request</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary Next Action Banner */}
        <div className="mt-16 rounded-[2.25rem] border border-[#171717]/10 bg-[#F39314] p-8 shadow-[0_18px_50px_rgba(243,147,20,0.18)] md:mt-24 md:p-12">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/75">
                Next steps
              </p>
              <h3 className="mt-3 max-w-2xl text-balance font-display text-3xl leading-tight text-[#171717] md:text-5xl">
                Have a product challenge in this domain?
              </h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#171717]/85">
                We design and build systems tailored to your specific workflows and business goals. Let us look at what you need to solve.
              </p>
            </div>
            <Link
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#171717] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-[transform,box-shadow] hover:bg-[#2A2824] hover:shadow-xl active:scale-[0.98] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
              href={`/enquiry?project=${project.slug}`}
            >
              Discuss your project
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Prev / Next Project Navigation */}
        <nav aria-label="Other concept projects" className="mt-16 grid gap-6 border-t border-[#171717]/15 pt-12 sm:grid-cols-2">
          <Link
            className="group flex flex-col justify-between rounded-[1.75rem] border border-[#171717]/10 bg-[#FFFDF8] p-7 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#171717]/30 hover:shadow-md"
            href={`/work/${prevProject.slug}`}
          >
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#5F5A50] group-hover:text-[#1F4D3D]">
                ← Previous concept
              </span>
              <h4 className="mt-3 font-display text-2xl font-bold text-[#171717]">
                {prevProject.name}
              </h4>
              <p className="mt-2 text-xs text-[#5F5A50]">{prevProject.category}</p>
            </div>
          </Link>
          <Link
            className="group flex flex-col justify-between rounded-[1.75rem] border border-[#171717]/10 bg-[#FFFDF8] p-7 text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#171717]/30 hover:shadow-md sm:text-right"
            href={`/work/${nextProject.slug}`}
          >
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#5F5A50] group-hover:text-[#1F4D3D]">
                Next concept →
              </span>
              <h4 className="mt-3 font-display text-2xl font-bold text-[#171717]">
                {nextProject.name}
              </h4>
              <p className="mt-2 text-xs text-[#5F5A50]">{nextProject.category}</p>
            </div>
          </Link>
        </nav>
      </section>
    </div>
  );
}
