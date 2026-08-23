# Admin User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins a way to see all users (both roles), view a user's detail (their projects/tickets, activity), deactivate/reactivate an account, and trigger a password-reset email on a user's behalf — the "user management" and "password reset" asks from the original overnight request.

**Architecture:** Four new routes added to the existing `apps/api/src/routes/admin.ts` (already the home of every other `/api/admin/*` route): `GET /users` (list, filterable by role/search — a superset of the existing `GET /clients`, which stays as-is since other code may depend on it), `GET /users/:id` (detail + their `projects`/`tickets`), `PATCH /users/:id` (toggle `isActive`, with a self-deactivation guard), `POST /users/:id/reset-password` (issues a password-reset token and email, mirroring — not sharing code with — `POST /api/auth/forgot-password`'s token-issuing logic; see the Global Constraints section for why this is a deliberate duplication, not an oversight). Frontend: a new `/admin/users` list page and `/admin/users/[id]` detail page, plus a "Users" nav entry inserted before "Profile" (per Phase 4's whole-plan review recommendation).

**Tech Stack:** Express + Prisma, Zod, vitest + supertest, Next.js 16 (App Router, Client Components), lucide-react icons, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-08-23-dashboard-platform-redesign.md` (§4.3 Admin Dashboard Redesign — `/admin/users`; §4.4 New API Surface — `GET /api/admin/users`, `GET /api/admin/users/:id`, `PATCH /api/admin/users/:id`, `POST /api/admin/users/:id/reset-password`)

## Global Constraints

- Design tokens only: `bg-background`, `text-foreground`, `bg-surface`, `text-accent`, `border-glass-border`, `bg-glass-bg`. Never use `text-accent-foreground` — it is an **undefined CSS variable** in this codebase (confirmed: it appears in `apps/web/src/app/admin/projects/page.tsx` but resolves to no color; do not copy that pattern into new code). For button text on an accent background, use `text-foreground` (the pattern used everywhere else in the redesigned dashboard, e.g. `apps/web/src/components/dashboard/DashboardSidebar.tsx`'s logo mark, every "Save"/"New X" button built in Phases 2-4).
- Contrast floor for new text: use `/60` or higher opacity (`text-foreground/60`, `/70`) for any text a user needs to actually read (labels, body copy, list-row metadata). Reserve `/40`/`/50` only for the same kind of genuinely decorative micro-text the rest of the app already uses it for (e.g. a bare timestamp next to other, higher-contrast text). Phases 3 and 4's whole-plan reviews both found real WCAG AA failures from `-400`-shade/`/40`-opacity text on this app's light-only surfaces — don't add a third instance.
- API route style in `admin.ts`: uses `asyncHandler` + `throw new AppError(status, message)` (NOT the inline `res.status().json()` style used in `projects.ts`) — match this file's own convention, which is the `AppError` style, consistently used by every existing route in `admin.ts`.
- Every new admin route uses the file's existing `...adminOnly` spread (`const adminOnly = [authenticate, requireRoles("ADMIN")];`, already defined at the top of `admin.ts`) — do not redefine it.
- **Deliberate non-DRY decision:** `POST /api/admin/users/:id/reset-password` duplicates (does not import/share) the token-issuing logic already in `apps/api/src/routes/auth.ts`'s `POST /forgot-password` handler. The two are similar in shape but not identical in behavior: `forgot-password` is a public, unauthenticated, anti-enumeration endpoint (returns the same generic success message whether or not the account exists, to avoid leaking which emails have accounts) — the admin route is authenticated, admin-triggered, and correctly returns a 404 if the user doesn't exist (an admin already knows the user they're acting on). Extracting a shared helper would need a parameter to toggle the anti-enumeration behavior, which is more complexity than the ~15 lines of duplication it would save, and `auth.ts`'s `forgot-password` is a public, security-sensitive endpoint not worth touching for a marginal DRY win tonight. Duplicate the logic; do not refactor `auth.ts`.
- New vitest+supertest coverage for all 4 routes, extending the existing `apps/api/src/routes/admin.test.ts` file (not a new file), matching its exact `prismaMock`/`vi.hoisted`/`adminToken()`/`clientToken()` conventions.
- No frontend test suite exists in this repo — frontend tasks are verified via `npm run build --workspace apps/web` succeeding with no TypeScript errors.
- `DashboardShell`'s `<main data-app-shell>` provides the full-bleed container — pages render directly inside it with their own `p-8`. No `Container`/`SectionWrapper`/`Button` marketing-component imports.

---

### Task 1: `admin.ts` user-management routes + tests

**Files:**
- Modify: `apps/api/src/routes/admin.ts`
- Modify: `apps/api/src/routes/admin.test.ts`

**Interfaces:**
- Consumes: `prisma.user.findMany/findUnique/update`, `prisma.passwordResetToken.updateMany/create/update` (Prisma models, see `apps/api/prisma/schema.prisma`), `sendPasswordResetEmail` from `apps/api/src/lib/email.ts` (signature: `(params: { to: string; resetUrl: string }) => Promise<{ success: boolean; error?: string }>`).
- Produces: `GET /api/admin/users`, `GET /api/admin/users/:id`, `PATCH /api/admin/users/:id`, `POST /api/admin/users/:id/reset-password` — response shapes documented in each step below. Consumed by Task 2 (list) and Task 3 (detail).

- [ ] **Step 1: Add imports to `apps/api/src/routes/admin.ts`**

The file currently imports `randomBytes` from `"crypto"` — add `createHash` to that same import, and add `sendPasswordResetEmail` to the existing `sendInviteEmail` import from `"../lib/email"`:

```ts
import { randomBytes, createHash } from "crypto";
```

```ts
import { sendInviteEmail, sendPasswordResetEmail } from "../lib/email";
```

- [ ] **Step 2: Add the 4 new routes**

Insert these after the existing `GET /clients` route (right before `GET /projects`):

```ts
const userRoleFilterSchema = z.enum(["CLIENT", "ADMIN"]).optional();

