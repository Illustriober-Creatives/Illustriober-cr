/**
 * Theme Utilities & Constants
 * Centralized theme configuration and helper functions for consistent
 * theme implementation across the application
 */

/**
 * CSS Variable names used throughout the application for theming
 * These are defined in globals.css for both light and dark modes
 */
export const THEME_VARIABLES = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  surface: 'var(--surface)',
  accent: 'var(--accent)',
  accentSoft: 'var(--accent-soft)',
  accentGlow: 'var(--accent-glow)',
  glassBackground: 'var(--glass-bg)',
  glassBackgroundHover: 'var(--glass-bg-hover)',
  glassBorder: 'var(--glass-border)',
  glassBlur: 'var(--glass-blur)',
} as const;

/**
 * Theme modes available in the application
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Get CSS class for applying theme to a specific element
 * @param theme - The theme mode (light, dark, or system)
 * @returns CSS class string
 */
export function getThemeClass(theme: ThemeMode): string {
  if (theme === 'system') return '';
  return theme === 'dark' ? 'dark' : 'light';
}

/**
 * Resolve the actual theme from system preference if system mode is selected
 * @param theme - The selected theme mode
 * @returns The resolved theme (light or dark)
 */
export function resolveTheme(theme: ThemeMode | undefined): 'light' | 'dark' {
  if (!theme || theme === 'system') {
    // Check system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'dark'; // Default to dark on server
  }
  return theme as 'light' | 'dark';
}

/**
 * Theme-aware classname utilities
 */
export const themeClasses = {
  /**
   * Form input styles that adapt to light/dark mode
   */
  input: 'w-full px-4 py-3 rounded-lg bg-surface/50 border border-surface/20 text-foreground placeholder-foreground/40 focus:border-accent focus:outline-none transition-colors duration-200',
  
  /**
   * Form label styles
   */
  label: 'block text-sm font-medium text-foreground mb-2',
  
  /**
   * Card with glass effect
   */
  card: 'glass-card rounded-xl p-6 border border-glass-border hover:border-accent/40 transition-all',
  
  /**
   * Section background
   */
  sectionBg: 'bg-background',
  
  /**
   * Text colors
   */
  text: {
    primary: 'text-foreground',
    secondary: 'text-foreground/70',
    tertiary: 'text-foreground/50',
    accent: 'text-accent',
  },
  
  /**
   * Background colors
   */
  bg: {
    primary: 'bg-background',
    secondary: 'bg-surface',
    glass: 'bg-glass-bg',
  },
} as const;

/**
 * Get color value for current theme
 * Useful for inline styles or where CSS variables can't be used
 */
export const getThemeColor = (isDark: boolean) => ({
  background: isDark ? '#080808' : '#F9FAFB',
  foreground: isDark ? '#F8FAFC' : '#111827',
  surface: isDark ? '#111111' : '#FFFFFF',
  accent: isDark ? '#F97316' : '#EA580C',
  accentSoft: isDark ? 'rgba(249, 115, 22, 0.1)' : 'rgba(234, 88, 12, 0.08)',
  accentGlow: isDark ? 'rgba(249, 115, 22, 0.4)' : 'rgba(234, 88, 12, 0.2)',
});
