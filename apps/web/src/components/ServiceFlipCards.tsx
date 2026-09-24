"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Globe, LayoutDashboard, RotateCcw, Smartphone, type LucideIcon } from "lucide-react";
import styles from "./ServiceFlipCards.module.css";

type Service = {
  id: string;
  enquiryType: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  explanation: string;
  examples: string[];
  cta: string;
  frontClass: string;
  backClass: string;
};

const services: Service[] = [
  {
    id: "website",
    enquiryType: "web",
    icon: Globe,
    title: "Websites",
    tagline: "A website that shows people who you are and how to reach you.",
    explanation: "We design and build your website so customers can find you on Google, see what you offer, and call, book or buy.",
    examples: ["Business websites", "Online shops", "Booking pages"],
    cta: "Request a website",
    frontClass: styles.webFront,
    backClass: styles.webBack,
  },
  {
    id: "software",
    enquiryType: "software",
    icon: LayoutDashboard,
    title: "Custom software",
    tagline: "A system made for the way your business runs.",
    explanation: "Stop juggling spreadsheets and paper. We build one place where your team can track orders, clients, stock or staff.",
    examples: ["Staff dashboards", "Client portals", "Order and stock tracking"],
    cta: "Request custom software",
    frontClass: styles.softwareFront,
    backClass: styles.softwareBack,
  },
  {
    id: "mobile",
    enquiryType: "mobile",
    icon: Smartphone,
    title: "Mobile apps",
    tagline: "An app your customers download on their phone.",
    explanation: "We build apps for iPhone and Android so your customers can order, book or check their account wherever they are.",
    examples: ["Ordering apps", "Booking apps", "Membership apps"],
    cta: "Request a mobile app",
    frontClass: styles.mobileFront,
    backClass: styles.mobileBack,
  },
];

function ServiceFlipCard({ service }: { service: Service }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = service.icon;

  // Touch screens have no hover, so a tap flips the card instead.
  const handleClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("a")) return;
    if (window.matchMedia("(hover: none)").matches) setFlipped((current) => !current);
  };

  return (
    <div className={`${styles.card} cursor-pointer`} data-flipped={flipped} onClick={handleClick}>
      <div className={styles.inner}>
        <div className={`${styles.face} ${service.frontClass} justify-between`}>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <Icon className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-4xl leading-none tracking-[-0.03em] md:text-5xl">{service.title}</h3>
            <p className="mt-4 text-lg leading-7">{service.tagline}</p>
            <p className="mt-6 inline-flex items-center gap-2 text-sm font-bold opacity-90">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Tap or point here to learn more
            </p>
          </div>
        </div>

        <div className={`${styles.face} ${styles.back} ${service.backClass}`}>
          <h3 className="font-display text-3xl leading-none">{service.title}</h3>
          <p className="mt-4 text-lg leading-7">{service.explanation}</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] opacity-80">For example</p>
          <ul className="mb-6 mt-2 space-y-1 text-base">
            {service.examples.map((example) => (
              <li key={example}>• {example}</li>
            ))}
          </ul>
          <Link
            className="mt-auto inline-flex min-h-12 shrink-0 w-fit items-center gap-2 rounded-full bg-[#FFFDF8] px-6 text-base font-bold text-[#171717] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFDF8]"
            href={`/enquiry?service=${service.enquiryType}`}
          >
            {service.cta} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ServiceFlipCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {services.map((service) => (
        <ServiceFlipCard key={service.id} service={service} />
      ))}
    </div>
  );
}
