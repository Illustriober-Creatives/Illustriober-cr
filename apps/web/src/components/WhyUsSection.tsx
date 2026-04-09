import { Container } from './Container';
import { SectionWrapper } from './SectionWrapper';
import { SectionHeader } from './SectionHeader';
import { ValueCard } from './Cards/ValueCard';
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
    <SectionWrapper variant="default">
      <Container>
        {/* Header */}
        <SectionHeader
          subtitle="Why Choose Us"
          title="Why Illustriober"
          description="The difference between good and great lies in the details"
          align="center"
        />

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <div key={index} className="group">
              <div className="p-6 rounded-xl bg-surface-800 border border-surface-700 hover:border-brand-500 transition-all h-full">
                <div className="mb-4 w-12 h-12 bg-surface-700 group-hover:bg-brand-500/20 rounded-lg flex items-center justify-center transition-colors">
                  <prop.icon className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {prop.title}
                </h3>
                <p className="text-sm text-surface-300">
                  {prop.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
