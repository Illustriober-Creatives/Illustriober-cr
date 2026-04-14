'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ModeToggle Component
 * Elegant theme switcher with smooth animations and visual feedback
 * Supports light, dark, and system modes with persistent preference
 * 
 * Features:
 * - Smooth icon transitions using Framer Motion
 * - Visual indication of current theme with glow effect
 * - Keyboard accessible
 * - Avoids hydration mismatch
 * - Theme persistence
 */
export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  // Avoid hydration mismatch by waiting for mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-11 h-11 rounded-xl bg-surface/40 border border-glass-border animate-pulse" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <motion.button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative p-2.5 rounded-xl glass-card border-glass-border hover:border-accent/40 transition-all duration-300 group overflow-hidden"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Dynamic background glow on hover */}
      <motion.div
        className="absolute inset-0 bg-accent/10 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Icon container with smooth transitions */}
      <div className="relative w-5 h-5">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: -45, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              exit={{ y: -20, opacity: 0, rotate: 45, scale: 0.5 }}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="w-5 h-5 text-accent" strokeWidth={2} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: -45, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              exit={{ y: -20, opacity: 0, rotate: 45, scale: 0.5 }}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="w-5 h-5 text-accent" strokeWidth={2} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle rotating ring accent on hover */}
      <motion.div
        className="absolute inset-[-2px] rounded-xl border border-transparent"
        animate={
          isHovered
            ? {
                borderColor: ['transparent', 'var(--accent)', 'transparent'],
              }
            : { borderColor: 'transparent' }
        }
        transition={{
          duration: 1.5,
          repeat: isHovered ? Infinity : 0,
        }}
      />

      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
}
