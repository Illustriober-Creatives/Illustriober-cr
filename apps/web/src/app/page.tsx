import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Code2, Compass, Layers3 } from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { createMetadata } from "@/lib/seo";
import styles from "./home.module.css";

export const metadata = createMetadata({ path: "/" });

const heroPurposePhrases = [
  "a website.",
  "a CRM.",
  "a dashboard.",
  "a mobile app.",
  "a workflow.",
  "a client portal.",
  "a bug.",
];

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#F4EFE5] text-[#171717]">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-8 md:pb-20 md:pt-20 lg:min-h-[calc(100svh-var(--navbar-height)-2rem)] lg:pb-16 lg:pt-[6.25rem]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <h1 className="max-w-4xl font-display text-5xl leading-[0.9] tracking-[-0.05em] sm:text-6xl md:text-7xl lg:max-w-none lg:text-[clamp(5rem,6.3vw,7.5rem)] lg:leading-[0.86]">
              <span className="sr-only">It all starts with useful software.</span>
              <span aria-hidden="true">
                <span className="block">It all starts</span>
                <span className={`${styles.purposeLine} block`}>
                  with{" "}
                  <span className={styles.purposeRotator}>
                    {heroPurposePhrases.map((phrase, index) => (
                      <em
                        className={`${styles.purposeWord} font-normal`}
                        key={phrase}
                        style={{ animationDelay: `${index * 30 - 0.5}s` }}
                      >
                        {phrase}
                      </em>
                    ))}
                  </span>
                </span>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#5F5A50] md:text-lg">Illustriober helps growing teams turn messy operations and promising ideas into clear, dependable digital products.</p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#171717] px-6 text-sm font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5" href="/enquiry">Start a project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
              <a className="inline-flex min-h-12 items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="#work">See the work <ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl rotate-[-2deg] rounded-[1.8rem] bg-white p-3 shadow-[18px_22px_0_#1F4D3D] lg:mt-6 lg:w-[118%] lg:max-w-none">
            <Image alt="Concept project gallery showing responsive digital products" className="aspect-[4/3] rounded-[1.25rem] object-cover" height={1152} priority sizes="(max-width: 1023px) calc(100vw - 2.5rem), 38rem" src="/projects/concept-project-gallery.png" width={1536} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.78fr_1.22fr]">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F39314]">How we help</p><h2 className="mt-5 font-display text-5xl leading-[0.92] tracking-[-0.045em] md:text-6xl">From a rough idea to something people can use.</h2></div>
        <div className="grid gap-5 sm:grid-cols-3">{[["01", "Make it clear", "Strategy, structure, and an interface people understand."], ["02", "Make it useful", "A focused build around the work that matters most."], ["03", "Make it last", "A maintainable product your team can keep improving."]].map(([number, title, text]) => <article key={number} className="border-t-2 border-[#171717] pt-4"><p className="text-xs font-bold text-[#F39314]">{number}</p><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#5F5A50]">{text}</p></article>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="grid overflow-hidden rounded-[2rem] border border-black/10 bg-[#FFFDF8] lg:grid-cols-3">
          {[
            [Compass, "Shape the right product", "Clarify the audience, the core job, and the smallest useful release before money disappears into a vague build."],
            [Layers3, "Design the whole system", "Connect journeys, content, interface rules, and operational reality so the experience feels coherent."],
            [Code2, "Build for ownership", "Ship maintainable software with documented decisions and a foundation your team can keep extending."],
          ].map(([Icon, title, copy], index) => {
            const CapabilityIcon = Icon as typeof Compass;
            return <article className={`p-7 md:p-9 ${index < 2 ? "border-b border-black/10 lg:border-b-0 lg:border-r" : ""}`} key={title as string}><CapabilityIcon aria-hidden="true" className="h-7 w-7 text-[#1F4D3D]" /><h3 className="mt-10 font-display text-3xl leading-none">{title as string}</h3><p className="mt-4 text-sm leading-6 text-[#5F5A50]">{copy as string}</p></article>;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28" id="work">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F4D3D]">A few directions</p><h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.045em] md:text-6xl">What a better system can look like.</h2></div><Link className="inline-flex items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4" href="/work">View all demo projects <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        <ProjectGallery limit={4} />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="grid gap-10 border-t border-black/15 pt-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F39314]">A visible process</p><h2 className="mt-4 font-display text-4xl leading-none md:text-5xl">Know what is happening and why.</h2></div>
          <ol className="grid gap-7 sm:grid-cols-2">
            {[['01', 'Frame', 'Define the problem, audience, constraints, and a measurable finish line.'], ['02', 'Prototype', 'Make the important journey tangible before committing to the full build.'], ['03', 'Build', 'Deliver in reviewable slices with decisions, risks, and progress kept visible.'], ['04', 'Launch & learn', 'Verify the real experience, document the system, and plan what evidence says comes next.']].map(([number, title, copy]) => <li className="border-t-2 border-[#171717] pt-4" key={number}><p className="text-xs font-bold text-[#F39314]">{number}</p><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#5F5A50]">{copy}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="bg-[#1F4D3D] px-5 py-20 text-[#F4EFE5] md:px-8 md:py-28"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">Built with you, not around you</p><h2 className="mt-5 max-w-3xl text-balance font-display text-5xl leading-[1.02] tracking-[-0.045em] md:text-7xl">A practical partner for the work after the idea.</h2></div><ul className="space-y-4 text-base text-[#F4EFE5]/85 lg:pt-9">{["A clear scope before the build starts", "Visible progress instead of mystery", "A product your team can own after launch"].map((item) => <li className="flex gap-3" key={item}><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#F7AD45]" aria-hidden="true" />{item}</li>)}</ul></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="rounded-[2rem] bg-[#F39314] px-7 py-14 text-center md:px-12 md:py-20"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#171717]/70">Start here</p><h2 className="mx-auto mt-5 max-w-3xl text-balance font-display text-5xl leading-[1.02] tracking-[-0.045em] md:text-7xl">Got a thing that needs building?</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-7 text-[#171717]/75">Tell us what needs to work better. We’ll help map the next sensible move.</p><Link className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#171717] px-7 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" href="/enquiry">Start a conversation <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    </div>
  );
}
