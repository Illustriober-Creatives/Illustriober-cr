import { Container } from './Container';
import { SectionWrapper } from './SectionWrapper';
import { SectionHeader } from './SectionHeader';

/**
 * AboutSnippet - Company overview with mission statement and key stats
 * Featured on home page and about page
 */
export function AboutSnippet() {
  return (
    <SectionWrapper variant="gradient">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <SectionHeader
            subtitle="Who We Are"
            title="Illustriober Creatives"
            align="center"
          />

          {/* Mission Statement */}
          <div className="space-y-6 mb-12 text-center">
            <p className="text-lg text-surface-200 leading-relaxed">
              We are a premium creative studio of senior developers and designers building remarkable digital experiences for ambitious founders and enterprises.
            </p>
            <p className="text-base text-surface-300 leading-relaxed">
              Every project starts with a deep understanding of your vision. We combine strategic thinking, modern technology, and thoughtful design to deliver solutions that matter.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-brand-500 mb-1">15+</p>
              <p className="text-sm text-surface-400">Years Experience</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-500 mb-1">98%</p>
              <p className="text-sm text-surface-400">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-500 mb-1">100%</p>
              <p className="text-sm text-surface-400">Remote Enabled</p>
            </div>
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
