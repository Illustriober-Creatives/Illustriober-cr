import { Container } from './Container';
import { SectionWrapper } from './SectionWrapper';
import { SectionHeader } from './SectionHeader';

/**
 * AboutSnippet - Company overview with mission statement and key stats
 * Featured on home page and about page
 */
export function AboutSnippet() {
  return (
    <SectionWrapper variant="subtle">
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
            <p className="text-2xl text-foreground/70 leading-[1.6] font-light">
              We are a premium creative studio of senior developers and designers building remarkable digital experiences for ambitious founders and enterprises.
            </p>
            <p className="text-lg text-foreground/40 leading-[1.8] font-light italic">
              Every project starts with a deep understanding of your vision. We combine strategic thinking, modern technology, and thoughtful design to deliver solutions that matter.
            </p>
          </div>

          {/* Quick Stats - Luxury minimalist style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mt-24">
            <div className="flex flex-col items-center">
              <p className="text-4xl font-display font-medium text-accent mb-2">15+</p>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/30">Years of Mastery</p>
            </div>
            <div className="flex flex-col items-center border-y md:border-y-0 md:border-x border-foreground/5 py-8 md:py-0">
              <p className="text-4xl font-display font-medium text-accent mb-2">98%</p>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/30">Client Devotion</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-4xl font-display font-medium text-accent mb-2">100%</p>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/30">Remote Native</p>
            </div>

          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
