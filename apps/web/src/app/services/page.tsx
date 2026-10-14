import Link from "next/link";
import { ArrowUpRight, Compass, Globe, Layers, ShieldCheck, Smartphone, Sparkles, Workflow } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Services",
  description: "Websites, custom software, mobile apps and AI automation from Illustriober Creatives. Built with performance, scalability and security in mind.",
  path: "/services",
});

const coreServices = [
  {
    number: "01",
    title: "Websites and web apps",
    summary: "Give people a fast, clear way to find you, use your service or get work done online.",
    detail: "We build business websites, customer portals, dashboards and browser-based products. That includes the interface people see and the systems that make it work.",
    icon: Globe,
    enquiryType: "web",
  },
  {
    number: "02",
    title: "Custom software",
    summary: "Replace scattered spreadsheets and awkward tools with software that fits your work.",
    detail: "We build internal platforms, operational systems, SaaS products and integrations. We can start with a focused first release, then add more as the need becomes clear.",
    icon: Layers,
    enquiryType: "software",
  },
  {
    number: "03",
    title: "Mobile apps",
    summary: "Put the important parts of your service in people's hands.",
    detail: "We design and develop mobile products for customers or teams on the move, with attention to usability, performance and the systems behind the app.",
    icon: Smartphone,
    enquiryType: "mobile",
  },
];

const focusedWork = [
  {
    title: "AI automation",
    description: "Automate repeatable work, add assistants or connect AI to existing workflows. We define where human review is needed before putting it into use.",
    icon: Sparkles,
  },
  {
    title: "Integrations and existing systems",
    description: "Connect your tools, fix a slow or difficult workflow, or improve the frontend, backend and data behind a live product.",
    icon: Workflow,
  },
  {
    title: "Product design",
    description: "Work out who your users are, map what they need to do and design an interface that helps them do it.",
    icon: Compass,
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#F4EFE5] pb-20 pt-10 text-[#171717] md:pt-14">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ScrollReveal blur scale={0.99} y={24}>
          <section className="border-b border-[#171717]/15 pb-16">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">
              Services
            </span>
            <h1 className="mt-5 max-w-5xl text-balance font-display text-6xl leading-[0.9] tracking-[-0.055em] text-[#171717] md:text-8xl">
              Websites, software and mobile apps.
            </h1>
            <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-3xl text-lg leading-8 text-[#5F5A50]">
                We design, build and improve digital products for businesses. We plan for performance, scalability and security before we build.
              </p>
              <Link
                className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#171717] px-7 text-sm font-bold text-white shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                href="/enquiry"
              >
                Discuss your project <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </ScrollReveal>

        <section className="scroll-mt-28 pt-16 md:pt-20" id="core-services">
          <ScrollReveal className="grid gap-6 pb-10 lg:grid-cols-[0.42fr_1fr]">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">
              Core services
            </span>
            <h2 className="font-display text-4xl leading-none tracking-[-0.035em] text-[#171717] md:text-5xl">
              What we can build for you.
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 md:gap-8">
            {coreServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <ScrollReveal blur delay={index * 0.05} key={service.title} y={18}>
                  <article className="group relative rounded-[2rem] border border-[#171717]/10 bg-[#FFFDF8] p-8 shadow-[0_4px_24px_rgba(23,23,23,0.04)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[#171717]/25 hover:shadow-[0_20px_48px_rgba(23,23,23,0.08)] md:p-10">
                    <div className="grid gap-6 md:grid-cols-[0.38fr_1fr] md:gap-10">
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#1F4D3D]">
                            {service.number}
                          </span>
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4EFE5] text-[#171717] transition-colors group-hover:bg-[#171717] group-hover:text-[#F4EFE5]">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                        </div>
                        <h3 className="mt-5 font-display text-3xl leading-tight tracking-[-0.035em] text-[#171717] md:text-4xl">
                          {service.title}
                        </h3>
                      </div>

                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="max-w-2xl text-xl font-medium leading-8 text-[#171717]">
                            {service.summary}
                          </p>
                          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5F5A50]">
                            {service.detail}
                          </p>
                        </div>
                        <div className="mt-6 pt-4">
                          <Link
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1F4D3D] underline decoration-[#F39314] decoration-2 underline-offset-4 transition-colors hover:text-[#171717]"
                            href={`/enquiry?service=${service.enquiryType}`}
                          >
                            Discuss {service.title.toLowerCase()} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="mt-24 md:mt-28">
          <ScrollReveal className="grid gap-6 pb-10 lg:grid-cols-[0.42fr_1fr]">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">
              Focused work
            </span>
            <h2 className="font-display text-4xl leading-none tracking-[-0.035em] text-[#171717] md:text-5xl">
              Need help with one part?
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {focusedWork.map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal delay={index * 0.05} key={item.title}>
                  <div className="group relative flex h-full flex-col justify-between rounded-[1.75rem] border border-[#171717]/10 bg-[#FFFDF8] p-7 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[#F39314]/40 hover:shadow-md">
                    <div>
                      <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-[#F4EFE5] text-[#1F4D3D] transition-colors group-hover:bg-[#1F4D3D] group-hover:text-white">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-2xl font-bold tracking-tight text-[#171717]">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#5F5A50]">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-6 border-t border-[#171717]/10 pt-4">
                      <Link
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4D3D] underline decoration-[#F39314] decoration-2 underline-offset-4 hover:text-[#171717]"
                        href="/enquiry"
                      >
                        Inquire about this <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-24 bg-[#1F4D3D] px-5 py-20 text-[#F4EFE5] md:mt-28 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="grid gap-8 lg:grid-cols-[0.42fr_1fr]">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">
              Build standards
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-[#F7AD45]" aria-hidden="true" />
                <h2 className="max-w-4xl font-display text-5xl leading-[0.98] tracking-[-0.045em] md:text-6xl">
                  Speed, growth and security belong in the plan.
                </h2>
              </div>
              <p className="mt-6 max-w-3xl text-base leading-7 text-[#F4EFE5]/85 md:text-lg">
                We make choices about load speed, system structure and access to data while the product is being designed. We test those choices before release and keep the system understandable for the people who will maintain it.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <section className="grid gap-8 pt-20 md:pt-28 lg:grid-cols-[0.42fr_1fr]">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">
            How a project works
          </span>
          <div>
            <h2 className="font-display text-4xl leading-none tracking-[-0.035em] text-[#171717] md:text-5xl">
              Start with the scope you need.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[#5F5A50] md:text-lg">
              We discuss the problem, agree on a first release and build in pieces you can review. Whether it is a new product or an improvement to an existing one, you have a clear view of progress and cost before the next stage.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#1F4D3D] underline decoration-[#F39314] decoration-2 underline-offset-4 hover:text-[#171717]"
              href="/tech-stack"
            >
              See the tools we work with <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="mt-20 md:mt-28">
          <ScrollReveal y={24} scale={0.985} className="group relative overflow-hidden rounded-[2.25rem] border border-[#171717]/10 bg-[#F39314] px-8 py-14 shadow-[0_18px_50px_rgba(243,147,20,0.18)] md:px-14 md:py-18">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/75">
                  Talk to us
                </span>
                <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight tracking-[-0.035em] text-[#171717] md:text-6xl">
                  What do you need to build or improve?
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-[#171717]/80">
                  Tell us about the business problem. We will help find a sensible place to start.
                </p>
              </div>
              <Link
                className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#171717] px-7 text-sm font-bold text-white shadow-md transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                href="/enquiry"
              >
                Discuss your project <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
