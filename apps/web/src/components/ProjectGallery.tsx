import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { demoProjects } from "@/content/demoProjects";

type ProjectGalleryProps = { limit?: number; compact?: boolean };

export function ProjectGallery({ limit, compact = false }: ProjectGalleryProps) {
  const projects = limit ? demoProjects.slice(0, limit) : demoProjects;

  return (
    <div className={`grid gap-5 md:grid-cols-2 ${compact ? "xl:grid-cols-3" : ""}`}>
      {projects.map((project, index) => (
        <Link
          className="group block overflow-hidden rounded-[1.5rem] border border-black/10 bg-white"
          href={`/work/${project.slug}`}
          key={project.slug}
        >
          <article
            className={`relative h-full ${
              compact ? "min-h-[320px]" : "min-h-[380px] lg:min-h-[460px]"
            }`}
          >
            <Image
              alt={`${project.name} concept interface`}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              fill
              loading={index < 2 ? "eager" : "lazy"}
              sizes={
                compact
                  ? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  : "(max-width: 768px) 100vw, 50vw"
              }
              src={project.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/60 to-[#171717]/10 transition-opacity duration-500 group-hover:opacity-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/85 via-[#171717]/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f7ad45]">{project.category}</p>
              <div className="flex items-end justify-between gap-5">
                <div className="min-w-0">
                  <h3 className="font-display text-3xl leading-none text-white md:text-4xl">{project.name}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/80">{project.story}</p>
                </div>
                <ArrowUpRight aria-hidden="true" className="mb-1 h-6 w-6 shrink-0 text-white transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
