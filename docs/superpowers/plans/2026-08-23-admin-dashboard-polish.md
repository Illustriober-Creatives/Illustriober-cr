# Admin Dashboard Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the admin dashboard home a personalized welcome header (matching the pattern already shipped on the client dashboard), and add a self-service admin profile page — filling a spec gap the 8-phase execution plan left unassigned (§4.3 lists `/admin/profile` among admin's new pages, but no numbered phase explicitly builds it; Phases 5/7 build `/admin/users`, `/admin/tasks`, `/admin/company` instead).

**Architecture:** The admin dashboard's KPI strip/ticket queue/activity panel (already built and working) get a welcome header above them, mirroring `/dashboard`'s eyebrow + display-serif h1 + subcopy pattern exactly. The client profile page's form logic (`/dashboard/profile`, built in Phase 2, already reviewed) is extracted into a shared `ProfileSettingsForm` component — its content is 100% identical between roles (same two endpoints, same fields, no role-specific behavior), so duplicating it into a new admin page would be pure copy-paste; extracting it once and rendering it from two thin page wrappers avoids that. `ADMIN_NAV` gets a "Profile" entry. No new API routes — both profile pages reuse `PATCH /api/users/me` and `POST /api/users/me/password`, built and tested in Phase 2.

**Tech Stack:** Next.js 16 (App Router, Client Components), lucide-react icons, Tailwind CSS 4 with the repo's existing design tokens.

**Spec:** `docs/superpowers/specs/2026-08-23-dashboard-platform-redesign.md` (§4.3 Admin Dashboard Redesign)

## Global Constraints

- Design tokens only: `bg-background`, `text-foreground`, `bg-surface`, `text-accent`, `border-glass-border`, `bg-glass-bg`. No `zinc-*` surfaces, `text-white`.
- Match the client dashboard's established welcome-header pattern exactly (`apps/web/src/app/dashboard/page.tsx`'s header block): eyebrow (`text-xs font-bold uppercase tracking-[0.18em] text-accent`), then `font-display text-3xl font-bold text-foreground md:text-4xl` for "Welcome, {firstName}", then a `text-foreground/60` subcopy line.
- Known, already-ledgered issue this plan does NOT fix: `DashboardShell`'s topbar (`apps/web/src/components/dashboard/DashboardShell.tsx:49`) already renders its own `Welcome, {firstName}` line, so both the client dashboard (since Phase 2) and, after this plan, the admin dashboard render two "Welcome" greetings on the same screen. This was flagged during Phase 2's whole-plan review, deliberately deferred to the Phase 8 triage sweep (a single topbar fix resolves it for both dashboards at once — fixing it twice, once per phase, would be wasted work). Do not fix it in this plan.
- No frontend test suite exists in this repo — frontend tasks are verified via `npm run build --workspace apps/web` succeeding with no TypeScript errors.

---

### Task 1: Admin dashboard welcome header

**Files:**
- Modify: `apps/web/src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `useAuth()` (`user: AuthUser | null`) from `apps/web/src/contexts/AuthContext.tsx`. No new props on `KpiStrip`/`TicketQueue`/`ActivityPanel` — unchanged.
- Produces: nothing consumed by a later task — leaf change.

- [ ] **Step 1: Add the welcome header to `apps/web/src/app/admin/page.tsx`**

Current file:

```tsx
"use client";

import { useState } from "react";
import type { AdminTicketCreatedEvent, AdminTicketStatusChangedEvent, TicketComment } from "@illustriober/shared";
import { ActivityPanel } from "@/components/admin/dashboard/ActivityPanel";
import { KpiStrip } from "@/components/admin/dashboard/KpiStrip";
import { TicketQueue } from "@/components/admin/dashboard/TicketQueue";
import { useAdminRealtime } from "@/lib/useAdminRealtime";

type SeqEvent<T> = { seq: number; event: T };

