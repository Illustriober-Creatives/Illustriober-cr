/**
 * Hero Section Component
 * Premium landing section with headline, description, and CTAs
 * Used as the main introduction on the homepage
 */

import { Button } from "./Button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black py-20 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-orange-600/5 rounded-full blur-3xl" />
      </div>

      {/* Content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow text */}
          <p className="inline-block mb-6 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium uppercase tracking-wider">
            Premium Tech Studio
          </p>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 text-white">
            Build <span className="text-orange-500">remarkable</span> digital
            experiences
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-zinc-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            We're a creative studio specializing in full-stack web development,
            mobile apps, and design. We turn complex ideas into elegant,
            user-focused products.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button size="lg" variant="primary">
              Start a Project
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="secondary">
              View Our Work
            </Button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mt-16 pt-12 border-t border-zinc-700/50">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-orange-500">
                500+
              </p>
              <p className="text-zinc-400 text-sm mt-1">Projects Delivered</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-orange-500">
                98%
              </p>
              <p className="text-zinc-400 text-sm mt-1">Client Satisfaction</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-orange-500">
                $2M+
              </p>
              <p className="text-zinc-400 text-sm mt-1">Value Created</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
