/**
 * Utility function: classNameMerger (cn)
 * Merge className strings with intelligent handling of contradictory classes
 * 
 * Usage:
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4' (px-4 overrides px-2)
 * cn('flex gap-2', undefined, false && 'hidden') // 'flex gap-2'
 */

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter((cls) => typeof cls === 'string' && cls.length > 0)
    .join(' ');
}
