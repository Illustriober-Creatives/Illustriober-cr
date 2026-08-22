import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { demoProjects } from "@/content/demoProjects";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type ProjectGalleryProps = { limit?: number; compact?: boolean };

export function ProjectGallery({ limit, compact = false }: ProjectGalleryProps) {
  const projects = limit ? demoProjects.slice(0, limit) : demoProjects;
  const entryScale = compact ? 0.982 : 0.975;
  const imageScale = compact
    ? "scale-[1.025] motion-safe:group-hover:scale-[1.06]"
    : "scale-[1.03] motion-safe:group-hover:scale-[1.085]";

  return (
    <div className={`grid gap-5 md:grid-cols-2 ${compact ? "xl:grid-cols-3" : ""}`}>
      {projects.map((project, index) => (
        <ScrollReveal
          blur
          className="h-full"
          delay={(index % 4) * 0.06}
          key={project.slug}
          scale={entryScale}
          y={24}
        >
          <Link
            className="group block h-full overflow-hidden rounded-[1.5rem] border border-black/10 bg-white transition-[transform,border-color,background-color,box-shadow] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#171717] hover:bg-[#171717] hover:shadow-[0_28px_70px_rgba(23,23,23,0.18)] motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.006] motion-reduce:transition-none"
            href={`/work/${project.slug}`}
          >
            <article
              className={`relative h-full ${
                compact ? "min-h-[320px]" : "min-h-[380px] lg:min-h-[460px]"
              }`}
            >
              <Image
                alt={`${project.name} concept interface`}
                className={`object-cover ${imageScale} transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:scale-100 motion-reduce:transition-none`}
                fill
                loading={index < 2 ? "eager" : "lazy"}
                sizes={
                  compact
                    ? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    : "(max-width: 768px) 100vw, 50vw"
                }
                src={project.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/58 to-[#171717]/12 opacity-95 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-70 motion-reduce:transition-none" />
              <div className="absolute inset-0 bg-[#171717] opacity-0 transition-opacity duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-55 motion-reduce:transition-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/92 via-[#171717]/34 to-transparent opacity-35 transition-opacity duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-95 motion-reduce:transition-none" />
              <div className="absolute inset-x-0 bottom-0 p-6 transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:-translate-y-1 motion-reduce:transition-none md:p-8">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f7ad45]">{project.category}</p>
                <div className="flex items-end justify-between gap-5">
                  <div className="min-w-0">
                    <h3 className="font-display text-3xl leading-none text-white md:text-4xl">{project.name}</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/80">{project.story}</p>
                  </div>
                  <ArrowUpRight aria-hidden="true" className="mb-1 h-6 w-6 shrink-0 text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1 motion-reduce:transition-none" />
                </div>
              </div>
            </article>
          </Link>
        </ScrollReveal>
      ))}
    </div>
  );
}
