import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

/**
 * Footer component - Site footer with links, social media, and legal info
 * Responsive: Stacked on mobile, multi-column on desktop
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'Work', href: '/work' },
      { label: 'Tech Stack', href: '/tech-stack' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' }, // Placeholder, update if blog exists
      { label: 'Contact', href: '/enquiry' },
    ],
    Legal: [
      { label: 'Privacy', href: '/privacy' }, // Placeholder, update if privacy page exists
      { label: 'Terms', href: '/terms' }, // Placeholder, update if terms page exists
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Mail, href: 'mailto:hello@illustriober.com', label: 'Email' },
  ];

  return (
    <footer className="bg-background border-t border-foreground/5 py-24">
      <div className="px-6 sm:px-8 lg:px-12">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">IC</span>
              </div>
              <span className="font-display font-bold text-2xl text-foreground tracking-tight">
                Illustriober <span className="text-accent italic">Creatives</span>
              </span>
            </div>
            <p className="text-lg text-foreground/40 font-light mb-10 max-w-sm">
              Sculpting high-performance digital artifacts with bespoke engineering and limitless design excellence.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 glass-card rounded-xl flex items-center justify-center hover:bg-accent group transition-all duration-300"
                  >
                    <Icon className="w-5 h-5 text-foreground/60 group-hover:text-white" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-12">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-8">
                  {category}
                </h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={`${category}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/40 hover:text-accent transition-colors block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-8">
              Inquiries
            </h3>
            <a
              href="mailto:hello@illustriober.com"
              className="inline-block text-lg text-foreground/60 hover:text-accent transition-colors mb-4 font-light"
            >
              hello@illustriober.com
            </a>
            <p className="text-xs text-foreground/20 uppercase tracking-[0.2em] mt-4">
              Available globally • Remote Dedicated
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-32 pt-12 border-t border-foreground/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-foreground/30 uppercase tracking-[0.2em]">
            <p>
              © {currentYear} Illustriober Creatives. All rights reserved.
            </p>
            <div className="flex gap-10">
              <Link
                href="/privacy"
                className="hover:text-accent transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-accent transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>

  );
}
