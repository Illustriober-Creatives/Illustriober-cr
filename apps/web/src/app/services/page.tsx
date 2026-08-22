import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Atom,
  ArrowDown,
  ArrowUpRight,
  Bot,
  Braces,
  Cloud,
  CloudCog,
  Code2,
  Container,
  Database,
  FileCode2,
  GitBranch,
  Layers3,
  LayoutTemplate,
  Network,
  Palette,
  PanelsTopLeft,
  Rocket,
  Server,
  ServerCog,
  Smartphone,
  Sparkles,
  Terminal,
  Triangle,
  Waypoints,
  Wind,
  Workflow,
} from "lucide-react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Services",
  description:
    "Full-stack software development, product design, mobile apps, AI automation, and custom technical setups from Illustriober Creatives.",
  path: "/services",
});

const pageNavigation = [
  ["Workflow", "#workflow"],
  ["Capabilities", "#capabilities"],
  ["Stack", "#stack"],
  ["Delivery", "#delivery"],
];

const workflowSteps = [
  ["01", "Define", "Clarify the job, users, scope, and sensible first release."],
  ["02", "Design", "Shape the flows, interface, and reusable product system."],
  ["03", "Build", "Develop, integrate, test, and review in working increments."],
  ["04", "Ship", "Deploy, document, hand over, and keep improving what matters."],
];

const capabilities: Array<{
  copy: string;
  Icon: LucideIcon;
  label: string;
  title: string;
}> = [
  {
    Icon: Layers3,
    label: "End to end",
    title: "Full-stack products",
    copy: "Web platforms, SaaS products, portals, dashboards, marketplaces, and internal tools—from interface to infrastructure.",
  },
  {
    Icon: LayoutTemplate,
    label: "Focused layer",
    title: "Frontend systems",
    copy: "Responsive websites and product interfaces with accessible components, thoughtful motion, and a design system that can grow.",
  },
  {
    Icon: ServerCog,
    label: "Focused layer",
    title: "Backend and APIs",
    copy: "Business logic, data models, integrations, authentication, payments, and reliable APIs for new or existing products.",
  },
  {
    Icon: Smartphone,
    label: "Cross-platform",
    title: "Mobile apps",
    copy: "Mobile-first products and companion apps designed around the job people need to complete away from a desk.",
  },
  {
    Icon: Bot,
    label: "Human-led",
    title: "AI and automation",
    copy: "Useful assistants, retrieval, content operations, and workflow automation with clear review points and practical safeguards.",
  },
  {
    Icon: CloudCog,
    label: "Made to fit",
    title: "Custom setups",
    copy: "CMS, analytics, cloud delivery, CI/CD, third-party tools, and tailored technical foundations that suit the way you operate.",
  },
];

const engagements = [
  {
    title: "Build the whole product",
    copy: "One joined-up team for direction, design, frontend, backend, launch, and the first rounds of improvement.",
  },
  {
    title: "Strengthen one layer",
    copy: "Bring us in for a focused frontend, backend, mobile, design-system, integration, or automation engagement.",
  },
  {
    title: "Improve what already exists",
    copy: "Untangle friction, modernise the foundation, add a missing capability, or prepare the product for its next release.",
  },
];

