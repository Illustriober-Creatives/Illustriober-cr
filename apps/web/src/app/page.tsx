
import { createMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/HeroSection";
import { ClientLogosBar } from "@/components/ClientLogosBar";
import { ServicesSection } from "@/components/ServicesSection";
import { ProcessSimulator } from "@/components/ProcessSimulator";
import { PortfolioTeaser } from "@/components/PortfolioTeaser";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";

export const metadata = createMetadata({
  path: "/",
});

export default function Home() {
  return (
    <main className="flex flex-col w-full bg-background">
      <HeroSection />
      <ClientLogosBar />
      <ServicesSection />
      <ProcessSimulator />
      <PortfolioTeaser />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}
