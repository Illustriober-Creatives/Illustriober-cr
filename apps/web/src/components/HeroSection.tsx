/**
 * Hero Section Component
 * Ref: CACHE_BUST_001
 * Premium landing section with headline, description, and CTAs
 * Used as the main introduction on the homepage
 */

import { Button } from "./Button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-48 pb-32 overflow-hidden bg-background">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-[-10%] w-[70%] h-[100%] bg-accent/5 rounded-full blur-[160px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[80%] bg-blue-500/5 rounded-full blur-[160px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card border-glass-border mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/50">
              Premium Tech Studio
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-medium leading-[0.95] tracking-tighter mb-10 text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700">
            Designing <span className="text-accent italic">Exceptional</span> <br /> Digital Futures
          </h1>

          <p className="text-xl md:text-2xl text-foreground/50 font-light leading-relaxed max-w-3xl mb-16 animate-in fade-in slide-in-from-bottom-8 duration-900">
            We sculpt ideas into high-performance digital artifacts.
            Bespoke engineering meets <span className="text-foreground font-normal">limitless design excellence</span>.
          </p>

          <div className="flex flex-wrap justify-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Button size="lg" variant="primary" className="rounded-full group px-12 py-7 text-lg">
              Start a Project
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="secondary" className="rounded-full px-12 py-7 text-lg">
              Explore Portfolio
            </Button>
          </div>

          {/* Minimalist Stats - Floating Luxury feel */}
          <div className="flex justify-center gap-16 md:gap-32 mt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="text-center group cursor-default">
              <p className="text-4xl md:text-5xl font-display font-medium text-foreground mb-3 transition-transform duration-500 group-hover:-translate-y-1">
                500+
              </p>
              <div className="h-px w-8 bg-accent/40 mx-auto mb-3" />
              <p className="text-foreground/30 text-[10px] uppercase tracking-[0.3em]">Global Projects</p>
            </div>
            <div className="text-center group cursor-default">
              <p className="text-4xl md:text-5xl font-display font-medium text-foreground mb-3 transition-transform duration-500 group-hover:-translate-y-1">
                98%
              </p>
              <div className="h-px w-8 bg-accent/40 mx-auto mb-3" />
              <p className="text-foreground/30 text-[10px] uppercase tracking-[0.3em]">Client Retention</p>
            </div>
            <div className="text-center group cursor-default">
              <p className="text-4xl md:text-5xl font-display font-medium text-foreground mb-3 transition-transform duration-500 group-hover:-translate-y-1">
                $2M+
              </p>
              <div className="h-px w-8 bg-accent/40 mx-auto mb-3" />
              <p className="text-foreground/30 text-[10px] uppercase tracking-[0.3em]">Capital Raised</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
