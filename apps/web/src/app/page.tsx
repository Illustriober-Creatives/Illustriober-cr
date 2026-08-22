import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Code2, Compass, Layers3 } from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { HomeHeroGlide } from "@/components/motion/HomeHeroGlide";
import { HeroTypewriter } from "@/components/motion/HeroTypewriter";
import { ScrollReveal, ScrollRevealListItem } from "@/components/motion/ScrollReveal";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ path: "/" });

const heroPurposePhrases = [
  "a website.",
  "an app.",
  "a software.",
];

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#F4EFE5] text-[#171717]">
      <HomeHeroGlide
        copy={
          <>
            <HeroTypewriter phrases={heroPurposePhrases} />
            <p className="mt-9 max-w-2xl text-base leading-7 text-[#5F5A50] md:text-lg lg:text-xl lg:leading-8">Illustriober helps growing teams turn messy operations and promising ideas into clear, dependable digital products.</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[#171717] px-7 text-base font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5" href="/enquiry">Start a project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
              <a className="inline-flex min-h-14 items-center gap-2 text-base font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="#work">See the work <ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </>
        }
        media={
            <Image alt="Concept project gallery showing responsive digital products" className="aspect-[4/3] rounded-[1.25rem] object-cover" height={1152} priority sizes="(max-width: 1023px) calc(100vw - 2.5rem), 38rem" src="/projects/concept-project-gallery.png" width={1536} />
        }
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.78fr_1.22fr]">
        <ScrollReveal><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F39314]">How we help</p><h2 className="mt-5 font-display text-5xl leading-[0.92] tracking-[-0.045em] md:text-6xl">From a rough idea to something people can use.</h2></ScrollReveal>
        <div className="grid gap-5 sm:grid-cols-3">{[["01", "Make it clear", "Strategy, structure, and an interface people understand."], ["02", "Make it useful", "A focused build around the work that matters most."], ["03", "Make it last", "A maintainable product your team can keep improving."]].map(([number, title, text], index) => <ScrollReveal blur delay={index * 0.06} scale={0.985} y={24} key={number}><article className="h-full border-t-2 border-[#171717] pt-4 transition-[transform,border-color] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#F39314] motion-safe:hover:-translate-y-1 motion-reduce:transition-none"><p className="text-xs font-bold text-[#F39314]">{number}</p><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#5F5A50]">{text}</p></article></ScrollReveal>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="grid overflow-hidden rounded-[2rem] border border-black/10 bg-[#FFFDF8] lg:grid-cols-3">
          {[
            [Compass, "Shape the right product", "Clarify the audience, the core job, and the smallest useful release before money disappears into a vague build."],
            [Layers3, "Design the whole system", "Connect journeys, content, interface rules, and operational reality so the experience feels coherent."],
            [Code2, "Build for ownership", "Ship maintainable software with documented decisions and a foundation your team can keep extending."],
          ].map(([Icon, title, copy], index) => {
            const CapabilityIcon = Icon as typeof Compass;
            return <ScrollReveal blur className="h-full" delay={index * 0.07} scale={0.982} y={22} key={title as string}><article className={`group h-full p-7 transition-[transform,background-color] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1 motion-reduce:transition-none md:p-9 ${index < 2 ? "border-b border-black/10 lg:border-b-0 lg:border-r" : ""} hover:bg-[#F4EFE5]/70`}><CapabilityIcon aria-hidden="true" className="h-7 w-7 text-[#1F4D3D] transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-105 motion-reduce:transition-none" /><h3 className="mt-10 font-display text-3xl leading-none">{title as string}</h3><p className="mt-4 text-sm leading-6 text-[#5F5A50]">{copy as string}</p></article></ScrollReveal>;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28" id="work">
        <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">A few directions</p><h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.045em] md:text-6xl">What a better system can look like.</h2></div><Link className="inline-flex items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="/work">View all demo projects <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></ScrollReveal>
        <ProjectGallery limit={4} />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="grid gap-10 border-t border-black/15 pt-10 lg:grid-cols-[0.7fr_1.3fr]">
          <ScrollReveal><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F39314]">A visible process</p><h2 className="mt-4 font-display text-4xl leading-none md:text-5xl">Know what is happening and why.</h2></ScrollReveal>
          <ol className="grid gap-7 sm:grid-cols-2">
            {[['01', 'Frame', 'Define the problem, audience, constraints, and a measurable finish line.'], ['02', 'Prototype', 'Make the important journey tangible before committing to the full build.'], ['03', 'Build', 'Deliver in reviewable slices with decisions, risks, and progress kept visible.'], ['04', 'Launch & learn', 'Verify the real experience, document the system, and plan what evidence says comes next.']].map(([number, title, copy], index) => <ScrollRevealListItem blur className="border-t-2 border-[#171717] pt-4 transition-[transform,border-color] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#F39314] motion-safe:hover:-translate-y-1 motion-reduce:transition-none" delay={index * 0.05} scale={0.988} y={22} key={number}><p className="text-xs font-bold text-[#F39314]">{number}</p><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#5F5A50]">{copy}</p></ScrollRevealListItem>)}
          </ol>
        </div>
      </section>

      <section className="bg-[#1F4D3D] px-5 py-20 text-[#F4EFE5] md:px-8 md:py-28"><ScrollReveal className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">Built with you, not around you</p><h2 className="mt-5 max-w-3xl text-balance font-display text-5xl leading-[1.02] tracking-[-0.045em] md:text-7xl">A practical partner for the work after the idea.</h2></div><ul className="space-y-4 text-base text-[#F4EFE5]/85 lg:pt-9">{["A clear scope before the build starts", "Visible progress instead of mystery", "A product your team can own after launch"].map((item) => <li className="flex gap-3" key={item}><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#F7AD45]" aria-hidden="true" />{item}</li>)}</ul></ScrollReveal></section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><ScrollReveal y={24} scale={0.985} className="rounded-[2rem] bg-[#F39314] px-7 py-14 text-center md:px-12 md:py-20"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/70">Start here</p><h2 className="mx-auto mt-5 max-w-3xl text-balance font-display text-5xl leading-[1.02] tracking-[-0.045em] md:text-7xl">Got a thing that needs building?</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-7 text-[#171717]/75">Tell us what needs to work better. We’ll help map the next sensible move.</p><Link className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#171717] px-7 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" href="/enquiry">Start a conversation <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></ScrollReveal></section>
    </div>
  );
}
