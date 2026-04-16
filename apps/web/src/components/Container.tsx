import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Container - Consistent max-width and padding wrapper for sections
 * Theme-aware responsive container for consistent content layout
 */
interface ContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'narrow';
}

const containerVariants = {
  default: 'max-w-6xl',
  hero: 'max-w-7xl',
  narrow: 'max-w-4xl',
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
