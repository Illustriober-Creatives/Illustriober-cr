/**
 * Work Page
 * Portfolio showcase with filterable project gallery
 */

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Our Work | Illustriober",
  description: "Featured projects showcasing our expertise in web development, design, and digital strategy.",
};

const projects = [
  {
    id: 1,
    title: "TechFlow Pro",
    category: "Web App",
    description: "Enterprise project management platform",
    tags: ["React", "Node.js", "Real-time"],
    image: "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
  },
  {
    id: 2,
    title: "DesignHub",
    category: "Design System",
    description: "Comprehensive design system for scale-ups",
    tags: ["Figma", "Components", "Documentation"],
    image: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
  },
  {
    id: 3,
    title: "DataViz",
    category: "Analytics",
    description: "Real-time analytics dashboard",
    tags: ["Next.js", "D3.js", "WebSocket"],
    image: "bg-gradient-to-br from-green-500/20 to-green-600/10",
  },
  {
    id: 4,
    title: "MobileFirst",
    category: "Mobile App",
    description: "Cross-platform mobile application",
    tags: ["React Native", "Firebase", "iOS/Android"],
    image: "bg-gradient-to-br from-orange-500/20 to-orange-600/10",
  },
  {
    id: 5,
    title: "E-Commerce Pro",
    category: "Web App",
    description: "High-performance e-commerce platform",
    tags: ["Next.js", "Stripe", "Optimization"],
    image: "bg-gradient-to-br from-pink-500/20 to-pink-600/10",
  },
  {
    id: 6,
    title: "SaaS Platform",
    category: "Web App",
    description: "Multi-tenant SaaS solution",
    tags: ["React", "TypeScript", "Scalable"],
    image: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/10",
  },
];

const categories = ["All", "Web App", "Mobile App", "Design System", "Analytics"];

export default function WorkPage() {
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
              Our Portfolio
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 text-white">
              Featured <span className="text-orange-500">projects</span> and case studies
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
              Explore some of our most impactful work across web, mobile, and
              design. Each project represents our commitment to excellence and
              innovation.
            </p>
          </div>
        </Container>
      </section>

      {/* Filter & Gallery */}
      <SectionWrapper>
        <Container>
          <div className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-6 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer rounded-lg overflow-hidden bg-zinc-900/30 border border-zinc-800 hover:border-orange-500/30 transition-all"
                >
                  <div className={`h-48 ${project.image} border-b border-zinc-800`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-orange-500 text-sm font-medium">
                          {project.category}
                        </p>
                        <h3 className="text-xl font-bold text-white mt-1">
                          {project.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-zinc-400 mb-4">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors font-medium">
                      View Project
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </SectionWrapper>

      {/* Stats Section */}
      <SectionWrapper className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-y border-orange-500/20">
        <Container>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                500+
              </p>
              <p className="text-zinc-400">Projects Delivered</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                98%
              </p>
              <p className="text-zinc-400">Client Satisfaction</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                50+
              </p>
              <p className="text-zinc-400">Team Members</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                10+
              </p>
              <p className="text-zinc-400">Years Experience</p>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper>
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Interested in partnering with us?
            </h2>
            <p className="text-zinc-300 text-lg mb-8">
              Let&apos;s discuss your project and create something exceptional
              together.
            </p>
            <Button size="lg" variant="primary">
              Start a Project
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Container>
      </SectionWrapper>
    </main>
  );
}
