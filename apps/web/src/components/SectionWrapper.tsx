import { ReactNode } from 'react';
import { cn } from './lib/utils';

/**
 * SectionWrapper - Consistent section padding and styling
 * Provides visual rhythm and spacing between major page sections
 */
interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'dark';
}

const sectionVariants = {
  default: 'bg-surface-950',           // Default dark background
  gradient: 'bg-gradient-to-br from-surface-900 to-surface-950', // Subtle gradient
  dark: 'bg-surface-950 border-t border-surface-800',              // With top border
};

export function SectionWrapper({
  children,
  className,
  variant = 'default',
}: SectionWrapperProps) {
  return (
    <section className={cn('py-16 lg:py-24', sectionVariants[variant], className)}>
      {children}
    </section>
  );
}
