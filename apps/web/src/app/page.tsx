/**
 * Home Page
 * Main landing page showcasing Illustriober Creatives' services and value proposition
 * 
 * Layout:
 * 1. HeroSection - Bold headline, CTA buttons, and hero image
 * 2. ClientLogosBar - Auto-scrolling carousel of client logos
 * 3. StatsBar - Animated counters for key metrics
 * 4. AboutSnippet - Company mission and quick stats
 * 5. ServicesSection - Interactive service showcase
 * 6. WhyUsSection - Value propositions and differentiators
 * 7. PortfolioTeaser - Featured projects preview
 * 8. TestimonialsSection - Client testimonials carousel
 * 9. CTASection - Final call-to-action banner
 */

import { HeroSection } from "@/components/HeroSection";
import { ClientLogosBar } from "@/components/ClientLogosBar";
import { StatsBar } from "@/components/StatsBar";
import { AboutSnippet } from "@/components/AboutSnippet";
import { ServicesSection } from "@/components/ServicesSection";
import { WhyUsSection } from "@/components/WhyUsSection";
import { PortfolioTeaser } from "@/components/PortfolioTeaser";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";

export default function Home() {
  return (
    <main className="flex flex-col w-full bg-background">
      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Client Logos */}
      <ClientLogosBar />

      {/* Section 3: Stats Bar */}
      <StatsBar />

      {/* Section 4: About Snippet */}
      <AboutSnippet />

      {/* Section 5: Services */}
      <ServicesSection />

      {/* Section 6: Why Us */}
      <WhyUsSection />

      {/* Section 7: Portfolio Teaser */}
      <PortfolioTeaser />

      {/* Section 8: Testimonials */}
      <TestimonialsSection />

      {/* Section 9: Final CTA */}
      <CTASection />
    </main>
  );
}