const stackGroups = [
  {
    Icon: Braces,
    title: "Languages",
    items: [
      { Icon: FileCode2, label: "TypeScript" },
      { Icon: Braces, label: "JavaScript" },
      { Icon: Terminal, label: "Python" },
      { Icon: Database, label: "SQL" },
      { Icon: Smartphone, label: "Swift" },
      { Icon: Smartphone, label: "Kotlin" },
    ],
  },
  {
    Icon: Code2,
    title: "Frontend",
    items: [
      { Icon: Atom, label: "React" },
      { Icon: PanelsTopLeft, label: "Next.js" },
      { Icon: Triangle, label: "Vue" },
      { Icon: Wind, label: "Tailwind CSS" },
      { Icon: Palette, label: "Design systems" },
    ],
  },
  {
    Icon: Database,
    title: "Backend and data",
    items: [
      { Icon: Server, label: "Node.js" },
      { Icon: Database, label: "PostgreSQL" },
      { Icon: Database, label: "MongoDB" },
      { Icon: Layers3, label: "Redis" },
      { Icon: Waypoints, label: "REST" },
      { Icon: Network, label: "GraphQL" },
    ],
  },
  {
    Icon: Workflow,
    title: "Mobile and delivery",
    items: [
      { Icon: Smartphone, label: "React Native" },
      { Icon: Rocket, label: "Expo" },
      { Icon: Cloud, label: "AWS" },
      { Icon: Triangle, label: "Vercel" },
      { Icon: Container, label: "Docker" },
      { Icon: GitBranch, label: "GitHub Actions" },
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#F4EFE5] pb-20 pt-36 text-[#171717] md:pt-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] px-6 py-8 sm:px-8 lg:px-10 lg:py-9">
          <div aria-hidden="true" className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#F39314]/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-[#1F4D3D]/15 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">
                Full-stack software studio
              </p>
              <h1 className="mt-4 max-w-4xl text-balance font-display text-[clamp(3.1rem,6vw,6.2rem)] leading-[1.02] tracking-[-0.055em]">
                We design, <em className="font-normal text-[#F39314]">build,</em> and improve software.
              </h1>
            </div>
            <div className="lg:pb-1">
              <p className="max-w-lg text-base leading-7 text-[#5F5A50] lg:text-lg lg:leading-8">
                Full products or focused frontend, backend, mobile, automation,
                and custom setup work—shaped around the job.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#171717] px-6 text-sm font-bold text-white transition-transform duration-300 motion-safe:hover:-translate-y-0.5"
                  href="/enquiry"
                >
                  Start a project
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#171717]/15 bg-white/70 px-5 text-sm font-bold transition-colors hover:border-[#1F4D3D]/45 hover:bg-white"
                  href="#capabilities"
                >
                  See capabilities
                  <ArrowDown aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <nav
          aria-label="Explore services"
          className="mt-4 flex items-center gap-5 overflow-x-auto rounded-full bg-[#1F4D3D] px-5 py-3 text-[#F4EFE5] [scrollbar-width:none] sm:px-6"
        >
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F7AD45]">
            Explore
          </span>
          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-[#F4EFE5]/20" />
          {pageNavigation.map(([label, href]) => (
            <a
              className="inline-flex min-h-10 shrink-0 items-center text-sm font-bold text-[#F4EFE5]/80 transition-colors hover:text-white focus-visible:text-white"
              href={href}
              key={href}
            >
              {label}
            </a>
          ))}
        </nav>

        <section
          className="mt-4 scroll-mt-36 overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8]"
          id="workflow"
        >
          <div className="flex flex-col gap-2 border-b border-[#171717]/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-3">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-[#D96800]" />
              <h2 className="text-sm font-bold">Development workflow</h2>
            </div>
            <p className="text-xs text-[#5F5A50]">A clear path from question to working release.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map(([number, title, copy], index) => (
              <article
                className={`min-h-32 px-6 py-5 transition-colors hover:bg-[#F39314]/[0.06] sm:px-7 ${index < workflowSteps.length - 1 ? "border-b border-[#171717]/10 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r" : ""} ${index === 1 ? "sm:border-b sm:border-r-0 lg:border-b-0 lg:border-r" : ""}`}
                key={title}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-[#D96800]">{number}</p>
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#1F4D3D]" />
                </div>
                <h3 className="mt-3 font-display text-2xl leading-none">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#5F5A50]">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 scroll-mt-36 md:mt-24" id="capabilities">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">
              What we can build
            </p>
            <h2 className="mt-4 max-w-6xl text-balance font-display text-4xl leading-[1.02] tracking-[-0.03em] sm:text-5xl">
              The whole product, or the part holding it back.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#5F5A50]">
              Start with an idea, a defined build, or a live system. We can own the full path or join your team at the layer where focused design and engineering will make the clearest difference.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map(({ copy, Icon, label, title }) => (
              <article
                className="group rounded-[1.5rem] border border-[#171717]/10 bg-[#FFFDF8] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#F39314]/50 hover:shadow-[0_18px_45px_rgba(23,23,23,0.08)]"
                key={title}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1F4D3D] text-[#F4EFE5] transition-colors group-hover:bg-[#F39314] group-hover:text-[#171717]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D96800]">{label}</p>
                </div>
                <h3 className="mt-8 font-display text-3xl leading-none">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#5F5A50]">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 md:mt-24">
          <div className="grid overflow-hidden rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] lg:grid-cols-[0.72fr_1.28fr]">
            <div className="bg-[#F39314] p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em]">Flexible engagements</p>
              <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] sm:text-5xl">
                Meet the product where it is.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-[#171717]/70">
                Scope around the actual risk instead of forcing every project into the same package.
              </p>
            </div>
            <div className="divide-y divide-[#171717]/10">
              {engagements.map((engagement, index) => (
                <article className="grid gap-3 p-6 sm:grid-cols-[2.5rem_0.7fr_1fr] sm:items-start sm:gap-5 sm:p-7" key={engagement.title}>
                  <p className="text-xs font-bold text-[#D96800]">0{index + 1}</p>
                  <h3 className="font-display text-2xl leading-none">{engagement.title}</h3>
                  <p className="text-sm leading-6 text-[#5F5A50]">{engagement.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mt-20 scroll-mt-36 overflow-hidden rounded-[2rem] bg-[#1F4D3D] text-[#F4EFE5] md:mt-24"
          id="stack"
        >
          <div className="border-b border-[#F4EFE5]/15 p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">Tools for the job</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[0.95] tracking-[-0.03em] sm:text-5xl">
              A practical stack, selected around the product.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#F4EFE5]/70">
              These are common tools, not a fixed recipe. We choose for maintainability, team fit, performance, and the work ahead.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4">
            {stackGroups.map(({ Icon, items, title }, index) => (
              <article
                className={`p-7 sm:p-8 ${index < stackGroups.length - 1 ? "border-b border-[#F4EFE5]/15 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r" : ""} ${index === 1 ? "sm:border-b sm:border-r-0 xl:border-b-0 xl:border-r" : ""}`}
                key={title}
              >
                <div className="flex items-center gap-2.5">
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#F7AD45]" />
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {items.map(({ Icon: ItemIcon, label }) => (
                    <li
                      className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#F4EFE5]/25 bg-transparent px-3 py-2 text-xs font-medium text-[#F4EFE5]/80 transition-colors duration-200 hover:border-[#F7AD45] hover:bg-[#F7AD45] hover:text-[#171717] motion-reduce:transition-none"
                      key={label}
                    >
                      <ItemIcon
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-[#F7AD45] transition-colors duration-200 group-hover:text-[#171717] motion-reduce:transition-none"
                      />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 scroll-mt-36 md:mt-24" id="delivery">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F39314] via-[#F7AD45] to-[#F4EFE5] p-7 sm:p-10 lg:p-12">
            <div aria-hidden="true" className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[3rem] border-[#1F4D3D]/10" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Human-led. AI-assisted.</p>
                <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[0.92] tracking-[-0.035em] sm:text-6xl">
                  Move faster without giving up judgment.
                </h2>
              </div>
              <div className="lg:pt-9">
                <p className="max-w-xl text-sm leading-6 text-[#171717]/75 sm:text-base sm:leading-7">
                  We use AI where it improves research, prototyping, development, testing, and operations. Product decisions, quality review, security, and release responsibility stay with people.
                </p>
                <Link
                  className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#171717] px-6 text-sm font-bold text-white transition-transform duration-300 motion-safe:hover:-translate-y-0.5"
                  href="/enquiry"
                >
                  Tell us what you need
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
