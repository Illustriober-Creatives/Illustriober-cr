"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Globe, Layers, SlidersHorizontal, Smartphone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ServiceItem = {
  number: string;
  title: string;
  description: string;
  examples: string;
  exampleList: string[];
  enquiryType: string;
  icon: typeof Globe;
  details: {
    fitFor: string;
    deliverables: string[];
    startingStep: string;
  };
};

const services: ServiceItem[] = [
  {
    number: "01",
    title: "Websites",
    description: "Help customers understand what you do and trust you enough to take the next step.",
    examples: "Business sites · Online shops · Booking pages",
    exampleList: ["Business sites", "Online shops", "Booking pages"],
    enquiryType: "web",
    icon: Globe,
    details: {
      fitFor: "Businesses needing clear positioning, trustworthy presentation, and straightforward visitor conversions.",
      deliverables: [
        "Responsive marketing architecture for phone and desktop",
        "Clear service breakdowns and inquiry routing",
        "Fast page loads and search engine foundation",
        "Straightforward updates and content management"
      ],
      startingStep: "We map the pages you actually need and agree on the primary action visitors should take."
    }
  },
  {
    number: "02",
    title: "Custom software",
    description: "Bring scattered tasks and information into a system built around how your team works.",
    examples: "Client portals · Staff dashboards · Order tracking",
    exampleList: ["Client portals", "Staff dashboards", "Order tracking"],
    enquiryType: "software",
    icon: Layers,
    details: {
      fitFor: "Teams outgrowing spreadsheets, ad-hoc chat coordination, or rigid off-the-shelf software.",
      deliverables: [
        "Role-aware dashboards and structured access controls",
        "Unified data views and task tracking pipelines",
        "Audited data handling and reliable automated backups",
        "Clean APIs for current and future integrations"
      ],
      startingStep: "We review the manual workflow that currently costs your team the most time."
    }
  },
  {
    number: "03",
    title: "Mobile apps",
    description: "Let people book, order, or stay connected from their phones.",
    examples: "Customer apps · Membership apps · Field tools",
    exampleList: ["Customer apps", "Membership apps", "Field tools"],
    enquiryType: "mobile",
    icon: Smartphone,
    details: {
      fitFor: "Services where convenience, instant notifications, or on-the-go access drive engagement.",
      deliverables: [
        "Focused phone-first user journeys and clear navigation",
        "Push notification workflows and status updates",
        "Resilient offline-first data synchronization",
        "Connected backend systems and administration views"
      ],
      startingStep: "We define the 2 or 3 core actions a user must be able to complete in under 30 seconds."
    }
  },
];

export function ServiceFlipCards() {
  const [activeModal, setActiveModal] = useState<ServiceItem | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModal(null);
      }
    };
    if (activeModal) {
      window.addEventListener("keydown", handleKeyDown);
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
    };
  }, [activeModal]);

  return (
    <div className="relative">
      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <motion.article
              className="group relative flex flex-col justify-between rounded-[1.75rem] border border-[#171717]/10 bg-[#FFFDF8] p-7 shadow-[0_4px_20px_rgba(23,23,23,0.04)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[#171717]/25 hover:shadow-[0_18px_42px_rgba(23,23,23,0.08)] md:p-8"
              key={service.number}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#1F4D3D]">
                    {service.number}
                  </span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4EFE5] text-[#171717] transition-colors group-hover:bg-[#171717] group-hover:text-[#F4EFE5]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>

                <h3 className="mt-6 font-display text-3xl leading-[1.05] tracking-[-0.035em] text-[#171717] md:text-4xl">
                  {service.title}
                </h3>

                <p className="mt-4 text-base leading-7 text-[#5F5A50]">
                  {service.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {service.exampleList.map((item) => (
                    <span
                      className="rounded-full bg-[#F4EFE5] px-3 py-1 text-xs font-semibold text-[#171717]/85"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-[#171717]/10 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-[#1F4D3D] underline decoration-[#F39314] decoration-2 underline-offset-4 transition-colors hover:text-[#171717]"
                    href={`/enquiry?service=${service.enquiryType}`}
                  >
                    Start project <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>

                  <button
                    aria-label={`View scope breakdown for ${service.title}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#171717]/15 bg-[#F4EFE5] px-3.5 text-xs font-bold text-[#171717] transition-all hover:bg-[#171717] hover:text-[#F4EFE5] active:scale-[0.97]"
                    onClick={() => setActiveModal(service)}
                    type="button"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                    Scope breakdown
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Scope Breakdown Modal / Overlay */}
      <AnimatePresence>
        {activeModal && (
          <div
            aria-labelledby="service-modal-title"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
          >
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-[#171717]/55"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              transition={{ duration: 0.2 }}
            />

            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#171717]/15 bg-[#FFFDF8] p-7 shadow-[0_24px_70px_rgba(23,23,23,0.24)] sm:p-10"
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#171717]/10 pb-5">
                <div>
                  <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#1F4D3D]">
                    {activeModal.number} / SCOPE BREAKDOWN
                  </span>
                  <h2
                    className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-[#171717] sm:text-4xl"
                    id="service-modal-title"
                  >
                    {activeModal.title}
                  </h2>
                </div>
                <button
                  aria-label="Close modal"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#171717]/15 bg-[#F4EFE5] text-[#171717] transition-transform hover:scale-105 active:scale-95"
                  onClick={() => setActiveModal(null)}
                  type="button"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F4D3D]">
                    Where this fits best
                  </p>
                  <p className="mt-2 text-base leading-7 text-[#171717]">
                    {activeModal.details.fitFor}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F4D3D]">
                    What we typically deliver
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {activeModal.details.deliverables.map((item) => (
                      <li className="flex items-start gap-2.5 text-sm leading-6 text-[#5F5A50]" key={item}>
                        <div className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#1F4D3D] text-white">
                          <Check className="h-2.5 w-2.5" aria-hidden="true" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#171717]/10 bg-[#F4EFE5]/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F4D3D]">
                    How we start
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#171717]">
                    {activeModal.details.startingStep}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#171717]/10 pt-5">
                <span className="text-xs font-medium text-[#5F5A50]">
                  Examples: {activeModal.examples}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#5F5A50] hover:text-[#171717]"
                    onClick={() => setActiveModal(null)}
                    type="button"
                  >
                    Close
                  </button>
                  <Link
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#171717] px-6 text-sm font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                    href={`/enquiry?service=${activeModal.enquiryType}`}
                    onClick={() => setActiveModal(null)}
                  >
                    Start a project <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
