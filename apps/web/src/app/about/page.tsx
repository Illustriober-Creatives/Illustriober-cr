/**
 * About Page
 * Company story, mission, values, and team introduction
 */

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Illustriober | Premium Tech Studio",
  description:
    "Learn about Illustriober Creatives - a premium tech studio specializing in full-stack web development, mobile apps, and design.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-col w-full bg-surface-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-orange-600/5 rounded-full blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-block mb-6 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium uppercase tracking-wider">
              About Our Studio
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 text-white">
              Crafting <span className="text-orange-500">exceptional</span> digital
              experiences
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
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
              <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                Illustriober Creatives was born from a simple idea: exceptional
                digital experiences require both artistic vision and technical
                excellence. We started as a boutique team of developers and designers
                who believed that every project deserves thoughtful, custom-crafted
                solutions.
              </p>
              <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                Over the years, we've grown into a full-service creative studio,
                working with startups, scale-ups, and enterprises to design and
                build digital products that create real impact. Today, we're proud
                to have delivered over 500 projects while maintaining our commitment
                to quality and innovation.
              </p>
              <p className="text-zinc-300 text-lg leading-relaxed">
                What drives us is the opportunity to solve complex problems through
                elegant design and robust technology. We're not just building
                websites and apps—we're creating experiences that connect businesses
                with their customers.
              </p>
            </div>

            <div className="relative h-96 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl overflow-hidden border border-orange-500/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl font-bold text-orange-500 mb-2">10+</p>
                  <p className="text-zinc-400">Years of Excellence</p>
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
                className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/30 transition-colors"
              >
                <h3 className="text-xl font-bold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-zinc-400">{value.description}</p>
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
                className="text-center p-6 rounded-xl bg-zinc-900/30 border border-zinc-800"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10" />
                <h3 className="text-lg font-bold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-orange-500 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-y border-orange-500/20">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to work together?
            </h2>
            <p className="text-zinc-300 text-lg mb-8">
              Let's discuss your project and how we can help bring your vision to
              life.
            </p>
            <Button size="lg" variant="primary">
              Start a Conversation
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Container>
      </SectionWrapper>
    </main>
  );
}
