/**
 * Tech Stack Page
 * Structured capability map with brand-consistent, adaptive visual language.
 */

import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Tech Stack",
  description:
    "The modern technologies and tools we use to build exceptional digital products.",
  path: "/tech-stack",
});

const categories = [
  {
    name: "Frontend",
    description: "Client-side technologies for high-performance, expressive interfaces.",
    technologies: [
      { name: "React", proficiency: "Expert" },
      { name: "Next.js", proficiency: "Expert" },
      { name: "TypeScript", proficiency: "Expert" },
      { name: "Tailwind CSS", proficiency: "Expert" },
      { name: "Vue.js", proficiency: "Advanced" },
    ],
  },
  {
    name: "Backend",
    description: "Service architecture for reliability, security, and velocity.",
    technologies: [
      { name: "Node.js", proficiency: "Expert" },
      { name: "Express", proficiency: "Expert" },
      { name: "Python", proficiency: "Advanced" },
      { name: "GraphQL", proficiency: "Advanced" },
      { name: "REST APIs", proficiency: "Expert" },
    ],
  },
  {
    name: "Data",
    description: "Data systems optimized for consistency and scale.",
    technologies: [
      { name: "PostgreSQL", proficiency: "Expert" },
      { name: "MongoDB", proficiency: "Advanced" },
      { name: "Redis", proficiency: "Advanced" },
      { name: "Firebase", proficiency: "Advanced" },
      { name: "Prisma", proficiency: "Expert" },
    ],
  },
  {
    name: "Mobile",
    description: "Cross-platform delivery tuned for performance and maintainability.",
    technologies: [
      { name: "React Native", proficiency: "Advanced" },
      { name: "Swift", proficiency: "Advanced" },
      { name: "Kotlin", proficiency: "Intermediate" },
      { name: "Expo", proficiency: "Advanced" },
    ],
  },
  {
    name: "Cloud & DevOps",
    description: "Automation and infrastructure for confident deployment at scale.",
    technologies: [
      { name: "Vercel", proficiency: "Expert" },
      { name: "AWS", proficiency: "Advanced" },
      { name: "Docker", proficiency: "Advanced" },
      { name: "GitHub Actions", proficiency: "Expert" },
      { name: "Netlify", proficiency: "Advanced" },
    ],
  },
  {
    name: "Design Ops",
    description: "Collaborative tooling that keeps product design systems coherent.",
    technologies: [
      { name: "Figma", proficiency: "Expert" },
      { name: "Adobe XD", proficiency: "Advanced" },
      { name: "Framer", proficiency: "Advanced" },
      { name: "Storybook", proficiency: "Expert" },
    ],
  },
];

const scoreWidth = (proficiency: string) => {
  if (proficiency === "Expert") return "w-full";
  if (proficiency === "Advanced") return "w-3/4";
  return "w-1/2";
};

export default function TechStackPage() {
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
              Tech Capability
            </p>
            <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-display font-medium leading-[0.95] tracking-tight text-foreground">
              Engineered with
              <span className="block italic text-accent">Proven Tools</span>
            </h1>
            <p className="mt-7 text-lg md:text-xl leading-relaxed text-foreground/65 max-w-3xl mx-auto">
              We choose technologies for durability and delivery speed, then
              align the stack to your business stage and constraints.
            </p>
          </div>
        </Container>
      </section>

      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="Stack Map"
            title="Technology Domains"
            description="Each domain combines production readiness with maintainable long-term architecture."
          />

          <div className="space-y-10">
            {categories.map((category, index) => (
              <article
                key={category.name}
                className="rounded-2xl border border-glass-border bg-surface/30 p-6 md:p-8"
              >
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold mb-2">
                      Domain 0{index + 1}
                    </p>
                    <h3 className="text-2xl font-display font-medium text-foreground">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-sm text-foreground/65">
                      {category.description}
                    </p>
                  </div>
                  <div className="h-px w-28 bg-gradient-to-r from-accent/50 to-transparent" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.technologies.map((tech) => (
                    <div
                      key={tech.name}
                      className="rounded-xl border border-glass-border bg-background/60 p-4 hover:border-accent/35 transition-colors"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-foreground">
                          {tech.name}
                        </h4>
                        <span className="rounded-full border border-accent/20 bg-accent-soft px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                          {tech.proficiency}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface/70 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r from-accent to-orange-400 ${scoreWidth(
                            tech.proficiency,
                          )}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper className="border-y border-glass-border/60">
        <Container>
          <SectionHeader
            subtitle="Selection Criteria"
            title="Why These Technologies"
            description="Every tool is selected against business-critical constraints, not trend cycles."
          />

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: "Performance",
                detail:
                  "Prioritized for latency, throughput, and user-perceived speed under production load.",
              },
              {
                label: "Security",
                detail:
                  "Chosen for mature security posture, patch cadence, and ecosystem stability.",
              },
              {
                label: "Scalability",
                detail:
                  "Designed to evolve from launch-stage usage to enterprise-level adoption.",
              },
              {
                label: "Community",
                detail:
                  "Strong ecosystems ensure maintainability, documentation quality, and hiring viability.",
              },
              {
                label: "Developer Velocity",
                detail:
                  "Tooling accelerates delivery while preserving quality gates and test confidence.",
              },
              {
                label: "Context Fit",
                detail:
                  "Stack decisions are tailored to your constraints, budget, and product trajectory.",
              },
            ].map((item, index) => (
              <article
                key={item.label}
                className="rounded-xl border border-glass-border bg-surface/25 p-6 hover:border-accent/35 transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold mb-3">
                  0{index + 1}
                </p>
                <h3 className="text-xl font-display font-medium text-foreground mb-3">
                  {item.label}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/65">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="Delivery Workflow"
            title="Operational Quality Standards"
            description="Engineering workflow practices that protect reliability and release confidence."
          />

          <div className="grid md:grid-cols-2 gap-8">
            <article className="glass-card rounded-2xl border-glass-border p-8">
              <h3 className="text-2xl font-display font-medium text-foreground mb-6">
                CI/CD Discipline
              </h3>
              <ul className="space-y-3">
                {[
                  "Automated tests on every commit",
                  "Type and lint quality gates",
                  "Release pipeline controls and rollback safety",
                  "Environment-aware deployment automation",
                  "Runtime monitoring and actionable alerts",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-accent font-semibold mt-0.5">✓</span>
                    <span className="text-sm text-foreground/70">{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass-card rounded-2xl border-glass-border p-8">
              <h3 className="text-2xl font-display font-medium text-foreground mb-6">
                Product Quality
              </h3>
              <ul className="space-y-3">
                {[
                  "Unit and integration testing coverage",
                  "Performance profiling and budgets",
                  "Security checks in delivery flow",
                  "Accessibility-first verification",
                  "Manual QA for edge-case confidence",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-accent font-semibold mt-0.5">✓</span>
                    <span className="text-sm text-foreground/70">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </Container>
      </SectionWrapper>
    </main>
  );
}
