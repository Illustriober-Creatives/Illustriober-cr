'use client';

import Image from 'next/image';
import { useRef } from 'react';

/**
 * ClientLogosBar - Auto-scrolling carousel of client logos
 * Loops seamlessly with duplicate logos for effect
 */
export function ClientLogosBar() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Example client logos (replace with real logos)
  const logos = [
    { id: 1, name: 'TechCorp', url: '/logo-techcorp.svg' },
    { id: 2, name: 'StartupAI', url: '/logo-startupal.svg' },
    { id: 3, name: 'DataFlow', url: '/logo-dataflow.svg' },
    { id: 4, name: 'CloudSync', url: '/logo-cloudsync.svg' },
    { id: 5, name: 'WebStudio', url: '/logo-webstudio.svg' },
    { id: 6, name: 'DesignPro', url: '/logo-designpro.svg' },
  ];

  // Duplicate for seamless scroll
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div className="overflow-hidden bg-background border-y border-foreground/5 py-8">
      <div
        ref={scrollContainerRef}
        className="flex whitespace-nowrap animate-scroll"
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.id}-${index}`}
            className="flex-shrink-0 inline-flex items-center justify-center px-10 sm:px-16"
          >
            <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <span className="text-xl font-display font-medium text-foreground">{logo.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

  );
}
