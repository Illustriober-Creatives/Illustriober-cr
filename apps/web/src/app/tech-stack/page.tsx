/**
 * Tech Stack Page
 * Overview of technologies and tools used
 */

import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";

export const metadata = {
  title: "Tech Stack | Illustriober",
  description: "The modern technologies and tools we use to build exceptional digital products.",
};

const categories = [
  {
    name: "Frontend",
    description: "Client-side technologies for beautiful, interactive UIs",
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
    description: "Server-side technologies for robust, scalable APIs",
    technologies: [
      { name: "Node.js", proficiency: "Expert" },
      { name: "Express", proficiency: "Expert" },
      { name: "Python", proficiency: "Advanced" },
      { name: "GraphQL", proficiency: "Advanced" },
      { name: "REST APIs", proficiency: "Expert" },
    ],
  },
  {
    name: "Databases",
    description: "Data storage and management solutions",
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
    description: "Cross-platform and native mobile development",
    technologies: [
      { name: "React Native", proficiency: "Advanced" },
      { name: "Swift", proficiency: "Advanced" },
      { name: "Kotlin", proficiency: "Intermediate" },
      { name: "Expo", proficiency: "Advanced" },
    ],
  },
  {
    name: "DevOps & Cloud",
    description: "Infrastructure and deployment platforms",
    technologies: [
      { name: "Vercel", proficiency: "Expert" },
      { name: "AWS", proficiency: "Advanced" },
      { name: "Docker", proficiency: "Advanced" },
      { name: "GitHub Actions", proficiency: "Expert" },
      { name: "Netlify", proficiency: "Advanced" },
    ],
  },
  {
    name: "Design Tools",
    description: "Tools for crafting exceptional user experiences",
    technologies: [
      { name: "Figma", proficiency: "Expert" },
      { name: "Adobe XD", proficiency: "Advanced" },
      { name: "Framer", proficiency: "Advanced" },
      { name: "Storybook", proficiency: "Expert" },
    ],
  },
];

export default function TechStackPage() {
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
              Technology
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 text-white">
              Built with <span className="text-orange-500">modern tools</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
              We carefully select the best technologies and tools to deliver
              scalable, performant, and maintainable solutions.
            </p>
          </div>
        </Container>
      </section>

      {/* Tech Stack Categories */}
      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="Our Arsenal"
            title="Technology Categories"
            description="From frontend to infrastructure, here's what powers our projects"
          />

          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-zinc-400">{category.description}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.technologies.map((tech) => (
                    <div
                      key={tech.name}
                      className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white">{tech.name}</h4>
                        <span className="text-xs px-2 py-1 rounded bg-orange-500/10 text-orange-500 font-medium">
                          {tech.proficiency}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 ${
                            tech.proficiency === "Expert"
                              ? "w-full"
                              : tech.proficiency === "Advanced"
                                ? "w-3/4"
                                : "w-1/2"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Why These Tools */}
      <SectionWrapper className="bg-zinc-900/30 border-y border-zinc-800">
        <Container>
          <SectionHeader
            subtitle="Our Philosophy"
            title="Why We Choose These Tools"
            description="Selection criteria for our technology stack"
          />

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-3xl font-bold text-orange-500 mb-3">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Performance</h3>
              <p className="text-zinc-400">
                We prioritize speed and efficiency. Every tool must deliver
                measurable performance benefits for end users.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-3xl font-bold text-orange-500 mb-3">🔒</div>
              <h3 className="text-xl font-bold text-white mb-3">Security</h3>
              <p className="text-zinc-400">
                We only use technologies with strong security practices and
                active maintenance. Your data is protected.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-3xl font-bold text-orange-500 mb-3">📈</div>
              <h3 className="text-xl font-bold text-white mb-3">Scalability</h3>
              <p className="text-zinc-400">
                Our tools can grow with your business. We build architectures
                that scale without requiring rewrites.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-3xl font-bold text-orange-500 mb-3">👥</div>
              <h3 className="text-xl font-bold text-white mb-3">Community</h3>
              <p className="text-zinc-400">
                Active, thriving communities mean better documentation, more
                solutions, and continuous evolution.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-3xl font-bold text-orange-500 mb-3">📚</div>
              <h3 className="text-xl font-bold text-white mb-3">Learning</h3>
              <p className="text-zinc-400">
                Our team stays current through continuous learning and hands-on
                experience with cutting-edge tools.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-3xl font-bold text-orange-500 mb-3">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3">Fit</h3>
              <p className="text-zinc-400">
                Every project is unique. We select tools that are the best fit
                for your specific requirements.
              </p>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      {/* Integration & CI/CD */}
      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="DevOps & Workflow"
            title="Our Development Workflow"
            description="Tools and practices that ensure quality and reliability"
          />

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-6">
                Continuous Integration & Deployment
              </h3>
              <ul className="space-y-4">
                {[
                  "Automated testing on every commit",
                  "Code quality analysis with ESLint & TypeScript",
                  "Pre-commit hooks for consistency",
                  "Automated deployment pipelines",
                  "Production monitoring & alerting",
                  "Rollback capabilities for safety",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-6">
                Quality Assurance
              </h3>
              <ul className="space-y-4">
                {[
                  "Unit testing with Jest & Vitest",
                  "Integration testing with Playwright",
                  "Performance profiling & optimization",
                  "Security scanning with industry tools",
                  "Accessibility testing (WCAG compliance)",
                  "Manual QA & user testing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </SectionWrapper>
    </main>
  );
}
