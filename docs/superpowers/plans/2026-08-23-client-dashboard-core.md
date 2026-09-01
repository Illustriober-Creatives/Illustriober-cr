# Client Dashboard Core Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the client dashboard home (`/dashboard`) onto the app-shell's brand tokens (fixing the invisible white-on-white text bug), and add self-service profile view/edit + change-password, backed by two new API endpoints.

**Architecture:** Two new API routes (`PATCH /api/users/me`, `POST /api/users/me/password`) mounted at `/api/users`, following the exact Zod-parse-in-route + `AppError` pattern already used in `apps/api/src/routes/auth.ts` — no `validateBody` middleware exists in this repo despite being mentioned in CLAUDE.md, so don't introduce it. Two new Zod schemas added to `packages/shared`. The client dashboard home page is rebuilt using the same visual vocabulary as the admin dashboard (`bg-surface`, `border-glass-border`, `text-accent`, `text-foreground`) instead of the old dark-theme classes. A new `/dashboard/profile` page is added and wired into the client nav.

**Tech Stack:** Next.js 16 (App Router, Client Components), Express + Prisma, Zod, vitest + supertest, lucide-react icons, Tailwind CSS 4 with the repo's existing design tokens.

**Spec:** `docs/superpowers/specs/2026-08-23-dashboard-platform-redesign.md` (§4.2 Client Dashboard Redesign, §4.4 New API Surface — `PATCH /api/users/me`, `POST /api/users/me/password`)

## Global Constraints

- Design tokens only: `bg-background`, `text-foreground`, `bg-surface`, `text-accent`, `bg-accent/10`, `border-glass-border`, `bg-glass-bg`. Never reintroduce `zinc-*`/`text-white`/`bg-zinc-900` — that is the exact bug this phase fixes.
- API routes parse the body with the schema's `.parse()` inside a `try { } catch (e) { if (e instanceof z.ZodError) throw new AppError(400, ...) }` block, matching `auth.ts` exactly. Do not add `validateBody` middleware — it does not exist in this codebase.
- Every new route requires `authenticate` (both new routes are self-service, no role restriction — any authenticated user of either role may call them).
- Password hashing: `bcrypt.hash(password, 12)` — matches `auth.ts`'s cost factor exactly.
- New vitest+supertest coverage for both new routes, mocking Prisma via `vi.hoisted` exactly as `auth.test.ts` does.
- No frontend test suite exists in this repo — frontend tasks are verified via `npm run build --workspace apps/web` + manual login/screenshot check, not automated tests.
- `DashboardShell`'s `<main data-app-shell>` already provides full-bleed padding-free container — page components render directly inside it with their own `p-8` (see `apps/web/src/app/admin/page.tsx` for the convention: `<div className="flex flex-col gap-6 p-8">`). Do not wrap dashboard pages in the marketing `Container`/`SectionWrapper` components — those are for marketing-chrome routes only.

---

### Task 1: Shared schemas + `/api/users` routes (profile update, change password)

