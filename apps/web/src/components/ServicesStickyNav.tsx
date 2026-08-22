"use client";

import { useEffect, useRef, useState } from "react";

const servicesNavigation = [
  { id: "workflow", label: "Workflow" },
  { id: "capabilities", label: "Capabilities" },
  { id: "stack", label: "Stack" },
  { id: "delivery", label: "Delivery" },
] as const;

type ServicesSectionId = (typeof servicesNavigation)[number]["id"];

export function ServicesStickyNav() {
  const navRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<ServicesSectionId>("workflow");

  useEffect(() => {
    let frame = 0;

    const updateActiveSection = () => {
      const viewportHeight = window.innerHeight;
      const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 0;
      const activationLine = navBottom + Math.min(170, viewportHeight * 0.18);
      const earlyActivationBottom = viewportHeight * 0.72;
      let nextActive: ServicesSectionId = servicesNavigation[0].id;
      let visibleCandidate: { id: ServicesSectionId; score: number } | null = null;

      for (const { id } of servicesNavigation) {
        const section = document.getElementById(id);

        if (!section) {
          continue;
        }

        const rect = section.getBoundingClientRect();

        if (rect.top <= activationLine) {
          nextActive = id;
        }

        if (rect.bottom > navBottom && rect.top < earlyActivationBottom) {
          const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, navBottom);
          const score = Math.abs(rect.top - activationLine) - Math.max(visibleHeight, 0) * 0.25;

          if (!visibleCandidate || score < visibleCandidate.score) {
            visibleCandidate = { id, score };
          }
        }
      }

      setActiveId(visibleCandidate?.id ?? nextActive);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, []);

  return (
    <nav
      aria-label="Explore services"
      ref={navRef}
      className="services-sticky-nav overflow-hidden rounded-full border border-[#F4EFE5]/15 bg-[#1F4D3D]/95 px-3 py-2 text-[#F4EFE5] shadow-[0_18px_45px_rgba(31,77,61,0.16)] backdrop-blur md:px-4"
    >
      <div className="flex items-center gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 rounded-full bg-[#F7AD45]/12 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F7AD45]">
          Explore
        </span>
        <span aria-hidden="true" className="h-5 w-px shrink-0 bg-[#F4EFE5]/20" />
        <div className="flex min-w-max items-center gap-1">
          {servicesNavigation.map(({ id, label }) => {
            const isActive = activeId === id;

            return (
              <a
                aria-current={isActive ? "true" : undefined}
                className={`services-nav-link relative inline-flex min-h-10 shrink-0 items-center rounded-full px-3 text-sm font-bold transition-colors duration-300 active:scale-[0.98] motion-reduce:transition-none ${
                  isActive ? "text-[#F7AD45]" : "text-[#F4EFE5]/78 hover:text-white focus-visible:text-white"
                }`}
                href={`#${id}`}
                key={id}
                onClick={() => setActiveId(id)}
              >
                {label}
                <span
                  aria-hidden="true"
                  className={`services-nav-indicator absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-[#F7AD45] transition-all duration-300 motion-reduce:transition-none ${
                    isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                  }`}
                />
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
