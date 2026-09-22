import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { HomeHeroGlide } from "@/components/motion/HomeHeroGlide";
import { HeroTypewriter } from "@/components/motion/HeroTypewriter";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ path: "/" });

const services = [
  { title: "Websites and web apps", copy: "Business websites, customer portals and web apps that load quickly, work across devices and make the next step obvious." },
  { title: "Custom software", copy: "Dashboards, internal systems and platforms built around the way your team actually works. Start with what matters now and leave room to grow." },
  { title: "Mobile apps", copy: "Mobile products for the people who need your service on the move, with a clear path from first release to ongoing improvement." },
];

const heroPurposePhrases = ["a website.", "custom software.", "a mobile app."];

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#F4EFE5] text-[#171717]">
      <HomeHeroGlide
        copy={
          <>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Websites · Custom software · Mobile apps</p>
            <HeroTypewriter phrases={heroPurposePhrases} />
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5F5A50] md:text-xl">We build websites, custom software and mobile apps with performance, scalability and security built in. Tell us what your business needs to do.</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[#171717] px-7 text-base font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5" href="/enquiry">Discuss your project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
              <a className="inline-flex min-h-14 items-center gap-2 text-base font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="#services">See what we build <ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </>
        }
        media={
            <Image alt="Concept interfaces for web and mobile products" className="aspect-[4/3] rounded-[1.25rem] object-cover" height={1152} priority sizes="(max-width: 1023px) calc(100vw - 2.5rem), 38rem" src="/projects/concept-project-gallery.png" width={1536} />
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28" id="services">
        <ScrollReveal className="grid gap-6 border-b border-[#171717]/20 pb-10 lg:grid-cols-[0.55fr_1fr]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">What we build</p>
          <div>
            <h2 className="max-w-3xl font-display text-5xl leading-[0.98] tracking-[-0.045em] md:text-6xl">Choose the product you need.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5F5A50]">We can build something new or improve a product you already use.</p>
          </div>
        </ScrollReveal>
        <div>
          {services.map((service, index) => (
            <ScrollReveal blur delay={index * 0.05} key={service.title} y={18}>
              <article className="grid gap-4 border-b border-[#171717]/20 py-8 md:grid-cols-[0.55fr_1fr] md:items-start md:gap-10 md:py-10">
                <h3 className="font-display text-3xl leading-none md:text-4xl">{service.title}</h3>
                <p className="max-w-2xl text-base leading-7 text-[#5F5A50] md:text-lg">{service.copy}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
        <Link className="mt-8 inline-flex items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="/services">Explore all services, including AI automation <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      </section>

      <section className="bg-[#1F4D3D] px-5 py-20 text-[#F4EFE5] md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="grid gap-8 lg:grid-cols-[0.55fr_1fr]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">How we build</p>
            <div>
              <h2 className="max-w-4xl font-display text-5xl leading-[0.98] tracking-[-0.045em] md:text-6xl">Fast to use. Ready to grow. Built with security in mind.</h2>
              <p className="mt-7 max-w-3xl text-base leading-7 text-[#F4EFE5]/80 md:text-lg">We consider load speed, the growth of your users and data, and the protection of accounts from the start. Those choices shape the design, architecture and testing of every build.</p>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid gap-8 border-t border-[#F4EFE5]/25 pt-8 md:grid-cols-3">
            <p className="text-sm leading-6"><strong className="mb-2 block text-lg text-white">Performance</strong>Pages and workflows should respond quickly on the devices people actually use.</p>
            <p className="text-sm leading-6"><strong className="mb-2 block text-lg text-white">Scalability</strong>We plan for new features, growing data and more users without making routine changes painful.</p>
            <p className="text-sm leading-6"><strong className="mb-2 block text-lg text-white">Security</strong>Access, data handling and release checks are part of the build, not a final add-on.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28" id="work">
        <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Concept projects</p><h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.045em] md:text-6xl">See the kinds of products we build.</h2></div><Link className="inline-flex items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="/work">View all concept projects <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></ScrollReveal>
        <ProjectGallery limit={4} />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <ScrollReveal className="grid gap-7 border-t border-[#171717]/20 pt-10 lg:grid-cols-[0.55fr_1fr]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Working together</p>
          <div>
            <h2 className="font-display text-4xl leading-none md:text-5xl">A clear scope before we write code.</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#5F5A50]">We agree on the first release, build in pieces you can review, and test before launch. You see what is being built, what it costs and what comes next.</p>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <ScrollReveal y={24} scale={0.985} className="rounded-[2rem] bg-[#F39314] px-7 py-14 md:px-12 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/70">Start here</p>
              <h2 className="mt-5 max-w-3xl text-balance font-display text-5xl leading-[1.02] tracking-[-0.045em] md:text-6xl">Need a website, app or better software for your business?</h2>
              <p className="mt-5 max-w-2xl text-lg leading-7 text-[#171717]/75">Tell us what you want to build or what is not working today.</p>
            </div>
            <Link className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#171717] px-7 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" href="/enquiry">Discuss your project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
