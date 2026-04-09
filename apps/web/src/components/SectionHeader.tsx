import { cn } from './lib/utils';

/**
 * SectionHeader - Consistent section title and subtitle styling
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
        <p className="text-sm font-semibold text-brand-500 mb-2 uppercase tracking-wider">
          {subtitle}
        </p>
      )}

      {/* Title */}
      <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className={cn(
          'text-lg text-surface-300 leading-relaxed',
          align === 'center' && 'max-w-2xl mx-auto'
        )}>
          {description}
        </p>
      )}
    </div>
  );
}
