import { ReactNode } from 'react';

/**
 * ValueCard - Showcase a value proposition or feature benefit
 * Used in "Why Us" section and similar areas
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
    <div className="flex gap-4 p-6">
      {/* Icon Container */}
      <div className="flex-shrink-0 text-brand-500">
        <div className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-lg group-hover:bg-brand-500 group-hover:text-foreground transition-all">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          {title}
        </h3>
        <p className="text-sm text-surface-300">
          {description}
        </p>
      </div>
    </div>
  );
}
