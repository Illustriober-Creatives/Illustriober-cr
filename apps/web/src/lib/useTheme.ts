'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { resolveTheme, type ThemeMode } from './theme';

/**
 * useThemeMode Hook
 * Provides theme-aware utilities and the current theme state
 * Handles hydration and system preference detection
 */
export function useThemeMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';

  const currentTheme = (theme as ThemeMode) || 'system';

  return {
    theme: currentTheme,
    setTheme,
    resolvedTheme: resolvedTheme as 'light' | 'dark',
    isDark,
    isLight,
    mounted,
    toggleTheme: () => setTheme(isDark ? 'light' : 'dark'),
  };
}

/**
 * useThemeTransition Hook
 * Handles smooth transitions when theme changes
 * Prevents flash during theme switching
 */
export function useThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setIsTransitioning(true);
    setTheme(newTheme);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return {
    isTransitioning,
    handleThemeChange,
    currentTheme: theme,
  };
}
