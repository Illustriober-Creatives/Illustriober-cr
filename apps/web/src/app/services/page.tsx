import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Services",
  description: "Websites, custom software, mobile apps and AI automation from Illustriober Creatives. Built with performance, scalability and security in mind.",
  path: "/services",
});

const coreServices = [
  {
    title: "Websites and web apps",
    summary: "Give people a fast, clear way to find you, use your service or get work done online.",
    detail: "We build business websites, customer portals, dashboards and browser based products. That includes the interface people see and the systems that make it work.",
  },
  {
    title: "Custom software",
    summary: "Replace scattered spreadsheets and awkward tools with software that fits your work.",
    detail: "We build internal platforms, operational systems, SaaS products and integrations. We can start with a focused first release, then add capability as the need becomes clear.",
  },
  {
    title: "Mobile apps",
    summary: "Put the important parts of your service in people's hands.",
    detail: "We design and develop mobile products for customers or teams on the move, with attention to usability, performance and the systems behind the app.",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#F4EFE5] pb-20 pt-36 text-[#171717] md:pt-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ScrollReveal blur scale={0.99} y={24}>
          <section className="border-b border-[#171717]/20 pb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Services</p>
            <h1 className="mt-5 max-w-5xl font-display text-6xl leading-[0.9] tracking-[-0.055em] md:text-8xl">Websites, software and mobile apps.</h1>
            <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-3xl text-lg leading-8 text-[#5F5A50]">We design, build and improve digital products for businesses. Performance, scalability and security guide the work from the first decision to launch.</p>
              <Link className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#171717] px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" href="/enquiry">Discuss your project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </section>
        </ScrollReveal>

        <section className="scroll-mt-28 pt-16 md:pt-20" id="core-services">
          <ScrollReveal className="grid gap-6 pb-8 lg:grid-cols-[0.42fr_1fr]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Core services</p>
            <h2 className="font-display text-4xl leading-none md:text-5xl">What we can build for you.</h2>
          </ScrollReveal>
          <div className="divide-y divide-[#171717]/20 border-y border-[#171717]/20">
            {coreServices.map((service, index) => (
              <ScrollReveal blur delay={index * 0.05} key={service.title} y={18}>
                <article className="grid gap-5 py-9 md:grid-cols-[0.42fr_1fr] md:gap-10 md:py-12">
                  <h3 className="font-display text-3xl leading-none md:text-4xl">{service.title}</h3>
                  <div>
                    <p className="max-w-2xl text-xl leading-7 text-[#171717]">{service.summary}</p>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-[#5F5A50]">{service.detail}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-8 md:mt-24 lg:grid-cols-[0.42fr_1fr]">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Focused work</p>
            <h2 className="mt-4 font-display text-4xl leading-none md:text-5xl">Need help with one part?</h2>
          </ScrollReveal>
          <div className="divide-y divide-[#171717]/20 border-t border-[#171717]/20">
            <div className="py-7"><h3 className="font-display text-2xl">AI automation</h3><p className="mt-3 max-w-2xl leading-7 text-[#5F5A50]">Automate repeatable work, add useful assistants or connect AI to existing workflows. We define where human review is needed before putting it into use.</p></div>
            <div className="py-7"><h3 className="font-display text-2xl">Integrations and existing systems</h3><p className="mt-3 max-w-2xl leading-7 text-[#5F5A50]">Connect your tools, improve a slow or difficult workflow, or strengthen the frontend, backend and data behind a live product.</p></div>
            <div className="py-7"><h3 className="font-display text-2xl">Product design</h3><p className="mt-3 max-w-2xl leading-7 text-[#5F5A50]">Clarify the users, map the important journeys and design an interface that helps people complete the task they came for.</p></div>
          </div>
        </section>
      </div>

      <section className="mt-20 bg-[#1F4D3D] px-5 py-20 text-[#F4EFE5] md:mt-24 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="grid gap-8 lg:grid-cols-[0.42fr_1fr]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">Build standards</p>
            <div>
              <h2 className="max-w-4xl font-display text-5xl leading-[0.98] tracking-[-0.045em] md:text-6xl">Speed, growth and security belong in the plan.</h2>
              <p className="mt-6 max-w-3xl text-base leading-7 text-[#F4EFE5]/80">We make choices about load speed, system structure and access to data while the product is being designed. We test those choices before release and keep the system understandable for the people who will maintain it.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <section className="grid gap-8 pt-20 md:pt-24 lg:grid-cols-[0.42fr_1fr]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">How a project works</p>
          <div>
            <h2 className="font-display text-4xl leading-none md:text-5xl">Start with the scope you need.</h2>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[#5F5A50]">We discuss the problem, agree on a first release and make the work reviewable as we build. Whether it is a new product or an improvement to an existing one, you have a clear view of progress and cost before the next stage.</p>
            <Link className="mt-7 inline-flex items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="/tech-stack">See the tools we work with <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] bg-[#F39314] px-7 py-12 md:mt-24 md:px-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/70">Talk to us</p>
              <h2 className="mt-5 max-w-3xl font-display text-4xl leading-none md:text-6xl">What do you need to build or improve?</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#171717]/75">Tell us about the business problem. We will help find a sensible place to start.</p>
            </div>
            <Link className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#171717] px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" href="/enquiry">Discuss your project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
