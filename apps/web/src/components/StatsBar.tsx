'use client';

import { useEffect, useState } from 'react';
import { Container } from './Container';

/**
 * StatsBar - Animated counter display for key metrics
 * Triggers animation when element enters viewport
 */
interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

const stats: Stat[] = [
  { value: 500, label: 'Projects Completed', suffix: '+' },
  { value: 98, label: 'Client Satisfaction', suffix: '%' },
  { value: 2, label: 'Value Delivered', suffix: 'M+' },
  { value: 15, label: 'Tech Stack', suffix: '+' },
];

/**
 * AnimatedCounter - Individual counter with animation
 */
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      setDisplayValue(Math.floor(value * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export function StatsBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simple intersection observer for animation trigger
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <div id="stats-section" className="py-12 lg:py-16 bg-surface-900 border-y border-surface-800">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              {/* Counter Value */}
              <div className="text-3xl lg:text-4xl font-bold text-brand-500 mb-2">
                {isVisible ? (
                  <>
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix}
                  </>
                ) : (
                  <>0{stat.suffix}</>
                )}
              </div>
              {/* Label */}
              <p className="text-sm text-surface-300">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
