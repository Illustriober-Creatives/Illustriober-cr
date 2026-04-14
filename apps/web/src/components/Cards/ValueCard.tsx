import { ReactNode } from 'react';

/**
 * ValueCard - Showcase a value proposition or feature benefit
 * Theme-aware component used in "Why Us" section and similar areas
 * @param icon - Lucide icon component
 * @param title - Value proposition title
 * @param description - Detailed explanation of the value
 */
interface ValueCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <div className="flex gap-4 p-6 group">
      {/* Icon Container - Theme aware */}
      <div className="flex-shrink-0 text-accent">
        <div className="w-10 h-10 flex items-center justify-center bg-accent-soft/50 rounded-lg group-hover:bg-accent group-hover:text-white transition-all">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          {title}
        </h3>
        <p className="text-sm text-foreground/60">
          {description}
        </p>
      </div>
    </div>
  );
}
