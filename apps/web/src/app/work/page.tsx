/**
 * Work Page
 * Case-study inspired portfolio with brand-led, adaptive surfaces.
 */

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { createMetadata } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

export const metadata = createMetadata({
  title: "Work",
  description:
    "Featured projects showcasing our expertise in web development, design, and digital strategy.",
  path: "/work",
});

const projects = [
  {
    id: "01",
    title: "TechFlow Pro",
    category: "Web Platform",
    description:
      "Enterprise workflow orchestration with real-time collaboration and adaptive reporting.",
    tags: ["Next.js", "Node.js", "Realtime"],
    tone: "from-blue-500/25 to-cyan-500/10",
  },
  {
    id: "02",
    title: "DesignHub System",
    category: "Design Infrastructure",
    description:
      "A governance-ready design system powering multiple product teams at scale.",
    tags: ["Figma", "Design Tokens", "Storybook"],
    tone: "from-purple-500/25 to-pink-500/10",
  },
  {
    id: "03",
    title: "DataVista",
    category: "Analytics",
    description:
      "Decision dashboard for operations teams with high-density interactive data views.",
    tags: ["D3", "WebSocket", "TypeScript"],
    tone: "from-green-500/25 to-emerald-500/10",
  },
  {
    id: "04",
    title: "MobileFirst Care",
    category: "Mobile Product",
    description:
      "Cross-platform service app focused on retention, onboarding, and speed.",
    tags: ["React Native", "Expo", "Analytics"],
    tone: "from-orange-500/30 to-amber-500/10",
  },
  {
    id: "05",
    title: "Mercury Commerce",
    category: "E-Commerce",
    description:
      "High-throughput storefront architecture with conversion-first checkout.",
    tags: ["Next.js", "Stripe", "Edge Caching"],
    tone: "from-rose-500/25 to-orange-500/10",
  },
  {
    id: "06",
    title: "Orbit SaaS",
    category: "SaaS",
    description:
      "Multi-tenant control center with role-driven access and workflow automation.",
    tags: ["React", "PostgreSQL", "CI/CD"],
    tone: "from-cyan-500/25 to-blue-500/10",
  },
];

const categories = ["All", "Web Platform", "Mobile Product", "Analytics", "Design Infrastructure"];

export default function WorkPage() {
  return (
    <main className="flex flex-col w-full bg-background">
      <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-accent-soft blur-3xl" />
          <div className="absolute -bottom-24 left-[-8%] h-72 w-72 rounded-full bg-accent-soft/50 blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-block rounded-full border border-accent/25 bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Selected Work
            </p>
            <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-display font-medium leading-[0.95] tracking-tight text-foreground">
              Outcomes First.
              <span className="block italic text-accent">Design Always.</span>
            </h1>
            <p className="mt-7 text-lg md:text-xl leading-relaxed text-foreground/65 max-w-3xl mx-auto">
              A portfolio of systems we designed and engineered to move
              measurable business metrics, not just ship features.
            </p>
          </div>
        </Container>
      </section>

      <SectionWrapper>
        <Container>
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all ${
                  index === 0
                    ? "border-accent/35 bg-accent-soft text-accent"
                    : "border-glass-border text-foreground/65 hover:border-accent/35 hover:text-accent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {projects.map((project) => (
              <article
                key={project.title}
                className="group overflow-hidden rounded-2xl border border-glass-border bg-surface/30 hover:border-accent/35 hover:bg-glass-bg-hover transition-all duration-300"
              >
                <div className={`h-44 border-b border-glass-border bg-gradient-to-br ${project.tone}`}>
                  <div className="p-5">
                    <span className="inline-block rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                      {project.id}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">
                    {project.category}
                  </p>
                  <h3 className="mt-2 text-2xl font-display font-medium text-foreground">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/65">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-glass-border px-3 py-1 text-[11px] font-medium text-foreground/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-foreground transition-colors">
                    View Case Study
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper className="border-y border-glass-border/60">
        <Container>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Projects Delivered" },
              { value: "98%", label: "Client Satisfaction" },
              { value: "10+", label: "Years of Product Delivery" },
              { value: "24/7", label: "Critical Support Availability" },
            ].map((stat) => (
              <article key={stat.label} className="rounded-xl border border-glass-border bg-surface/25 p-6">
                <p className="text-4xl md:text-5xl font-display font-medium text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-sm uppercase tracking-[0.14em] text-foreground/55">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper>
        <Container>
          <div className="mx-auto max-w-3xl text-center glass-card rounded-[2rem] border-glass-border p-10 md:p-14">
            <p className="text-xs uppercase tracking-[0.24em] text-accent font-semibold mb-4">
              Your Next Case Study
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-6">
              Ready to ship with the same execution standard?
            </h2>
            <p className="text-foreground/65 text-lg mb-8 max-w-2xl mx-auto">
              Let&apos;s scope the right architecture and delivery model for
              your product ambition.
            </p>
            <Button size="lg" variant="primary" className="rounded-full px-10">
              Start a Project
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Container>
      </SectionWrapper>
    </main>
  );
}
