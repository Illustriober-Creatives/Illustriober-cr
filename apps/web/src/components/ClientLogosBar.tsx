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
    { id: 1, name: 'TechCorp', url: 'https://via.placeholder.com/120x40?text=TechCorp' },
    { id: 2, name: 'StartupAI', url: 'https://via.placeholder.com/120x40?text=StartupAI' },
    { id: 3, name: 'DataFlow', url: 'https://via.placeholder.com/120x40?text=DataFlow' },
    { id: 4, name: 'CloudSync', url: 'https://via.placeholder.com/120x40?text=CloudSync' },
    { id: 5, name: 'WebStudio', url: 'https://via.placeholder.com/120x40?text=WebStudio' },
    { id: 6, name: 'DesignPro', url: 'https://via.placeholder.com/120x40?text=DesignPro' },
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
