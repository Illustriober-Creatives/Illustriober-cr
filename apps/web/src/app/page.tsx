import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, CheckCircle2, Compass, Hammer, RefreshCw, ShieldCheck, SlidersHorizontal } from "lucide-react";
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
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[#171717] px-8 text-base font-bold text-[#F4EFE5] shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(23,23,23,0.14)] active:scale-[0.98]" href="/enquiry">
                Start a project <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a className="inline-flex min-h-14 items-center gap-2 text-base font-bold text-[#171717] underline decoration-[#F39314] decoration-2 underline-offset-4 transition-colors hover:text-[#A64A00]" href="#work">
                See the work <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </>
        }
        media={
          <figure className="relative">
            <Image alt="Concept interfaces showing examples of web and mobile products" className="aspect-[4/3] rounded-[1.25rem] object-cover" height={1152} priority sizes="(max-width: 1023px) calc(100vw - 2.5rem), 38rem" src="/projects/concept-project-gallery.png" width={1536} />
            <div className="absolute right-3.5 top-3.5 rounded-full border border-black/10 bg-[#FFFDF8]/90 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-[#1F4D3D] shadow-sm">
              STUDIO PREVIEW
            </div>
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
        <ScrollReveal className="mt-12" y={18}>
          <ServiceFlipCards />
        </ScrollReveal>
        <div className="mt-10 flex items-center justify-between border-t border-[#171717]/10 pt-6">
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-[#1F4D3D] underline decoration-[#F39314] decoration-2 underline-offset-4 transition-colors hover:text-[#171717]" href="/services">
            Explore all services, including AI automation <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
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
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="group rounded-[1.5rem] border border-[#F4EFE5]/15 bg-[#173A2E] p-7 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#F7AD45]/45 hover:shadow-[0_16px_36px_rgba(0,0,0,0.2)] md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#F7AD45]">01 / USABILITY</span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#F4EFE5]/10 text-[#F7AD45]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">Clear to use</h3>
              <p className="mt-3 text-sm leading-6 text-[#F4EFE5]/80">People should know what to do next, on a phone or a computer.</p>
            </div>
            <div className="group rounded-[1.5rem] border border-[#F4EFE5]/15 bg-[#173A2E] p-7 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#F7AD45]/45 hover:shadow-[0_16px_36px_rgba(0,0,0,0.2)] md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#F7AD45]">02 / EVOLUTION</span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#F4EFE5]/10 text-[#F7AD45]">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">Ready to change</h3>
              <p className="mt-3 text-sm leading-6 text-[#F4EFE5]/80">Your product should be practical to update as your business grows.</p>
            </div>
            <div className="group rounded-[1.5rem] border border-[#F4EFE5]/15 bg-[#173A2E] p-7 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#F7AD45]/45 hover:shadow-[0_16px_36px_rgba(0,0,0,0.2)] md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#F7AD45]">03 / ENGINEERING</span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#F4EFE5]/10 text-[#F7AD45]">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">Built with care</h3>
              <p className="mt-3 text-sm leading-6 text-[#F4EFE5]/80">Speed, access, data handling, and testing are part of the work from the start.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28" id="work">
        <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Concept projects</p>
            <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.045em] md:text-6xl">See the kinds of products we build.</h2>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-[#1F4D3D] underline decoration-[#F39314] decoration-2 underline-offset-4 transition-colors hover:text-[#171717]" href="/work">
            View all concept projects <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </ScrollReveal>
        <ProjectGallery limit={4} />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <ScrollReveal className="grid gap-7 border-t border-[#171717]/15 pt-12 lg:grid-cols-[0.55fr_1fr]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">Working together</p>
          <div>
            <h2 className="font-display text-4xl leading-none md:text-5xl">You stay part of the process.</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div className="group relative rounded-[1.5rem] border border-[#171717]/10 bg-[#FFFDF8] p-6 shadow-sm transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#F39314]/40 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#1F4D3D]">01 / UNDERSTAND</span>
                  <Compass className="h-4 w-4 text-[#5F5A50] transition-colors group-hover:text-[#F39314]" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#171717]">Understand</h3>
                <p className="mt-2 text-sm leading-6 text-[#5F5A50]">Show us the problem, the people involved, and what success would look like.</p>
              </div>
              <div className="group relative rounded-[1.5rem] border border-[#171717]/10 bg-[#FFFDF8] p-6 shadow-sm transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#F39314]/40 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#1F4D3D]">02 / SHAPE</span>
                  <SlidersHorizontal className="h-4 w-4 text-[#5F5A50] transition-colors group-hover:text-[#F39314]" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#171717]">Shape</h3>
                <p className="mt-2 text-sm leading-6 text-[#5F5A50]">We agree on the scope and a useful first release before development begins.</p>
              </div>
              <div className="group relative rounded-[1.5rem] border border-[#171717]/10 bg-[#FFFDF8] p-6 shadow-sm transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#F39314]/40 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#1F4D3D]">03 / BUILD</span>
                  <Hammer className="h-4 w-4 text-[#5F5A50] transition-colors group-hover:text-[#F39314]" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#171717]">Build</h3>
                <p className="mt-2 text-sm leading-6 text-[#5F5A50]">We build and test in pieces you can review before launch.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <ScrollReveal y={24} scale={0.985} className="group relative overflow-hidden rounded-[2.25rem] border border-[#171717]/10 bg-[#F39314] px-8 py-14 shadow-[0_18px_50px_rgba(243,147,20,0.18)] md:px-14 md:py-20">
          <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/75">
                Start here
              </span>
              <h2 className="mt-4 max-w-3xl text-balance font-display text-5xl leading-[1.02] tracking-[-0.045em] text-[#171717] md:text-6xl">
                Need a website, app or better software for your business?
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-7 text-[#171717]/80">
                Tell us what you want to build or what is not working today.
              </p>
            </div>
            <Link className="inline-flex min-h-14 w-fit items-center gap-2 rounded-full bg-[#171717] px-8 text-sm font-bold text-white shadow-md transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]" href="/enquiry">
              Discuss your project <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
