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
  ArrowRight,
} from 'lucide-react';
import { Button } from './Button';

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
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 rounded-full glass-card border-glass-border mb-4">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">Expertise</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-6">
              Level up your <br /> <span className="text-accent italic">development</span> game
            </h2>
            <p className="text-lg text-foreground/60 font-light">
              We provide high-impact solutions for digital products, from rapid bug 
              fixes to full-scale architectural modernization.
            </p>
          </div>
          <Button variant="secondary" className="rounded-2xl px-8 h-14">
            Browse All Services
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div 
              key={service.id}
              className="glass-card group p-8 rounded-[2.5rem] flex flex-col items-start hover:scale-[1.02] transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors">
                <service.icon className="w-7 h-7 text-accent" />
              </div>
              
              <h3 className="text-xl font-display font-medium text-white mb-3 tracking-tight">
                {service.title}
              </h3>
              
              <p className="text-sm text-foreground/50 leading-relaxed font-light mb-8">
                {service.description}
              </p>

              <div className="mt-auto pt-6 border-t border-white/5 w-full flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/30">0{index + 1}</span>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                  <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
