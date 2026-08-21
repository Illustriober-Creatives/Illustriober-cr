import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * SectionWrapper - Consistent section padding and styling
 * Theme-aware component that provides visual rhythm between page sections
 * Automatically adapts to light and dark modes
 * 
 * Usage:
 * - variant='default' for normal sections
 * - variant='tight' for close spacing (xs/sm)
 * - variant='normal' for medium spacing (md)
 * - variant='large' for large spacing (lg/xl)
 */
interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'tight' | 'normal' | 'large' | 'subtle' | 'bordered';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sectionVariants = {
  default: 'bg-background',
  tight: 'bg-background section-sm',
  normal: 'bg-background section-md',
  large: 'bg-background section-lg',
  subtle: 'bg-surface/5 transition-colors',
  bordered: 'bg-background border-t border-surface/10 transition-colors',
};

const spacingMap = {
  xs: 'section-xs',
  sm: 'section-sm',
  md: 'section-md',
  lg: 'section-lg',
  xl: 'section-xl',
};

export function SectionWrapper({
  children,
  className,
  variant = 'normal',
  spacing,
}: SectionWrapperProps) {
  const spacingClass = spacing ? spacingMap[spacing] : '';
  
  return (
    <section className={cn(
      sectionVariants[variant],
      spacingClass,
      className
    )}>
      {children}
    </section>
  );
}
