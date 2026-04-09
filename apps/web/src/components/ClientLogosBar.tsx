'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

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
    <div className="overflow-hidden bg-surface-950 border-y border-surface-800">
      <div
        ref={scrollContainerRef}
        className="flex whitespace-nowrap animate-scroll"
        style={{
          animationDuration: '30s',
          // Using CSS animation for better performance
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.id}-${index}`}
            className="flex-shrink-0 inline-flex items-center justify-center px-8 sm:px-12 h-24"
          >
            <img
              src={logo.url}
              alt={logo.name}
              className="h-10 object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
