import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ServiceFlipCards } from "@/components/ServiceFlipCards";
import { HomeHeroGlide } from "@/components/motion/HomeHeroGlide";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ path: "/" });

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#F4EFE5] text-[#171717]">
      <HomeHeroGlide
        copy={
          <>
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Design and development for growing businesses</p>
            <h1 className="max-w-4xl text-balance font-display text-[clamp(3.5rem,6.5vw,6.5rem)] leading-[0.98] tracking-[-0.045em]">Make your business easier to run and easier to choose.</h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5F5A50]">We design and build websites, apps, and custom software that help your customers take action and your team get work done.</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[#171717] px-7 text-base font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5" href="/enquiry">Start a project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
              <a className="inline-flex min-h-14 items-center gap-2 text-base font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="#work">See the work <ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </>
        }
        media={
            <figure>
              <Image alt="Concept interfaces showing examples of web and mobile products" className="aspect-[4/3] rounded-[1.25rem] object-cover" height={1152} priority sizes="(max-width: 1023px) calc(100vw - 2.5rem), 38rem" src="/projects/concept-project-gallery.png" width={1536} />
              <figcaption className="px-1 pt-3 text-xs font-medium text-[#5F5A50]">A look at our product concepts</figcaption>
            </figure>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28" id="services">
        <ScrollReveal className="grid gap-6 lg:grid-cols-[0.55fr_1fr]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">What we build</p>
          <div>
            <h2 className="max-w-3xl font-display text-5xl leading-[0.98] tracking-[-0.045em] md:text-6xl">Start with the problem you want to solve.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5F5A50]">You do not need a technical brief. Tell us where customers get stuck or where your team loses time, and we can work out the right fit together.</p>
          </div>
        </ScrollReveal>
        <ScrollReveal className="mt-10" y={18}>
          <ServiceFlipCards />
        </ScrollReveal>
        <Link className="mt-8 inline-flex items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="/services">Explore all services, including AI automation <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      </section>

      <section className="bg-[#1F4D3D] px-5 py-20 text-[#F4EFE5] md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="grid gap-8 lg:grid-cols-[0.55fr_1fr]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">How we build</p>
            <div>
              <h2 className="max-w-4xl font-display text-5xl leading-[0.98] tracking-[-0.045em] md:text-6xl">Useful on day one. Dependable after launch.</h2>
              <p className="mt-7 max-w-3xl text-base leading-7 text-[#F4EFE5]/80 md:text-lg">We design products to feel simple to the person using them and manageable for the team behind them.</p>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid gap-8 border-t border-[#F4EFE5]/25 pt-8 md:grid-cols-3">
            <p className="text-sm leading-6"><strong className="mb-2 block text-lg text-white">Clear to use</strong>People should know what to do next, on a phone or a computer.</p>
            <p className="text-sm leading-6"><strong className="mb-2 block text-lg text-white">Ready to change</strong>Your product should be practical to update as your business grows.</p>
            <p className="text-sm leading-6"><strong className="mb-2 block text-lg text-white">Built with care</strong>Speed, access, data handling, and testing are part of the work from the start.</p>
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
            <h2 className="font-display text-4xl leading-none md:text-5xl">You stay part of the process.</h2>
            <ol className="mt-8 grid gap-5 border-t border-[#171717]/20 pt-6 sm:grid-cols-3">
              <li><span className="text-xs font-bold text-[#1F4D3D]">01 / Understand</span><p className="mt-2 text-sm leading-6 text-[#5F5A50]">Show us the problem, the people involved, and what success would look like.</p></li>
              <li><span className="text-xs font-bold text-[#1F4D3D]">02 / Shape</span><p className="mt-2 text-sm leading-6 text-[#5F5A50]">We agree on the scope and a useful first release before development begins.</p></li>
              <li><span className="text-xs font-bold text-[#1F4D3D]">03 / Build</span><p className="mt-2 text-sm leading-6 text-[#5F5A50]">We build and test in pieces you can review before launch.</p></li>
            </ol>
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
