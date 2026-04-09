import { ReactNode } from 'react';
import { cn } from './lib/utils';

/**
 * Container - Consistent max-width and padding wrapper for sections
 * Ensures content stays readable and respects design system spacing
 */
interface ContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'narrow';
}

const containerVariants = {
  default: 'max-w-6xl',    // Standard content width
  hero: 'max-w-7xl',       // Wider for hero sections
  narrow: 'max-w-4xl',     // Narrower for text-heavy sections
};

export function Container({
  children,
  className,
  variant = 'default',
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        containerVariants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
