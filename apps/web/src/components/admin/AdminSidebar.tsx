"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { href: "/admin/enquiries", label: "Enquiries" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside className="flex h-full w-56 flex-col border-r border-zinc-800 bg-zinc-950 px-4 py-8">
      <p className="mb-8 text-xs font-bold uppercase tracking-widest text-accent">
        Admin
      </p>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => void handleLogout()}
        className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
      >
        Sign out
      </button>
    </aside>
  );
}
