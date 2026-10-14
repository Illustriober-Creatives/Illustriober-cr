"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { demoProjects } from "@/content/demoProjects";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type ProjectGalleryProps = {
  limit?: number;
  compact?: boolean;
  showFilter?: boolean;
};

export function ProjectGallery({
  limit,
  compact = false,
  showFilter = false,
}: ProjectGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const list = Array.from(new Set(demoProjects.map((p) => p.category)));
    return ["All", ...list];
  }, []);

  const filteredProjects = useMemo(() => {
    let list = demoProjects;
    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category === selectedCategory);
    }
    return limit ? list.slice(0, limit) : list;
  }, [limit, selectedCategory]);

  const entryScale = compact ? 0.982 : 0.975;
  const imageScale = compact
    ? "scale-[1.02] motion-safe:group-hover:scale-[1.05]"
    : "scale-[1.02] motion-safe:group-hover:scale-[1.06]";

  return (
    <div className="flex flex-col gap-8">
      {showFilter && !limit && (
        <div
          aria-label="Filter concept builds by category"
          className="flex flex-wrap items-center gap-2"
          role="tablist"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                aria-selected={isSelected}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-[background-color,color,transform] duration-200 active:scale-[0.98] ${
                  isSelected
                    ? "bg-[#171717] text-[#F4EFE5] shadow-sm"
                    : "border border-black/10 bg-[#FFFDF8] text-[#5F5A50] hover:border-[#171717]/30 hover:text-[#171717]"
                }`}
                key={category}
                onClick={() => setSelectedCategory(category)}
                role="tab"
                type="button"
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      <div className={`grid gap-5 md:grid-cols-2 ${compact ? "xl:grid-cols-3" : ""}`}>
        {filteredProjects.map((project, index) => (
          <ScrollReveal
            blur
            className="h-full"
            delay={(index % 4) * 0.05}
            key={project.slug}
            scale={entryScale}
            y={20}
          >
            <Link
              className="group block h-full overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#171717] shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:border-[#171717] hover:shadow-[0_20px_50px_rgba(23,23,23,0.18)] motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
              href={`/work/${project.slug}`}
            >
              <article
                className={`relative h-full ${
                  compact ? "min-h-[320px]" : "min-h-[380px] lg:min-h-[440px]"
                }`}
              >
                <Image
                  alt={`${project.name} concept interface`}
                  className={`object-cover ${imageScale} transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:scale-100 motion-reduce:transition-none`}
                  fill
                  loading={index < 2 ? "eager" : "lazy"}
                  sizes={
                    compact
                      ? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      : "(max-width: 768px) 100vw, 50vw"
                  }
                  src={project.image}
                />
                <div className="absolute inset-0 bg-[#171717]/60 transition-colors duration-300 group-hover:bg-[#171717]/45 motion-reduce:transition-none" />
                <div className="absolute inset-x-0 bottom-0 bg-[#171717]/90 p-6 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-reduce:transition-none md:p-8">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f7ad45]">
                      {project.category}
                    </p>
                    <span className="font-mono text-[10px] text-white/50">
                      {project.duration}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-5">
                    <div className="min-w-0">
                      <h3 className="font-display text-3xl leading-none text-white md:text-4xl">
                        {project.name}
                      </h3>
                      <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                        {project.story}
                      </p>
                    </div>
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors duration-200 group-hover:bg-[#F39314] group-hover:text-[#171717]">
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-5 w-5 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