**Files:**
- Modify: `packages/shared/src/index.ts`
- Create: `apps/api/src/routes/users.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/routes/auth.ts:332-352` (the `/me` handler's `select`)
- Test: `apps/api/src/routes/users.test.ts`

**Interfaces:**
- Consumes: `authenticate` middleware (`apps/api/src/middleware/authenticate.ts`, attaches `req.user: { id, role, email }`), `asyncHandler`/`AppError` (`apps/api/src/middleware/errorHandler.ts`), `prisma` default export (`apps/api/src/lib/prisma.ts`), `REFRESH_COOKIE_NAME`/`readRequestCookie` (`apps/api/src/lib/cookies.ts`).
- Produces: `updateProfileSchema`, `changePasswordSchema`, `UpdateProfileInput`, `ChangePasswordInput` exported from `@illustriober/shared` (consumed by Task 3's frontend profile page). `PATCH /api/users/me` and `POST /api/users/me/password` as documented below (consumed by Task 3).

- [ ] **Step 1: Add the two Zod schemas to the shared package**

Add to `packages/shared/src/index.ts` (append at the end of the file):

```ts
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z.string().trim().max(30, "Phone number is too long"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
```

`phone` is a required string (not optional) — the frontend form always submits the full current state (empty string if the user has no phone on file), so the route below treats `""` as "clear the phone number" and any non-empty string as "set it." This avoids ambiguous partial-PATCH semantics for a two-field form.

- [ ] **Step 2: Build the shared package**

Run: `npm run build --workspace @illustriober/shared`
Expected: builds cleanly, `packages/shared/dist/index.js` and `.d.ts` updated with the two new exports.

- [ ] **Step 3: Widen `GET /api/auth/me` to return `phone`**

In `apps/api/src/routes/auth.ts`, the `/me` handler currently selects:

```ts
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
      },
```

Add `phone: true` to that select list (alphabetical position doesn't matter, keep it readable — e.g. right after `lastName: true,`). This is additive only: existing frontend code that destructures specific keys off the `/me` response is unaffected; the profile page (Task 3) will read `phone` off this same response.

- [ ] **Step 4: Create `apps/api/src/routes/users.ts`**

```ts
/**
 * Self-service user routes: update own profile, change own password.
 */

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { changePasswordSchema, updateProfileSchema } from "@illustriober/shared";
import prisma from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import { REFRESH_COOKIE_NAME, readRequestCookie } from "../lib/cookies";

const router = Router();

// PATCH /api/users/me
// Update own firstName/lastName/phone
router.patch(
  "/me",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    let body: z.infer<typeof updateProfileSchema>;
    try {
      body = updateProfileSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const msg = e.issues.map((i) => i.message).join(", ");
        throw new AppError(400, `Validation failed: ${msg}`);
      }
      throw e;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone.length > 0 ? body.phone : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatarUrl: true,
      },
    });

    res.json({ success: true, user });
  })
);

// POST /api/users/me/password
// Change own password (requires current password). Revokes every OTHER
// active session for this user; the session making this request (identified
// by its own refresh cookie, if present) is left alone so the user isn't
// signed out of the device they're using right now.
router.post(
  "/me/password",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    let body: z.infer<typeof changePasswordSchema>;
    try {
      body = changePasswordSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const msg = e.issues.map((i) => i.message).join(", ");
        throw new AppError(400, `Validation failed: ${msg}`);
      }
      throw e;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      throw new AppError(401, "User not found");
    }

    const ok = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!ok) {
      throw new AppError(401, "Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    const currentRefreshToken = readRequestCookie(req, REFRESH_COOKIE_NAME);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      await tx.refreshToken.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
          ...(currentRefreshToken ? { token: { not: currentRefreshToken } } : {}),
        },
        data: { revokedAt: new Date() },
      });
    });

    res.json({ success: true, message: "Password updated." });
  })
);

export default router;
```

- [ ] **Step 5: Register the router in `apps/api/src/app.ts`**

Add the import near the other route imports (after `import ticketRoutes from "./routes/tickets";`):

```ts
import userRoutes from "./routes/users";
```

Add the mount after the ticket routes block (after `app.use("/api/projects/:slug/tickets", projectTicketRoutes);`):

```ts
// Self-service user endpoints: profile update, password change
app.use("/api/users", userRoutes);
```

- [ ] **Step 6: Write `apps/api/src/routes/users.test.ts`**

Follow `apps/api/src/routes/auth.test.ts`'s exact mocking pattern (`vi.hoisted`, `vi.mock("../lib/prisma", ...)`, importing `app` after the mocks are declared).

```ts
import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "../lib/jwt";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  refreshToken: {
    updateMany: vi.fn(),
  },
  $transaction: vi.fn((callback: (client: unknown) => unknown) => callback(prismaMock)),
}));

vi.mock("../lib/prisma", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

import app from "../app";

const userFixture = {
  id: "user_123",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  phone: null as string | null,
  role: "CLIENT" as const,
  avatarUrl: null,
};

function bearer(userId = userFixture.id, role: "CLIENT" | "ADMIN" = "CLIENT") {
  const token = signAccessToken({ sub: userId, role, email: userFixture.email });
  return `Bearer ${token}`;
}

describe("users routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
  });

  describe("PATCH /api/users/me", () => {
    it("rejects unauthenticated requests", async () => {
      const response = await request(app)
        .patch("/api/users/me")
        .send({ firstName: "Jane", lastName: "Doe", phone: "" });

      expect(response.status).toBe(401);
    });

    it("updates firstName, lastName, and phone", async () => {
      prismaMock.user.update.mockResolvedValueOnce({
        ...userFixture,
        firstName: "Janet",
        phone: "555-0100",
      });

      const response = await request(app)
        .patch("/api/users/me")
        .set("Authorization", bearer())
        .send({ firstName: "Janet", lastName: "Doe", phone: "555-0100" });

      expect(response.status).toBe(200);
      expect(response.body.user.firstName).toBe("Janet");
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userFixture.id },
        data: { firstName: "Janet", lastName: "Doe", phone: "555-0100" },
        select: expect.any(Object),
      });
    });

    it("clears phone to null when given an empty string", async () => {
      prismaMock.user.update.mockResolvedValueOnce({ ...userFixture, phone: null });

      await request(app)
        .patch("/api/users/me")
        .set("Authorization", bearer())
        .send({ firstName: "Jane", lastName: "Doe", phone: "" });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ phone: null }) })
      );
    });

    it("rejects an empty firstName", async () => {
      const response = await request(app)
        .patch("/api/users/me")
        .set("Authorization", bearer())
        .send({ firstName: "", lastName: "Doe", phone: "" });

      expect(response.status).toBe(400);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/users/me/password", () => {
    it("rejects unauthenticated requests", async () => {
      const response = await request(app)
        .post("/api/users/me/password")
        .send({ currentPassword: "old-pass-1", newPassword: "new-password-1" });

      expect(response.status).toBe(401);
    });

    it("rejects an incorrect current password", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...userFixture,
        passwordHash: await bcrypt.hash("correct-password", 12),
      });

      const response = await request(app)
        .post("/api/users/me/password")
        .set("Authorization", bearer())
        .send({ currentPassword: "wrong-password", newPassword: "new-password-1" });

      expect(response.status).toBe(401);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("updates the password and revokes other sessions when current password is correct", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...userFixture,
        passwordHash: await bcrypt.hash("correct-password", 12),
      });
      prismaMock.user.update.mockResolvedValueOnce({ ...userFixture });

      const response = await request(app)
        .post("/api/users/me/password")
        .set("Authorization", bearer())
        .send({ currentPassword: "correct-password", newPassword: "new-password-1" });

      expect(response.status).toBe(200);
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledTimes(1);
    });

    it("rejects a new password shorter than 8 characters", async () => {
      const response = await request(app)
        .post("/api/users/me/password")
        .set("Authorization", bearer())
        .send({ currentPassword: "correct-password", newPassword: "short" });

      expect(response.status).toBe(400);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 7: Run the new tests**

Run: `npm run test --workspace apps/api -- users.test.ts`
Expected: all tests pass.

- [ ] **Step 8: Run the full API test suite to confirm no regressions**

Run: `npm run test --workspace apps/api`
Expected: all existing tests still pass (the `/me` select widening and new router are additive).

- [ ] **Step 9: Commit**

```bash
git add packages/shared/src/index.ts apps/api/src/routes/users.ts apps/api/src/routes/users.test.ts apps/api/src/routes/auth.ts apps/api/src/app.ts
git commit -m "feat: add self-service profile update and change-password endpoints"
```

---

### Task 2: Redesign the client dashboard home (`/dashboard`)

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `useAuth()` (`user: AuthUser | null`, `fetchWithAuth`) from `apps/web/src/contexts/AuthContext.tsx`; `GET /api/projects` (returns `{ success, projects: Array<{ id, name, slug, status, createdAt }> }`, already scoped to the caller by the API); `GET /api/tickets` (returns `{ success, tickets: Array<{ id, status, ... }> }`, already scoped to the caller by the API).
- Produces: nothing consumed by a later task — this is a leaf page.

- [ ] **Step 1: Replace `apps/web/src/app/dashboard/page.tsx` entirely**

The old version wraps content in the marketing `Container`/`SectionWrapper`/`Button` components and uses hardcoded dark-theme classes (`text-white` on a cream background — the invisible-text bug). The new version renders directly inside `DashboardShell`'s `<main>` using the same on-brand tokens as the admin dashboard.

"Active projects" = projects whose `status` is not `COMPLETE` or `CANCELLED`. "Open tickets" = tickets whose `status` is not `RESOLVED`, `CLOSED`, or `REJECTED`. Both counts are derived client-side from the same list responses already used to render the project list — no new endpoints needed for this page.

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FolderKanban, Ticket as TicketIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
}

interface TicketSummary {
  id: string;
  status: string;
}

const INACTIVE_PROJECT_STATUSES = new Set(["COMPLETE", "CANCELLED"]);
const CLOSED_TICKET_STATUSES = new Set(["RESOLVED", "CLOSED", "REJECTED"]);

export default function DashboardPage() {
  const { user, fetchWithAuth } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      try {
        const [projectsRes, ticketsRes] = await Promise.all([
          fetchWithAuth("/api/projects"),
          fetchWithAuth("/api/tickets"),
        ]);

        if (!cancelled && projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(data.projects);
        }
        if (!cancelled && ticketsRes.ok) {
          const data = await ticketsRes.json();
          setTickets(data.tickets);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, fetchWithAuth]);

  if (!user) {
    return null;
  }

  const activeProjectCount = projects.filter(
    (project) => !INACTIVE_PROJECT_STATUSES.has(project.status)
  ).length;
  const openTicketCount = tickets.filter(
    (ticket) => !CLOSED_TICKET_STATUSES.has(ticket.status)
  ).length;

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Welcome, {user.firstName}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/60">
          Track your projects and support tickets in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-glass-border bg-surface px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/40">
            <FolderKanban className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Active Projects
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {loading ? "–" : activeProjectCount}
          </p>
        </div>
        <div className="rounded-xl border border-glass-border bg-surface px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/40">
            <TicketIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Open Tickets
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {loading ? "–" : openTicketCount}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Your Projects</h2>
        {loading ? (
          <p className="text-foreground/50">Loading your projects...</p>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
            <p className="text-foreground/50">No active projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.slug}`}
                className="group flex items-center justify-between rounded-xl border border-glass-border bg-surface p-6 transition-colors hover:border-accent/40"
              >
                <div>
                  <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-foreground/40">
                    {project.status.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  View →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/40">
          Recent Activity
        </h2>
        <p className="mt-2 text-sm text-foreground/60">
          Project updates from your team will appear here as they happen.
        </p>
      </div>
    </div>
  );
}
```

The "Recent Activity" panel is deliberately a static placeholder in this task — the real update feed (project Messages) is Phase 3 scope (`§4.2` project detail page). This copy is honest about that rather than fabricating fake activity data.

- [ ] **Step 2: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "fix: redesign client dashboard home onto brand tokens, fixing invisible white-on-white text"
```

---

### Task 3: Client profile page (`/dashboard/profile`)

**Files:**
- Create: `apps/web/src/app/dashboard/profile/page.tsx`
- Modify: `apps/web/src/app/dashboard/DashboardLayoutClient.tsx`

**Interfaces:**
- Consumes: `useAuth()` (`user`, `fetchWithAuth`, `refreshSession`) from `apps/web/src/contexts/AuthContext.tsx`; `GET /api/auth/me` (now returns `phone`, from Task 1 Step 3); `PATCH /api/users/me` and `POST /api/users/me/password` (from Task 1).
- Produces: nothing consumed by a later task — this is a leaf page. Adds a `Profile` entry to `CLIENT_NAV` in `DashboardLayoutClient.tsx`.

- [ ] **Step 1: Add the nav entry in `apps/web/src/app/dashboard/DashboardLayoutClient.tsx`**

Change the imports and `CLIENT_NAV` array:

```tsx
import { LayoutDashboard, Ticket, User } from "lucide-react";
```

```tsx
const CLIENT_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tickets", label: "Support Tickets", icon: Ticket },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];
```

- [ ] **Step 2: Create `apps/web/src/app/dashboard/profile/page.tsx`**

```tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface MeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
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

export default function ClientProfilePage() {
  const { user, fetchWithAuth, refreshSession } = useAuth();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetchWithAuth("/api/auth/me");
        if (!res.ok) return;
        const data = (await res.json()) as MeResponse;
        if (cancelled) return;
        setEmail(data.user.email);
        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setPhone(data.user.phone ?? "");
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, fetchWithAuth]);

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

      await refreshSession();
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
        {profileLoading ? (
          <p className="mt-4 text-sm text-foreground/50">Loading...</p>
        ) : (
          <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => void handleProfileSubmit(e)}>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                Email
              </label>
              <input
                type="email"
                value={email}
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
        )}
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

- [ ] **Step 3: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/dashboard/profile/page.tsx apps/web/src/app/dashboard/DashboardLayoutClient.tsx
git commit -m "feat: add client self-service profile page (edit details, change password)"
```
