"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [loading, router, user]);

  if (loading || !user || user.role === "ADMIN") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
