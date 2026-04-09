'use client';

import { useState } from 'react';
import { Container } from './Container';
import { SectionWrapper } from './SectionWrapper';
import { SectionHeader } from './SectionHeader';
import { ServiceCard } from './Cards/ServiceCard';
import {
  Code2,
  Smartphone,
  Palette,
  Cloud,
  AlertTriangle,
  Users,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

/**
 * ServicesSection - Interactive service showcase with tabs and detail panel
 * Shows 8 core services with descriptions and icons
 */
const services = [
  {
    id: 'web-dev',
    title: 'Web App Development',
    icon: Code2,
    description: 'Custom web applications built with modern tech stack. React, Next.js, TypeScript, Node.js.',
    details: 'Full-stack development using React/Next.js on frontend and Node.js/Express on backend. Includes database design, API development, and deployment to production.',
  },
  {
    id: 'mobile',
    title: 'Mobile Development',
    icon: Smartphone,
    description: 'Native and cross-platform mobile apps. iOS, Android, and React Native solutions.',
    details: 'Build native iOS (Swift) and Android (Kotlin) apps or cross-platform with React Native/Flutter. Full lifecycle from design to app store release.',
  },
  {
    id: 'design',
    title: 'UI/UX Design',
    icon: Palette,
    description: 'User-centered design from wireframes to high-fidelity prototypes. Figma, interaction design, design systems.',
    details: 'End-to-end design process: user research, wireframing, prototyping, and handoff-ready designs. Design system creation and brand guidelines.',
  },
  {
    id: 'cloud',
    title: 'Cloud & DevOps',
    icon: Cloud,
    description: 'Infrastructure as code, CI/CD, containerization. AWS, Docker, Kubernetes, GitHub Actions.',
    details: 'Deploy and manage applications on cloud platforms. Infrastructure automation, continuous integration/deployment, monitoring, and scaling.',
  },
  {
    id: 'bug-fix',
    title: 'Emergency Bug Fixing',
    icon: AlertTriangle,
    description: 'Rapid diagnosis and resolution of critical production issues. 24/7 support available.',
    details: 'Your production is down? We respond within 1 hour and work until resolution. Post-incident analysis and prevention strategies included.',
  },
  {
    id: 'mentorship',
    title: '1:1 Mentorship',
    icon: Users,
    description: 'Technical mentoring for developers. Architecture, best practices, career growth.',
    details: 'Personalized guidance from senior engineers. Code reviews, architecture discussions, and mentoring on specific challenges.',
  },
  {
    id: 'code-review',
    title: 'Code Review & Audit',
    icon: CheckCircle2,
    description: 'Thorough code reviews and security audits. Find bugs before production.',
    details: 'Deep dive technical review of your codebase. Performance optimization, security vulnerability detection, and best practice recommendations.',
  },
  {
    id: 'modernization',
    title: 'Legacy Modernization',
    icon: RefreshCw,
    description: 'Breathe new life into legacy systems. Gradual migration strategies.',
    details: 'Upgrade outdated tech stacks without disrupting operations. Framework migrations, dependency updates, and architectural improvements.',
  },
];

export function ServicesSection() {
  const [selectedService, setSelectedService] = useState(services[0]);

  return (
    <SectionWrapper variant="default">
      <Container>
        {/* Header */}
        <SectionHeader
          subtitle="What We Do"
          title="Our Services"
          description="Complete solutions for your digital challenges"
          align="center"
        />

        {/* Services Grid & Detail View */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedService.id === service.id
                      ? 'bg-brand-500/10 border-brand-500'
                      : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                  }`}
                >
                  <div className={`mb-2 ${selectedService.id === service.id ? 'text-brand-500' : 'text-surface-300'}`}>
                    <service.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {service.title}
                  </h3>
                </button>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-xl bg-surface-800 border border-surface-700">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-brand-500 flex-shrink-0">
                  <selectedService.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedService.title}
                </h3>
              </div>

              <p className="text-sm text-surface-300 leading-relaxed mb-4">
                {selectedService.description}
              </p>

              <div className="pt-4 border-t border-surface-700">
                <p className="text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">
                  Overview
                </p>
                <p className="text-sm text-surface-300 leading-relaxed">
                  {selectedService.details}
                </p>
              </div>

              <button className="mt-6 w-full px-4 py-2 bg-brand-500 hover:bg-brand-600 text-foreground font-semibold rounded-lg transition-colors">
                Get Quote
              </button>
            </div>
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
