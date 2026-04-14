import { cn } from '@/lib/utils';

/**
 * SectionHeader - Consistent section title and subtitle styling
 * Theme-aware component that adapts to light and dark modes
 * Used at the beginning of each major page section
 */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({
  title,
  subtitle,
  description,
  align = 'center',
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-12 lg:mb-16', align === 'center' && 'text-center')}>
      {/* Subtitle / Overline */}
      {subtitle && (
        <p className="text-xs sm:text-sm font-semibold text-accent mb-3 sm:mb-2 uppercase tracking-wider">
          {subtitle}
        </p>
      )}

      {/* Title */}
      <h2 className="text-3xl lg:text-5xl font-display font-semibold text-foreground mb-4 sm:mb-6 leading-tight">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className={cn(
          'text-base sm:text-lg text-foreground/60 leading-relaxed',
          align === 'center' && 'max-w-2xl mx-auto'
        )}>
          {description}
        </p>
      )}
    </div>
  );
}
