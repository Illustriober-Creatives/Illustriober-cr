/**
 * Hero Section Component
 * Premium landing section with headline, description, and CTAs
 * Used as the main introduction on the homepage
 */

import { Button } from "./Button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-background bg-mesh">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-glass-border mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/60">
                Premium Tech Studio
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-medium leading-[1.1] tracking-tight mb-8 text-white animate-in fade-in slide-in-from-bottom-6 duration-700">
              Building <span className="text-accent italic text-glow">High-Impact</span> Digital Products
            </h1>

            <p className="text-xl md:text-2xl text-foreground/60 font-light leading-relaxed max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-900">
              We turn ideas into lasting, high-quality digital products using 
              cutting-edge engineering and <span className="text-foreground">bespoke design</span>.
            </p>

            <div className="flex flex-wrap gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" variant="primary" className="rounded-2xl group px-10">
                Start a Project
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="secondary" className="rounded-2xl px-10">
                View Our Work
              </Button>
            </div>

            {/* Proof-of-Value Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 p-8 glass-card rounded-3xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="text-center md:text-left">
                <p className="text-3xl font-display font-bold text-accent mb-1">
                  500+
                </p>
                <p className="text-foreground/40 text-xs uppercase tracking-widest">Projects</p>
              </div>
              <div className="text-center md:text-left border-x border-glass-border px-8">
                <p className="text-3xl font-display font-bold text-accent mb-1">
                  98%
                </p>
                <p className="text-foreground/40 text-xs uppercase tracking-widest">Success</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-3xl font-display font-bold text-accent mb-1">
                  $2M+
                </p>
                <p className="text-foreground/40 text-xs uppercase tracking-widest">Value</p>
              </div>
            </div>
          </div>

          <div className="flex-1 relative w-full aspect-square hidden lg:block">
            {/* Morphing 3D-like Visual Placeholder */}
            <div className="absolute inset-0 glass-card rounded-[4rem] rotate-6 scale-95 opacity-50 blur-sm" />
            <div className="absolute inset-0 glass-card rounded-[4rem] -rotate-3 hover:rotate-0 transition-transform duration-700 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-blue-500/20" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                 <div className="w-64 h-64 bg-accent/40 rounded-full blur-[80px] animate-pulse" />
                 <div className="relative text-[10rem] font-display font-bold text-white/5 drop-shadow-2xl select-none">
                    IC
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
