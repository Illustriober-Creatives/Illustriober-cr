/**
 * Services Page
 * Editorial, brand-led service architecture with light/dark adaptive tokens.
 */

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export const metadata = {
  title: "Services | Illustriober",
  description:
    "Full-stack web development, mobile apps, UI/UX design, and digital strategy services.",
};

const services = [
  {
    id: "01",
    title: "Web Development",
    description: "Custom web applications built with modern, scalable architecture.",
    features: [
      "React & Next.js applications",
      "Full-stack delivery",
      "Real-time product features",
      "Progressive Web Apps",
    ],
  },
  {
    id: "02",
    title: "Mobile Apps",
    description: "Native-feeling mobile products engineered for growth and retention.",
    features: [
      "iOS & Android delivery",
      "Cross-platform architecture",
      "Performance-first optimization",
      "Store deployment support",
    ],
  },
  {
    id: "03",
    title: "UI/UX Design",
    description: "Conversion-aware product design systems with premium visual craft.",
    features: [
      "Research-led UX decisions",
      "Wireframes and interactive prototypes",
      "Design systems and governance",
      "Responsive interaction patterns",
    ],
  },
  {
    id: "04",
    title: "Digital Strategy",
    description: "Technical and product strategy aligned to measurable business outcomes.",
    features: [
      "Technology roadmap planning",
      "Platform and stack selection",
      "Scale and reliability planning",
      "System integration strategy",
    ],
  },
];

const process = [
  {
    step: "01",
    title: "Discovery",
    description:
      "We align on market context, constraints, and desired business outcomes.",
  },
  {
    step: "02",
    title: "Blueprint",
    description:
      "We define architecture, delivery cadence, and clear milestone sequencing.",
  },
  {
    step: "03",
    title: "Design",
    description:
      "We create high-fidelity interactions and a reusable UI pattern library.",
  },
  {
    step: "04",
    title: "Build",
    description:
      "We ship in fast iterations with engineering rigor and transparent progress.",
  },
  {
    step: "05",
    title: "Validate",
    description:
      "We run quality gates for performance, accessibility, and reliability.",
  },
  {
    step: "06",
    title: "Launch",
    description:
      "We deploy safely, monitor actively, and support continuous improvement.",
  },
];

const faqs = [
  {
    question: "What is your typical timeline?",
    answer:
      "Most core builds run 8-20 weeks depending on complexity. We scope milestones in discovery so delivery expectations are clear from day one.",
  },
  {
    question: "Do you support products after launch?",
    answer:
      "Yes. We offer maintenance, enhancement sprints, and reliability support. Engagement can scale with your roadmap.",
  },
  {
    question: "Can you work with existing products?",
    answer:
      "Absolutely. We can audit architecture, reduce technical debt, and extend legacy systems without disrupting operations.",
  },
];

export default function ServicesPage() {
  return (
    <main className="flex flex-col w-full bg-background">
      <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="absolute -top-16 right-0 h-80 w-80 rounded-full bg-accent-soft blur-3xl" />
          <div className="absolute -bottom-24 left-[-10%] h-72 w-72 rounded-full bg-accent-soft/50 blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Service Architecture
            </p>
            <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-display font-medium leading-[0.95] tracking-tight text-foreground">
              Crafting Products
              <span className="block text-accent italic">That Outperform</span>
            </h1>
            <p className="mt-7 text-lg md:text-xl leading-relaxed text-foreground/65 max-w-3xl mx-auto">
              Strategy, design, and engineering delivered as one integrated
              system, with execution quality visible at every step.
            </p>
          </div>
        </Container>
      </section>

      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="What We Deliver"
            title="Core Service Pillars"
            description="A modular delivery model that scales from MVP to enterprise platforms."
          />

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <article
                key={service.title}
                className="glass-card rounded-2xl p-8 border-glass-border hover:border-accent/40 hover:bg-glass-bg-hover transition-all duration-300"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/40">
                    {service.id}
                  </span>
                  <div className="h-px w-20 bg-gradient-to-r from-accent/50 to-transparent" />
                </div>
                <h3 className="text-2xl font-display font-medium text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-foreground/65 mb-7 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                      <span className="text-foreground/70">{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper className="border-y border-glass-border/60">
        <Container>
          <SectionHeader
            subtitle="Execution Model"
            title="Six-Step Delivery Loop"
            description="A predictable process designed for speed, quality, and controlled risk."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-glass-border bg-surface/35 p-6 hover:border-accent/35 transition-colors"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">
                  Step {item.step}
                </p>
                <h3 className="text-xl font-display font-medium text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/65">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="FAQ"
            title="Engagement Clarity"
            description="Answers to common questions before kickoff."
          />

          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-glass-border bg-surface/30 p-6 open:border-accent/40 transition-colors"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-foreground">
                  {faq.question}
                  <span className="text-accent text-xl transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-foreground/65">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <Container>
          <div className="mx-auto max-w-3xl text-center glass-card rounded-[2rem] border-glass-border p-10 md:p-14">
            <p className="text-xs uppercase tracking-[0.24em] text-accent font-semibold mb-4">
              Start Here
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-6">
              Let&apos;s build your next competitive edge
            </h2>
            <p className="text-foreground/65 text-lg mb-8 max-w-2xl mx-auto">
              Share your objective and constraints. We&apos;ll respond with a
              practical build path and scoped execution plan.
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

