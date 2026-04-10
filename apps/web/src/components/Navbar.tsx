'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

/**
 * Navbar component - Responsive header with navigation links and CTA
 * Features: Mobile hamburger menu, active link highlighting, sticky positioning
 */
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigation links for the site
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/work', label: 'Work' },
    { href: '/tech-stack', label: 'Tech Stack' },
  ];

  /**
   * Close menu when a link is clicked.
   * This improves UX on mobile - user doesn't have to manually close menu.
   */
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl">
      <div className="glass-card rounded-2xl px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent shadow-[0_0_15px_var(--accent-glow)] rounded-xl flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">S</span>
            </div>
            <span className="hidden sm:inline font-display font-bold text-xl text-foreground tracking-tight">
              Illustriober <span className="text-accent underline decoration-accent/30 underline-offset-4">Creatives</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/70 hover:text-accent hover:text-glow transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <Link href="/enquiry">
              <Button
                variant="primary"
                size="sm"
                className="rounded-xl"
              >
                Let's Talk
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="block px-4 py-3 text-sm font-medium text-foreground/70 hover:bg-white/5 hover:text-accent rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4">
              <Link href="/enquiry" onClick={handleLinkClick} className="block">
                <Button variant="primary" size="md" className="w-full rounded-xl">
                  Start a Project
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
