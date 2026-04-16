import { Container } from './Container';
import { SectionWrapper } from './SectionWrapper';
import { SectionHeader } from './SectionHeader';
import {
  Award,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Target,
} from 'lucide-react';

/**
 * WhyUsSection - Value propositions and key differentiators
 * Sold with card layout and icons
 */
const valueProps = [
  {
    icon: Award,
    title: 'Senior Developers Only',
    description: 'No junior devs, no outsourcing. Every project led by senior engineers with 10+ years experience.',
  },
  {
    icon: Zap,
    title: 'Fast Turnaround',
    description: 'Rapid iteration and delivery. MVP in weeks, not months. Daily progress updates.',
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'Built with security by default. Regular audits, best practices, OWASP compliance.',
  },
  {
    icon: Users,
    title: 'True Partnership',
    description: 'Not just a vendor. We invest in your success and act as an extension of your team.',
  },
  {
    icon: TrendingUp,
    title: 'Scalable Architecture',
    description: 'Design for growth. Your app scales from 1k to 1M users without major rewrites.',
  },
  {
    icon: Target,
    title: 'Results Focused',
    description: 'Every decision driven by metrics. We measure success by your business outcomes.',
  },
];

export function WhyUsSection() {
  return (
    <SectionWrapper variant="default" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div className="absolute right-0 top-16 h-56 w-56 rounded-full bg-accent-soft blur-3xl" />
      </div>

      <Container>
        {/* Header */}
        <SectionHeader
          subtitle="Why Choose Us"
          title="Why Illustriober Works"
          description="Premium execution standards designed for long-term product velocity and reliability"
          align="center"
        />

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <article key={index} className="group relative h-full">
              <div className="glass-card h-full rounded-2xl p-7 border-glass-border hover:border-accent/40 hover:bg-glass-bg-hover transition-all duration-300">
                <div className="mb-6 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center border border-accent/20 group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                    <prop.icon className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/40">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {prop.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/65">
                  {prop.description}
                </p>

                <div className="mt-6 h-px w-16 bg-gradient-to-r from-accent/50 to-transparent" />
              </div>
            </article>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
