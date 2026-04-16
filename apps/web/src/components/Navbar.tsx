'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';
import { ModeToggle } from './ModeToggle';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Navbar component - Responsive header with navigation links and CTA
 * Features: Mobile hamburger menu, active link highlighting, sticky positioning
 */
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
    <nav className="fixed top-10 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-7xl">
      <div className="glass-card rounded-[2.5rem] px-10 py-5">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-accent shadow-[0_0_25px_var(--accent-glow)] rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-[10deg]">
              <span className="text-white font-display font-bold text-xl">S</span>
            </div>
            <span className="hidden sm:inline font-display font-bold text-2xl text-foreground tracking-tighter">
              Illustriober <span className="text-accent italic selection:bg-accent/30 tracking-tight">Creatives</span>
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

          {/* Desktop CTA + account */}
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <div className="w-[1px] h-6 bg-foreground/10 mx-2" />
            {user ? (

              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-foreground/70 hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => void logout()}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/70 hover:text-accent transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link href="/enquiry">
              <Button
                variant="primary"
                size="sm"
                className="rounded-xl"
              >
                Let&apos;s Talk
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Actions */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
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
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={handleLinkClick}
                    className="block px-4 py-3 text-sm font-medium text-foreground/70 hover:bg-white/5 hover:text-accent rounded-xl transition-all"
                  >
                    Dashboard
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="w-full rounded-xl"
                    onClick={() => {
                      handleLinkClick();
                      void logout();
                    }}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="block px-4 py-3 text-sm font-medium text-foreground/70 hover:bg-white/5 hover:text-accent rounded-xl transition-all"
                >
                  Sign in
                </Link>
              )}
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
