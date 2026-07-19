'use client';

import { Container } from './Container';
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

const services = [
  { id: 'web-dev',        title: 'Web App Dev',          icon: Code2,          detail: 'React · Next.js · Node.js · TypeScript' },
  { id: 'mobile',         title: 'Mobile',               icon: Smartphone,     detail: 'iOS · Android · React Native · Expo' },
  { id: 'design',         title: 'UI/UX Design',         icon: Palette,        detail: 'Figma · Design Systems · Prototyping' },
  { id: 'cloud',          title: 'Cloud & DevOps',       icon: Cloud,          detail: 'AWS · Docker · Kubernetes · CI/CD' },
  { id: 'bug-fix',        title: 'Emergency Fix',        icon: AlertTriangle,  detail: '1-hour response · Production-down SLA' },
  { id: 'mentorship',     title: 'Mentorship',           icon: Users,          detail: 'Architecture · Code reviews · Career' },
  { id: 'code-review',    title: 'Code Audit',           icon: CheckCircle2,   detail: 'Security · Performance · OWASP' },
  { id: 'modernization',  title: 'Modernization',        icon: RefreshCw,      detail: 'Legacy migration · Framework upgrades' },
];

export function ServicesSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent block mb-4">Expertise</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-foreground tracking-tight leading-[1.05]">
              What we <span className="text-accent">ship.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="glass-card group p-6 rounded-[2rem] flex flex-col items-start hover:scale-[1.03] hover:border-accent/20 transition-all duration-400 cursor-default"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-5 group-hover:bg-accent/15 group-hover:border-accent/20 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-accent" />
                </div>

                {/* Title */}
                <h3 className="text-base font-display font-medium text-foreground tracking-tight mb-1 leading-tight">
                  {service.title}
                </h3>

                {/* Detail */}
                <p className="text-[11px] text-foreground/60 leading-relaxed mt-1">
                  {service.detail}
                </p>

                {/* Index */}
                <div className="mt-auto pt-4 w-full flex justify-between items-center">
                  <span className="text-[9px] font-mono text-foreground/20">0{index + 1}</span>
                  <div className="w-6 h-6 rounded-full border border-white/8 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                    <span className="text-[10px] text-foreground/20 group-hover:text-white transition-colors">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
