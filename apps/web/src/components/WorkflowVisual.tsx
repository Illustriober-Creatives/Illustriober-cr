'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, FileText, Code2, Rocket, HeartHandshake } from 'lucide-react';
import { Container } from './Container';

const steps = [
  { num: '01', icon: Search,         label: 'Discover',  sub: 'Deep-dive into your goals' },
  { num: '02', icon: FileText,       label: 'Specify',   sub: 'Scope locked. No surprises.' },
  { num: '03', icon: Code2,          label: 'Build',     sub: 'Senior engineers, daily progress' },
  { num: '04', icon: Rocket,         label: 'Ship',      sub: 'Deployed. Tested. Yours.' },
  { num: '05', icon: HeartHandshake, label: 'Support',   sub: 'We stay. You scale.' },
];

export function WorkflowVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let i = 0;
          const tick = () => {
            setActive(i);
            i++;
            if (i < steps.length) setTimeout(tick, 200);
          };
          setTimeout(tick, 300);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 lg:py-36 bg-background border-y border-foreground/5 overflow-hidden">
      <Container>
        <div className="text-center mb-16">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent mb-4 block">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-display font-medium text-foreground tracking-tight">
            Idea to live product — <span className="text-accent italic">five steps.</span>
          </h2>
        </div>

        {/* Steps row */}
        <div className="relative flex flex-col md:flex-row items-stretch gap-0">
          {/* Connecting line track (desktop only) */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-foreground/8 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLit = i <= active;
            return (
              <div key={step.num} className="relative flex-1 flex flex-col items-center group z-10">
                {/* Filled portion of the connector to the left */}
                {i > 0 && (
                  <div
                    className={`hidden md:block absolute top-8 right-1/2 left-[-50%] h-px transition-all duration-500 ${isLit ? 'bg-accent' : 'bg-foreground/8'}`}
                  />
                )}

                {/* Icon circle */}
                <div
                  className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-5 transition-all duration-500 ${
                    isLit
                      ? 'bg-accent/15 border-accent/40 scale-110 shadow-[0_0_24px_theme(colors.accent/0.25)]'
                      : 'bg-white/3 border-white/8 scale-100'
                  }`}
                >
                  <Icon className={`w-7 h-7 transition-colors duration-500 ${isLit ? 'text-accent' : 'text-foreground/20'}`} />
                </div>

                {/* Step number */}
                <span className={`text-[9px] font-mono mb-1 transition-colors duration-500 ${isLit ? 'text-accent' : 'text-foreground/20'}`}>
                  {step.num}
                </span>

                {/* Label */}
                <p className={`text-sm font-semibold tracking-tight transition-colors duration-500 text-center ${isLit ? 'text-foreground' : 'text-foreground/25'}`}>
                  {step.label}
                </p>
                <p className={`text-[11px] mt-1 font-light leading-snug transition-colors duration-500 text-center max-w-[90px] ${isLit ? 'text-foreground/40' : 'text-foreground/12'}`}>
                  {step.sub}
                </p>

                {/* Mobile connector */}
                {i < steps.length - 1 && (
                  <div className={`md:hidden mt-4 w-px h-8 transition-all duration-500 ${isLit ? 'bg-accent/50' : 'bg-foreground/8'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Stats row — single occurrence on the page */}
        <div className="grid grid-cols-3 gap-8 md:gap-16 mt-20 pt-16 border-t border-foreground/5 max-w-xl mx-auto text-center">
          {[
            { v: '500+', l: 'Projects' },
            { v: '98%',  l: 'Retention' },
            { v: '15+',  l: 'Years' },
          ].map(s => (
            <div key={s.l}>
              <p className="text-3xl md:text-4xl font-display font-medium text-accent mb-2">{s.v}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/30">{s.l}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
