import Link from 'next/link';
import { Container } from './Container';
import { SectionWrapper } from './SectionWrapper';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

/**
 * CTASection - Full-width call-to-action banner
 * Prompts user to start a project
 */
export function CTASection() {
  return (
    <SectionWrapper variant="gradient">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            Ready to build something remarkable?
          </h2>

          {/* Subheading */}
          <p className="text-lg text-surface-300 mb-8 leading-relaxed">
            Let's discuss your project and explore how we can help bring your vision to life.
          </p>

          {/* CTA Button */}
          <div className="flex gap-4 justify-center">
            <Link href="/enquiry">
              <Button
                variant="primary"
                size="lg"
              >
                Start a Project
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Supporting Text */}
          <p className="text-sm text-surface-400 mt-8">
            Response time: 24 hours • Full discovery call within 48 hours
          </p>
        </div>
      </Container>
    </SectionWrapper>
  );
}
