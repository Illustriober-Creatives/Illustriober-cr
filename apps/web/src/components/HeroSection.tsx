import { Button } from "./Button";
import { DashboardMockup } from "./DashboardMockup";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden bg-background">
      {/* Background glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-[-10%] w-[70%] h-[100%] bg-accent/5 rounded-full blur-[160px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[80%] bg-blue-500/5 rounded-full blur-[160px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Copy */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card border-glass-border mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/50">
                Premium Tech Studio
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-medium leading-[0.95] tracking-tighter mb-8 text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700">
              We build <br />
              <span className="text-accent italic">exceptional</span>
              <br /> digital products.
            </h1>

            <p className="text-lg text-foreground/45 font-light leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-900 max-w-md">
              Senior engineers. Bespoke design. From concept to shipped product.
            </p>

            <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" variant="primary" className="rounded-full group px-10 py-6 text-base">
                Start a Project
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="secondary" className="rounded-full px-10 py-6 text-base">
                View Work
              </Button>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="hidden lg:flex items-center justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
