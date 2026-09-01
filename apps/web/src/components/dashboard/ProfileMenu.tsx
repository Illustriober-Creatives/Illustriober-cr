"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, usePopover } from "@/components/ui/Popover";

interface ProfileMenuProps {
  profileHref: string;
}

export function ProfileMenu({ profileHref }: ProfileMenuProps) {
  const { user } = useAuth();

  return (
    <Popover>
      <Popover.Trigger
        aria-label={user ? `Account menu for ${user.firstName}` : "Account menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-surface text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
      >
        <UserIcon className="h-4 w-4" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Content align="end" className="py-1">
        <ProfileMenuContent profileHref={profileHref} />
      </Popover.Content>
    </Popover>
  );
}

function ProfileMenuContent({ profileHref }: ProfileMenuProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { setOpen } = usePopover();

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.replace("/login");
  };

  return (
    <>
      {user && (
        <div className="border-b border-glass-border px-3 py-2">
          <p className="truncate text-sm font-medium text-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs text-foreground/50">{user.email}</p>
        </div>
      )}
      <Link
        href={profileHref}
        onClick={() => setOpen(false)}
        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-glass-bg"
      >
        <UserIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        Profile
      </Link>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-glass-bg"
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        Log out
      </button>
    </>
  );
}
