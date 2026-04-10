/**
 * Services Page
 * Detailed overview of all services offered by Illustriober
 */

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { ArrowRight, Check } from "lucide-react";

export const metadata = {
  title: "Services | Illustriober",
  description:
    "Full-stack web development, mobile apps, UI/UX design, and digital strategy services.",
};

const services = [
  {
    title: "Web Development",
    description: "Custom web applications built with modern tech stack",
    features: [
      "React & Next.js applications",
      "Full-stack development",
      "Real-time features",
      "Progressive Web Apps",
    ],
  },
  {
    title: "Mobile Apps",
    description: "Native and cross-platform mobile solutions",
    features: [
      "iOS & Android development",
      "Cross-platform apps",
      "Performance optimization",
      "App store deployment",
    ],
  },
  {
    title: "UI/UX Design",
    description: "User-centered design that converts",
    features: [
      "User research & testing",
      "Wireframing & prototyping",
      "Design systems",
      "Responsive design",
    ],
  },
  {
    title: "Digital Strategy",
    description: "Strategic guidance for digital transformation",
    features: [
      "Technology roadmap",
      "Platform selection",
      "Scalability planning",
      "Integration strategy",
    ],
  },
];

const process = [
  {
    step: "1",
    title: "Discovery",
    description: "We dive deep into understanding your business, goals, and users",
  },
  {
    step: "2",
    title: "Strategy",
    description: "We create a comprehensive roadmap for your digital solution",
  },
  {
    step: "3",
    title: "Design",
    description: "Beautiful, intuitive interfaces that users love",
  },
  {
    step: "4",
    title: "Development",
    description: "Clean, scalable code built for the long term",
  },
  {
    step: "5",
    title: "Testing",
    description: "Rigorous quality assurance and user testing",
  },
  {
    step: "6",
    title: "Launch",
    description: "Smooth deployment and ongoing support",
  },
];

const faqs = [
  {
    question: "What's your typical project timeline?",
    answer:
      "Projects vary widely, but most web applications take 3-6 months from discovery to launch. We provide detailed timelines after understanding your requirements.",
  },
  {
    question: "Do you provide ongoing support?",
    answer:
      "Yes, we offer maintenance, updates, and enhancement services after launch. We can scale up or down based on your needs.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "We specialize in React, Next.js, Node.js, TypeScript, and modern cloud platforms. We choose the best tech for each project.",
  },
  {
    question: "Can you work with an existing codebase?",
    answer:
      "Absolutely. We can audit, refactor, and enhance existing applications. Technical debt reduction is one of our specialties.",
  },
];

export default function ServicesPage() {
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
              Our Services
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 text-white">
              End-to-end <span className="text-orange-500">digital solutions</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
              From concept to launch, we handle every aspect of building your
              digital product. Our full-service approach ensures seamless
              collaboration and exceptional results.
            </p>
          </div>
        </Container>
      </section>

      {/* Services Grid */}
      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="What We Do"
            title="Core Services"
            description="Comprehensive solutions for modern digital challenges"
          />

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/30 transition-colors"
              >
                <h3 className="text-2xl font-bold text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-zinc-400 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Our Process */}
      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="How We Work"
            title="Our Development Process"
            description="A proven methodology for delivering successful projects"
          />

          <div className="grid md:grid-cols-3 gap-6">
            {process.map((item) => (
              <div key={item.title} className="relative">
                <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
                  <div className="text-4xl font-bold text-orange-500 mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper>
        <Container>
          <SectionHeader
            subtitle="Questions?"
            title="Frequently Asked"
            description="Everything you need to know about working with us"
          />

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group p-6 rounded-lg bg-zinc-900/30 border border-zinc-800 cursor-pointer hover:border-orange-500/30 transition-colors"
              >
                <summary className="flex items-center justify-between font-bold text-white">
                  {faq.question}
                  <span className="text-orange-500 text-xl group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-zinc-400 mt-4">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-y border-orange-500/20">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Let&apos;s build something great
            </h2>
            <p className="text-zinc-300 text-lg mb-8">
              Tell us about your project and let&apos;s explore how we can help.
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