// GET /api/admin/users?role=CLIENT&search=jane
router.get(
  "/users",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const role = userRoleFilterSchema.parse(req.query.role || undefined);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, users });
  })
);

// GET /api/admin/users/:id
router.get(
  "/users/:id",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        projects: {
          select: { id: true, name: true, slug: true, status: true },
          orderBy: { createdAt: "desc" },
        },
        tickets: {
          select: { id: true, title: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) throw new AppError(404, "User not found");

    res.json({ success: true, user });
  })
);

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

// PATCH /api/admin/users/:id
// Toggle isActive. An admin cannot deactivate their own account.
router.patch(
  "/users/:id",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const body = updateUserStatusSchema.parse(req.body);

    if (req.params.id === req.user!.id && !body.isActive) {
      throw new AppError(400, "You cannot deactivate your own account");
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: body.isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ success: true, user });
  })
);

// POST /api/admin/users/:id/reset-password
// Sends a password-reset email to the given user via the existing token flow.
router.post(
  "/users/:id/reset-password",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError(404, "User not found");
    if (!user.isActive) throw new AppError(400, "Cannot reset password for a deactivated user");

    const rawToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        tokenHash: createHash("sha256").update(rawToken).digest("hex"),
        userId: user.id,
        expiresAt,
      },
    });

    const appUrl = (process.env.APP_URL || process.env.CORS_ORIGIN?.split(",")[0] || "http://localhost:3000")
      .trim()
      .replace(/\/$/, "");

    const delivery = await sendPasswordResetEmail({
      to: user.email,
      resetUrl: `${appUrl}/reset-password?token=${rawToken}`,
    });

    if (!delivery.success) {
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });
      throw new AppError(502, "Failed to send the reset email. Please try again.");
    }

    res.json({ success: true, message: `Password reset link sent to ${user.email}.` });
  })
);
```

- [ ] **Step 3: Extend the Prisma mock in `apps/api/src/routes/admin.test.ts`**

The current `prismaMock` has `user: { findUnique: vi.fn() }`. Widen it, and add `passwordResetToken`:

```ts
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  enquiry: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  inviteToken: { create: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
  ticket: { groupBy: vi.fn(), findMany: vi.fn() },
  comment: { findMany: vi.fn() },
  passwordResetToken: { updateMany: vi.fn(), create: vi.fn(), update: vi.fn() },
}));
```

Add `sendPasswordResetEmail` to the existing email mock:

```ts
vi.mock("../lib/email", () => ({
  sendInviteEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
}));
```

- [ ] **Step 4: Add a new `describe` block for the 4 routes**

Append this as a new top-level `describe` block, after the existing `describe("admin enquiry routes", ...)` block closes:

```ts
describe("admin user management routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
    prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.passwordResetToken.create.mockResolvedValue({ id: "reset_1" });
    prismaMock.passwordResetToken.update.mockResolvedValue({ id: "reset_1" });
  });

  const userFixture = {
    id: "user_1",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    phone: null,
    role: "CLIENT" as const,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    projects: [],
    tickets: [],
  };

  describe("GET /api/admin/users", () => {
    it("returns all users for admin", async () => {
      prismaMock.user.findMany.mockResolvedValue([userFixture]);

      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(1);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });

    it("filters by role", async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/admin/users?role=ADMIN")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: "ADMIN" } })
      );
    });

    it("returns 403 for client role", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${clientToken()}`);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/users/:id", () => {
    it("returns user detail for admin", async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture);

      const res = await request(app)
        .get("/api/admin/users/user_1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe("user_1");
    });

    it("returns 404 for unknown user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/admin/users/does-not-exist")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/admin/users/:id", () => {
    it("toggles isActive", async () => {
      prismaMock.user.update.mockResolvedValue({ ...userFixture, isActive: false });

      const res = await request(app)
        .patch("/api/admin/users/user_1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.user.isActive).toBe(false);
    });

    it("rejects an admin deactivating their own account", async () => {
      const res = await request(app)
        .patch("/api/admin/users/admin_1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("allows an admin to reactivate their own account", async () => {
      prismaMock.user.update.mockResolvedValue({ ...userFixture, id: "admin_1", isActive: true });

      const res = await request(app)
        .patch("/api/admin/users/admin_1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ isActive: true });

      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/admin/users/:id/reset-password", () => {
    it("issues a reset token and sends the email", async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture);

      const res = await request(app)
        .post("/api/admin/users/user_1/reset-password")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(prismaMock.passwordResetToken.create).toHaveBeenCalledTimes(1);
    });

    it("returns 404 for unknown user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/admin/users/does-not-exist/reset-password")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
      expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it("rejects resetting a deactivated user's password", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...userFixture, isActive: false });

      const res = await request(app)
        .post("/api/admin/users/user_1/reset-password")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(400);
      expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 5: Run the tests**

Run: `npm run test --workspace apps/api -- admin.test.ts`
Expected: all tests pass, including the new ones.

- [ ] **Step 6: Run the full API test suite**

Run: `npm run test --workspace apps/api`
Expected: all tests still pass.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/routes/admin.ts apps/api/src/routes/admin.test.ts
git commit -m "feat: add admin user-management routes (list, detail, toggle active, reset password)"
```

---

### Task 2: `/admin/users` list page + nav entry

**Files:**
- Create: `apps/web/src/app/admin/users/page.tsx`
- Modify: `apps/web/src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/users` (Task 1) — response `{ success, users: Array<{ id, email, firstName, lastName, role, isActive, lastLoginAt, createdAt }> }`.
- Produces: nothing consumed by a later task (Task 3 is a separate route, not imported from this file).

- [ ] **Step 1: Add the "Users" nav entry to `apps/web/src/app/admin/layout.tsx`**

Current `ADMIN_NAV` (after Phase 4):

```tsx
const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/profile", label: "Profile", icon: User },
];
```

Add `Users` to the `lucide-react` import and insert the new entry **before** "Profile" (per Phase 4's whole-plan review recommendation — Profile should stay the trailing item):

```tsx
import { LayoutDashboard, Mail, FolderKanban, Ticket, Users, User } from "lucide-react";
```

```tsx
const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/profile", label: "Profile", icon: User },
];
```

Note: `Users` (plural, the nav label and the icon component) and `User` (singular, the existing Profile icon) are two distinct `lucide-react` exports — do not confuse them.

- [ ] **Step 2: Create `apps/web/src/app/admin/users/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CLIENT" | "ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_FILTERS = [
  { value: "", label: "All" },
  { value: "CLIENT", label: "Clients" },
  { value: "ADMIN", label: "Admins" },
] as const;

export default function AdminUsersPage() {
  const { fetchWithAuth } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (role) params.set("role", role);
        if (search.trim()) params.set("search", search.trim());
        const qs = params.toString();

        const res = await fetchWithAuth(`/api/admin/users${qs ? `?${qs}` : ""}`);
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setUsers(data.users);
            setError(false);
          } else {
            setError(true);
          }
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timeout = setTimeout(() => void load(), search ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [role, search, fetchWithAuth]);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Admin</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">Users</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-full border border-glass-border bg-surface py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-foreground/40"
          />
        </div>
        <div className="flex gap-1.5">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setRole(filter.value)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                role === filter.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-glass-border text-foreground/60 hover:bg-glass-bg"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-foreground/60">Loading users...</p>
      ) : error ? (
        <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-foreground/60">Couldn&apos;t load users. Refresh to try again.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-foreground/60">No users match this filter.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="group flex flex-col justify-between gap-3 rounded-xl border border-glass-border bg-surface p-5 transition-colors hover:border-accent/40 sm:flex-row sm:items-center"
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="rounded-full bg-glass-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                    {user.role}
                  </span>
                  {!user.isActive && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                      Deactivated
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/60">{user.email}</p>
              </div>
              <div className="text-xs text-foreground/50">
                {user.lastLoginAt
                  ? `Last login ${new Date(user.lastLoginAt).toLocaleDateString()}`
                  : "Never logged in"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

The 300ms debounce on `search` (but not on `role`, which fetches immediately) avoids firing a request on every keystroke while keeping filter-button clicks instant.

- [ ] **Step 3: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors, `/admin/users` in the route list.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/admin/users/page.tsx apps/web/src/app/admin/layout.tsx
git commit -m "feat: add admin users list page with role filter and search"
```

---

### Task 3: `/admin/users/[id]` detail page

**Files:**
- Create: `apps/web/src/app/admin/users/[id]/page.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/users/:id`, `PATCH /api/admin/users/:id`, `POST /api/admin/users/:id/reset-password` (all Task 1). `ticketStatusBadgeClass` from `apps/web/src/lib/ticketBadgeStyles.ts` (built in Phase 3, reviewed clean).
- Produces: nothing consumed by a later task — leaf page.

- [ ] **Step 1: Create `apps/web/src/app/admin/users/[id]/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, ShieldCheck, ShieldOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ticketStatusBadgeClass } from "@/lib/ticketBadgeStyles";

interface UserProject {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface UserTicket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "CLIENT" | "ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  projects: UserProject[];
  tickets: UserTicket[];
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [resetSending, setResetSending] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchWithAuth(`/api/admin/users/${id}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setError(res.status === 404 ? "User not found." : "Failed to load user.");
        }
      } catch {
        if (!cancelled) setError("Failed to load user.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, fetchWithAuth]);

  const handleToggleActive = async () => {
    if (!user) return;
    setStatusSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetchWithAuth(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) {
        setStatusMessage(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setUser((current) => (current ? { ...current, isActive: data.user.isActive } : current));
      setStatusMessage(data.user.isActive ? "Account reactivated." : "Account deactivated.");
    } catch {
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSendReset = async () => {
    setResetSending(true);
    setResetMessage(null);
    setResetError(null);
    try {
      const res = await fetchWithAuth(`/api/admin/users/${id}/reset-password`, {
        method: "POST",
      });
      if (!res.ok) {
        setResetError(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setResetMessage(data.message ?? "Reset link sent.");
    } catch {
      setResetError("Something went wrong. Please try again.");
    } finally {
      setResetSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-foreground/60">Loading user...</div>;
  }

  if (error || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
        <p className="text-foreground/60">{error ?? "User not found."}</p>
        <Link
          href="/admin/users"
          className="rounded-full border border-glass-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <Link
        href="/admin/users"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Users
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {user.firstName} {user.lastName}
            </h1>
            <span className="rounded-full bg-glass-bg px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-foreground/60">
              {user.role}
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-foreground/60">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {user.email}
          </p>
          {user.phone && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground/60">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {user.phone}
            </p>
          )}
        </div>
        <span
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            user.isActive
              ? "border-glass-border text-foreground/70"
              : "border-red-500/20 bg-red-500/10 text-red-700"
          }`}
        >
          {user.isActive ? "Active" : "Deactivated"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-glass-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground/60">Account</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">Joined</p>
                <p className="mt-0.5 text-foreground/80">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">Last Login</p>
                <p className="mt-0.5 text-foreground/80">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-glass-border pt-4">
              <button
                type="button"
                onClick={() => void handleToggleActive()}
                disabled={statusSaving}
                className="flex items-center justify-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg disabled:opacity-50"
              >
                {user.isActive ? (
                  <ShieldOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {statusSaving ? "Saving..." : user.isActive ? "Deactivate Account" : "Reactivate Account"}
              </button>
              {statusMessage && <p className="text-xs text-foreground/60">{statusMessage}</p>}

              <button
                type="button"
                onClick={() => void handleSendReset()}
                disabled={resetSending || !user.isActive}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {resetSending ? "Sending..." : "Send Password Reset"}
              </button>
              {resetMessage && <p className="text-xs text-accent">{resetMessage}</p>}
              {resetError && <p className="text-xs text-red-600">{resetError}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-glass-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground/60">
              Projects {user.projects.length > 0 && `(${user.projects.length})`}
            </h2>
            {user.projects.length === 0 ? (
              <p className="text-sm text-foreground/60">No projects.</p>
            ) : (
              <div className="space-y-2">
                {user.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.slug}`}
                    className="flex items-center justify-between rounded-lg border border-glass-border px-4 py-3 text-sm transition-colors hover:bg-glass-bg"
                  >
                    <span className="font-medium text-foreground">{project.name}</span>
                    <span className="text-xs text-foreground/50">{project.status.replace(/_/g, " ")}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-glass-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground/60">
              Recent Tickets {user.tickets.length > 0 && `(${user.tickets.length})`}
            </h2>
            {user.tickets.length === 0 ? (
              <p className="text-sm text-foreground/60">No tickets.</p>
            ) : (
              <div className="space-y-2">
                {user.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-lg border border-glass-border px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-foreground">{ticket.title}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ticketStatusBadgeClass(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

`/admin/projects/${project.slug}` is an existing route (`apps/web/src/app/admin/projects/page.tsx` lists projects; individual admin project *detail* pages don't exist yet — that's Phase 6). This link will 404 until Phase 6 ships `/admin/projects/[slug]`. This is a forward reference the plan accepts deliberately: linking to a not-yet-built page for content that will exist by the time this ships in full is consistent with how earlier phases handled sequencing (e.g. the client dashboard linked to `/dashboard/tickets/new` before that page existed, in the same original codebase). Do not build a placeholder or stub page for `/admin/projects/[slug]` in this task — that is explicitly Phase 6's scope.

`router` is imported but intentionally unused in earlier drafts of pages like this — it is NOT imported here since nothing in this page needs client-side navigation beyond `<Link>`. Do not add an unused `useRouter()` import.

- [ ] **Step 2: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors, `/admin/users/[id]` in the route list.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/src/app/admin/users/[id]/page.tsx"
git commit -m "feat: add admin user detail page (deactivate/reactivate, password reset, projects/tickets)"
```
