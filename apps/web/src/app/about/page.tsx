/**
 * About Page
 * Company story, mission, values, and team introduction
 * Fully theme-aware with light and dark mode support
 */

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { createMetadata } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

export const metadata = createMetadata({
  title: "About",
  description:
    "Learn about Illustriober Creatives - a premium tech studio specializing in full-stack web development, mobile apps, and design.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="flex flex-col w-full bg-background">
      {/* Hero Section - Theme aware gradient background */}
      <section className="relative overflow-hidden bg-background py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs - theme responsive */}
          <div className="absolute -top-40 -right-40 h-80 w-80 bg-accent/5 rounded-full blur-3xl dark:opacity-100 light:opacity-50" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-accent/3 rounded-full blur-3xl dark:opacity-75 light:opacity-40" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-block mb-6 px-4 py-2 rounded-full bg-accent-soft border border-accent/20 text-accent text-sm font-medium uppercase tracking-wider">
              About Our Studio
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold leading-tight tracking-tight mb-6 text-foreground">
              Crafting <span className="text-accent italic">exceptional</span> digital experiences
            </h1>
            <p className="text-lg md:text-xl text-foreground/60 leading-relaxed">
              Founded on the belief that great design and technology can transform
              businesses, we partner with companies to build products that matter.
            </p>
          </div>
        </Container>
      </section>

      {/* Our Story */}
      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="Our Journey"
            title="How Illustriober Started"
            description="From a small team of passionate designers and developers to a full-service creative studio"
          />

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                Illustriober Creatives was born from a simple idea: exceptional
                digital experiences require both artistic vision and technical
                excellence. We started as a boutique team of developers and designers
                who believed that every project deserves thoughtful, custom-crafted
                solutions.
              </p>
              <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                Over the years, we&apos;ve grown into a full-service creative studio,
                working with startups, scale-ups, and enterprises to design and
                build digital products that create real impact. Today, we&apos;re proud
                to have delivered over 500 projects while maintaining our commitment
                to quality and innovation.
              </p>
              <p className="text-foreground/70 text-lg leading-relaxed">
                What drives us is the opportunity to solve complex problems through
                elegant design and robust technology. We&apos;re not just building
                websites and apps—we&apos;re creating experiences that connect businesses
                with their customers.
              </p>
            </div>

            <div className="relative h-96 bg-accent-soft border border-accent/20 rounded-xl overflow-hidden glass-card">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl font-display font-semibold text-accent mb-2">10+</p>
                  <p className="text-foreground/60">Years of Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="Our Core Values"
            title="What We Believe In"
            description="The principles that guide every project and decision we make"
          />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Excellence",
                description:
                  "We never compromise on quality. Every pixel, every line of code matters.",
              },
              {
                title: "Innovation",
                description:
                  "We stay at the forefront of technology and design to deliver cutting-edge solutions.",
              },
              {
                title: "Partnership",
                description:
                  "We treat our clients as partners, investing in their success as our own.",
              },
              {
                title: "Transparency",
                description:
                  "Clear communication and honest feedback keep projects on track and aligned.",
              },
              {
                title: "Impact",
                description:
                  "We measure success by the real results we create for our clients' businesses.",
              },
              {
                title: "Growth",
                description:
                  "We continuously learn, evolve, and challenge ourselves to do better.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="p-8 rounded-xl glass-card border-glass-border hover:border-accent/40 hover:bg-glass-bg-hover transition-all"
              >
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-foreground/60">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Team Preview */}
      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="Our Team"
            title="Talented Minds Behind Your Project"
            description="A diverse team of designers, developers, and strategists"
          />

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Sarah Chen", role: "Creative Director" },
              { name: "Alex Rodriguez", role: "Lead Developer" },
              { name: "Emma Thompson", role: "UX Designer" },
              { name: "James Wilson", role: "Product Manager" },
            ].map((member) => (
              <div
                key={member.name}
                className="text-center p-6 rounded-xl glass-card border-glass-border hover:border-accent/40 transition-all"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-accent-soft border border-accent/20" />
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-accent text-sm font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* CTA Section - Theme aware */}
      <SectionWrapper className="relative overflow-hidden">
        <div className="absolute inset-0 bg-accent-soft/20 border-y border-accent/20" />
        <Container className="relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-6">
              Ready to work together?
            </h2>
            <p className="text-foreground/60 text-lg mb-8">
              Let&apos;s discuss your project and how we can help bring your vision to
              life.
            </p>
            <Button size="lg" variant="primary" className="rounded-full px-12">
              Start a Conversation
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Container>
      </SectionWrapper>
    </main>
  );
}
