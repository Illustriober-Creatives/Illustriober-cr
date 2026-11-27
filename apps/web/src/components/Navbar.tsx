"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    if (isMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2">
      <div className="rounded-2xl border border-black/10 bg-[#FFFDF8] px-4 py-3 shadow-[0_8px_24px_rgba(23,23,23,0.08)] md:rounded-full md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-2.5" href="/" onClick={closeMenu}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F39314] font-display text-lg font-bold text-[#171717]">il</span>
            <span className="text-sm font-bold tracking-tight text-[#171717] sm:text-base">Illustriober Creatives</span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                    active
                      ? "bg-[#F4EFE5] text-[#171717]"
                      : "text-[#5F5A50] hover:text-[#171717]"
                  }`}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <Link className="rounded-full bg-[#171717] px-4 py-2.5 text-sm font-bold text-[#F4EFE5] transition-transform duration-200 hover:-translate-y-0.5" href="/dashboard">Dashboard</Link>
            ) : (
              <>
                <Link className="text-sm font-semibold text-[#5F5A50] transition-colors hover:text-[#171717]" href="/login">Sign in</Link>
                <Link className="rounded-full bg-[#171717] px-4 py-2.5 text-sm font-bold text-[#F4EFE5] transition-transform duration-200 hover:-translate-y-0.5" href="/enquiry">Start a project</Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <button
              aria-controls="mobile-nav-menu"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
              className="grid h-11 w-11 place-items-center rounded-full bg-[#171717] text-[#F4EFE5]"
              onClick={() => setIsMenuOpen((open) => !open)}
              type="button"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="mt-4 grid gap-1 border-t border-black/10 pt-3 md:hidden" id="mobile-nav-menu">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#F4EFE5] text-[#171717] font-bold"
                      : "text-[#5F5A50] hover:bg-[#F4EFE5]/50 hover:text-[#171717]"
                  }`}
                  href={link.href}
                  key={link.href}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              );
            })}
            {user ? (
              <Link className="mt-2 rounded-full bg-[#171717] px-4 py-3 text-center text-sm font-bold text-[#F4EFE5]" href="/dashboard" onClick={closeMenu}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="rounded-xl px-3 py-3 text-sm font-semibold text-[#5F5A50] hover:bg-[#F4EFE5]/50" href="/login" onClick={closeMenu}>
                  Sign in
                </Link>
                <Link className="mt-2 rounded-full bg-[#171717] px-4 py-3 text-center text-sm font-bold text-[#F4EFE5]" href="/enquiry" onClick={closeMenu}>
                  Start a project
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
