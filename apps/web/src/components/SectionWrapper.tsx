import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * SectionWrapper - Consistent section padding and styling
 * Theme-aware component that provides visual rhythm between page sections
 * Automatically adapts to light and dark modes
 */
interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'bordered';
}

const sectionVariants = {
  default: 'bg-background',
  subtle: 'bg-surface/5 transition-colors',
  bordered: 'bg-background border-t border-surface/10 transition-colors',
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
