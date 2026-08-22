"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = async () => {
    closeMenu();
    await logout();
    router.replace("/login");
  };

  return (
    <nav className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2">
      <div className="border border-black/10 bg-[#FFFDF8]/95 px-4 py-3 shadow-[0_8px_24px_rgba(23,23,23,0.08)] backdrop-blur md:rounded-full md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-2.5" href="/" onClick={closeMenu}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F39314] font-display text-lg font-bold text-[#171717]">il</span>
            <span className="text-sm font-bold tracking-tight text-[#171717] sm:text-base">Illustriober Creatives</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => <Link className="text-sm font-semibold text-[#5F5A50] transition-colors hover:text-[#171717]" href={link.href} key={link.href}>{link.label}</Link>)}
          </div>
          <div className="hidden items-center gap-4 md:flex">
            {user ? <><Link className="text-sm font-semibold text-[#5F5A50] hover:text-[#171717]" href="/dashboard">Dashboard</Link><button className="text-sm font-semibold text-[#5F5A50] hover:text-[#171717]" onClick={() => void handleLogout()} type="button">Sign out</button></> : <Link className="text-sm font-semibold text-[#5F5A50] hover:text-[#171717]" href="/login">Sign in</Link>}
            <Link className="rounded-full bg-[#171717] px-4 py-2.5 text-sm font-bold text-[#F4EFE5] transition-transform hover:-translate-y-0.5" href="/enquiry">Start a project</Link>
          </div>
          <div className="flex items-center gap-2 md:hidden"><button aria-expanded={isMenuOpen} aria-label="Toggle navigation" className="grid h-11 w-11 place-items-center rounded-full bg-[#171717] text-[#F4EFE5]" onClick={() => setIsMenuOpen((open) => !open)} type="button">{isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
        </div>
        {isMenuOpen && <div className="mt-4 grid gap-1 border-t border-black/10 pt-3 md:hidden">{navLinks.map((link) => <Link className="rounded-lg px-3 py-3 text-sm font-semibold text-[#5F5A50] hover:bg-[#F4EFE5] hover:text-[#171717]" href={link.href} key={link.href} onClick={closeMenu}>{link.label}</Link>)}{user ? <><Link className="rounded-lg px-3 py-3 text-sm font-semibold text-[#5F5A50] hover:bg-[#F4EFE5]" href="/dashboard" onClick={closeMenu}>Dashboard</Link><button className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#5F5A50] hover:bg-[#F4EFE5]" onClick={() => void handleLogout()} type="button">Sign out</button></> : <Link className="rounded-lg px-3 py-3 text-sm font-semibold text-[#5F5A50] hover:bg-[#F4EFE5]" href="/login" onClick={closeMenu}>Sign in</Link>}<Link className="mt-2 rounded-full bg-[#171717] px-4 py-3 text-center text-sm font-bold text-[#F4EFE5]" href="/enquiry" onClick={closeMenu}>Start a project</Link></div>}
      </div>
    </nav>
  );
}