export default function AdminDashboardPage() {
  const [ticketCreated, setTicketCreated] = useState<SeqEvent<AdminTicketCreatedEvent> | null>(null);
  const [statusChanged, setStatusChanged] = useState<SeqEvent<AdminTicketStatusChangedEvent> | null>(null);
  const [comment, setComment] = useState<SeqEvent<TicketComment> | null>(null);

  useAdminRealtime({
    onTicketCreated: (event) => setTicketCreated((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
    onStatusChanged: (event) => setStatusChanged((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
    onComment: (event) => setComment((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

      <KpiStrip ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <TicketQueue ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} commentSeq={comment} />
        <ActivityPanel ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} commentSeq={comment} />
      </div>
    </div>
  );
}
```

Replace it entirely with:

```tsx
"use client";

import { useState } from "react";
import type { AdminTicketCreatedEvent, AdminTicketStatusChangedEvent, TicketComment } from "@illustriober/shared";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityPanel } from "@/components/admin/dashboard/ActivityPanel";
import { KpiStrip } from "@/components/admin/dashboard/KpiStrip";
import { TicketQueue } from "@/components/admin/dashboard/TicketQueue";
import { useAdminRealtime } from "@/lib/useAdminRealtime";

type SeqEvent<T> = { seq: number; event: T };

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [ticketCreated, setTicketCreated] = useState<SeqEvent<AdminTicketCreatedEvent> | null>(null);
  const [statusChanged, setStatusChanged] = useState<SeqEvent<AdminTicketStatusChangedEvent> | null>(null);
  const [comment, setComment] = useState<SeqEvent<TicketComment> | null>(null);

  useAdminRealtime({
    onTicketCreated: (event) => setTicketCreated((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
    onStatusChanged: (event) => setStatusChanged((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
    onComment: (event) => setComment((current) => ({ seq: (current?.seq ?? 0) + 1, event })),
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Welcome, {user.firstName}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/60">
          Here&apos;s what&apos;s happening across tickets, enquiries, and projects today.
        </p>
      </div>

      <KpiStrip ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <TicketQueue ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} commentSeq={comment} />
        <ActivityPanel ticketCreatedSeq={ticketCreated} statusChangedSeq={statusChanged} commentSeq={comment} />
      </div>
    </div>
  );
}
```

The `if (!user) return null;` guard is defensive/consistent with the client dashboard's own convention (`apps/web/src/app/dashboard/page.tsx`) — in practice `AdminGuard` (this route's layout wrapper) already blocks rendering until `user` is populated, so this branch is a belt-and-suspenders match to the sibling page's style, not a fix for an observed bug.

- [ ] **Step 2: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/admin/page.tsx
git commit -m "feat: add personalized welcome header to admin dashboard home"
```

---

### Task 2: Extract shared profile form, add `/admin/profile`

**Files:**
- Create: `apps/web/src/components/profile/ProfileSettingsForm.tsx`
- Modify: `apps/web/src/app/dashboard/profile/page.tsx` (thin wrapper)
- Create: `apps/web/src/app/admin/profile/page.tsx` (thin wrapper)
- Modify: `apps/web/src/app/admin/layout.tsx` (add nav entry)

**Interfaces:**
- Consumes: `useAuth()` (`user`, `fetchWithAuth`, `updateUser`) from `apps/web/src/contexts/AuthContext.tsx`; `PATCH /api/users/me`, `POST /api/users/me/password` (built and tested in Phase 2, unchanged).
- Produces: `ProfileSettingsForm` (default export, no props) — consumed by both page wrappers in this same task. Nothing consumed by a later task.

- [ ] **Step 1: Create `apps/web/src/components/profile/ProfileSettingsForm.tsx`**

This is the existing content of `apps/web/src/app/dashboard/profile/page.tsx` (as built by Phase 2 and its whole-plan review fix wave), moved verbatim into a shared component and renamed from `ClientProfilePage` to `ProfileSettingsForm`. No logic changes — copy exactly:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UpdateProfileResponse {
  user: {
    firstName: string;
    lastName: string;
    phone: string | null;
  };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export function ProfileSettingsForm() {
  const { user, fetchWithAuth, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await fetchWithAuth("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone }),
      });

      if (!res.ok) {
        setProfileError(await readErrorMessage(res));
        return;
      }

      const data = (await res.json()) as UpdateProfileResponse;
      updateUser({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      });
      setProfileSuccess(true);
    } catch {
      setProfileError("Something went wrong. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetchWithAuth("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        setPasswordError(await readErrorMessage(res));
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Profile</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Your Profile
        </h1>
      </div>

      <div className="max-w-xl rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="text-lg font-bold text-foreground">Personal Details</h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => void handleProfileSubmit(e)}>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground/50"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              maxLength={30}
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          {profileError && <p className="text-sm text-red-600">{profileError}</p>}
          {profileSuccess && <p className="text-sm text-accent">Profile updated.</p>}

          <button
            type="submit"
            disabled={profileSaving}
            className="self-start rounded-full bg-accent px-6 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="max-w-xl rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="text-lg font-bold text-foreground">Change Password</h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => void handlePasswordSubmit(e)}>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>

          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-accent">Password updated.</p>}

          <button
            type="submit"
            disabled={passwordSaving}
            className="self-start rounded-full border border-glass-border px-6 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-glass-bg disabled:opacity-50"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `apps/web/src/app/dashboard/profile/page.tsx` with a thin wrapper**

```tsx
"use client";

import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";

export default function ClientProfilePage() {
  return <ProfileSettingsForm />;
}
```

- [ ] **Step 3: Create `apps/web/src/app/admin/profile/page.tsx`**

```tsx
"use client";

import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";

export default function AdminProfilePage() {
  return <ProfileSettingsForm />;
}
```

- [ ] **Step 4: Add the "Profile" nav entry to `apps/web/src/app/admin/layout.tsx`**

Current:

```tsx
"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, Mail, FolderKanban, Ticket } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";

const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <DashboardShell navItems={ADMIN_NAV} eyebrow="Admin">
        {children}
      </DashboardShell>
    </AdminGuard>
  );
}
```

Change the import and the `ADMIN_NAV` array only:

```tsx
import { LayoutDashboard, Mail, FolderKanban, Ticket, User } from "lucide-react";
```

```tsx
const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/profile", label: "Profile", icon: User },
];
```

Do not add "Users," "Tasks," or "Company" entries yet — those routes don't exist until Phase 5 (`/admin/users`) and Phase 7 (`/admin/tasks`, `/admin/company`). Adding nav links to nonexistent routes now would be a real, user-visible bug (a 404 on click), not a harmless placeholder — each entry is added in the same task that ships its target page.

- [ ] **Step 5: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors, `/admin/profile` appears in the route list.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/profile/ProfileSettingsForm.tsx apps/web/src/app/dashboard/profile/page.tsx apps/web/src/app/admin/profile/page.tsx apps/web/src/app/admin/layout.tsx
git commit -m "feat: extract shared profile form, add self-service admin profile page"
```
