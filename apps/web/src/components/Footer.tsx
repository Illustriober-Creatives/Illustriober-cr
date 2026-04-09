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
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '/enquiry' },
    ],
    Legal: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Mail, href: 'mailto:hello@illustriober.com', label: 'Email' },
  ];

  return (
    <footer className="bg-surface-950 border-t border-surface-800">
      <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IC</span>
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                Illustriober
              </span>
            </div>
            <p className="text-sm text-surface-300 mb-6">
              Premium software and design for ambitious builders.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-surface-800 hover:bg-brand-500 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-surface-300 hover:text-brand-500 transition-colors"
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
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Get in Touch
            </h3>
            <a
              href="mailto:hello@illustriober.com"
              className="inline-block text-sm text-surface-300 hover:text-brand-500 transition-colors mb-6"
            >
              hello@illustriober.com
            </a>
            <p className="text-sm text-surface-400">
              Based in Kenya • Available globally
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-surface-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-surface-400">
            <p>
              © {currentYear} Illustriober Creatives. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="hover:text-brand-500 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="hover:text-brand-500 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
