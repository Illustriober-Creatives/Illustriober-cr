# Admin Project Detail + Milestones/Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins a project detail page (`/admin/projects/[slug]`) where they can manage a project's milestones (add one, change a milestone's status) and post a broadcast "project update" that clients see on their own already-built (Phase 3) Updates feed — the write side of a feed that has been read-only since Phase 3.

**Architecture:** Three new admin-only API routes: `POST /api/admin/projects/:slug/milestones` (create), `PATCH /api/admin/milestones/:id` (update status/fields), `POST /api/admin/projects/:slug/updates` (creates a broadcast `Message` — `receiverId: null` — plus a `Notification` for the project's client). All three live in the existing `apps/api/src/routes/admin.ts`. One small additive change to the existing `GET /api/projects/:slug` route (`apps/api/src/routes/projects.ts`, built pre-redesign, already serves both roles) — adds the client's name/email to its response so the admin page can show whose project it is; this is the only change to already-shipped code in this plan, and it's purely additive (a wider `include`, no behavior change for the existing client-side consumer). One new frontend page, `/admin/projects/[slug]/page.tsx`, reusing `GET /api/projects/:slug`, `GET /api/projects/:slug/tickets`, and `GET /api/projects/:slug/updates` — all three already built and reviewed clean in earlier phases — for its reads, and the three new routes above for its writes.

**Tech Stack:** Express + Prisma, Zod, vitest + supertest, Next.js 16 (App Router, Client Components), lucide-react icons, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-08-23-dashboard-platform-redesign.md` (§4.3 Admin Dashboard Redesign — admin project detail page; §4.4 New API Surface — milestone CRUD, project updates)

## Global Constraints

- Design tokens only: `bg-background`, `text-foreground`, `bg-surface`, `text-accent`, `border-glass-border`, `bg-glass-bg`. Never `text-accent-foreground` (undefined CSS variable, a pre-existing bug elsewhere in this codebase — don't propagate it). Contrast floor for readable text: `/60`+.
- API route style in `admin.ts`: `asyncHandler` + `throw new AppError(status, message)`. Every new route uses the file's existing `...adminOnly` spread.
- **Explicitly deferred, do not build this phase:** a client-facing notification list/bell UI, or `GET /api/notifications` / `PATCH /api/notifications/:id/read`. The design spec's own Scope Decisions table already defers "real-time notifications via Socket.IO" as a follow-up; this plan goes one step further and defers the notification-*reading* API and UI entirely, not just the real-time wiring — this phase only *creates* a `Notification` row as a side effect of posting a project update, matching the schema's stated intent, without building anything that reads it back yet. That's consistent with how Phase 3 built the read side of the Updates feed months (in-session, hours) before this phase builds its write side — features can land read-then-write or write-then-read across phases; this one is deliberately write-only for now.
- The new update-posting route does not need to `include` the `sender` relation on the created `Message` — the frontend already knows who's posting (the logged-in admin, via `useAuth()`) and can construct the display data locally without an extra Prisma join.
- No frontend test suite exists in this repo — frontend tasks are verified via `npm run build --workspace apps/web` succeeding with no TypeScript errors.
- `DashboardShell`'s `<main data-app-shell>` provides the full-bleed container — pages render directly inside it with their own `p-8`.

---

### Task 1: Milestone CRUD + project-update routes, plus widening `GET /api/projects/:slug`

**Files:**
- Modify: `apps/api/src/routes/admin.ts`
- Modify: `apps/api/src/routes/admin.test.ts`
- Modify: `apps/api/src/routes/projects.ts`

**Interfaces:**
- Consumes: `prisma.milestone.create/findUnique/update`, `prisma.message.create`, `prisma.notification.create`, `prisma.project.findUnique` (all Prisma models — see `apps/api/prisma/schema.prisma`'s `Milestone`, `Message`, `Notification`, `Project` models).
- Produces: `POST /api/admin/projects/:slug/milestones`, `PATCH /api/admin/milestones/:id`, `POST /api/admin/projects/:slug/updates` — response shapes documented in each step. `GET /api/projects/:slug` now additionally returns `project.client: { firstName, lastName, email }`. Consumed by Task 2.

- [ ] **Step 1: Add the milestone and project-update routes to `apps/api/src/routes/admin.ts`**

Insert these after the existing `POST /projects` route (right before `GET /dashboard`):

```ts
const createMilestoneSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  order: z.number().int().min(0),
  dueDate: z.string().datetime().optional(),
});

// POST /api/admin/projects/:slug/milestones
router.post(
  "/projects/:slug/milestones",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) throw new AppError(404, "Project not found");

    const body = createMilestoneSchema.parse(req.body);

    const milestone = await prisma.milestone.create({
      data: {
        projectId: project.id,
        title: body.title,
        description: body.description,
        order: body.order,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });

    res.status(201).json({ success: true, milestone });
  })
);

const updateMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETE"]).optional(),
  order: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

// PATCH /api/admin/milestones/:id
router.patch(
  "/milestones/:id",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const body = updateMilestoneSchema.parse(req.body);

    const existing = await prisma.milestone.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Milestone not found");

    const milestone = await prisma.milestone.update({
      where: { id: req.params.id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.order !== undefined ? { order: body.order } : {}),
        ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
        ...(body.status !== undefined
          ? { status: body.status, completedAt: body.status === "COMPLETE" ? new Date() : null }
          : {}),
      },
    });

    res.json({ success: true, milestone });
  })
);

const postProjectUpdateSchema = z.object({
  content: z.string().trim().min(1, "Update content is required").max(4000),
});

// POST /api/admin/projects/:slug/updates
// Posts a broadcast update (Message, receiverId: null) and notifies the client.
router.post(
  "/projects/:slug/updates",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) throw new AppError(404, "Project not found");

    const body = postProjectUpdateSchema.parse(req.body);

    const message = await prisma.message.create({
      data: {
        projectId: project.id,
        senderId: req.user!.id,
        receiverId: null,
        content: body.content,
      },
    });

    await prisma.notification.create({
      data: {
        userId: project.clientId,
        title: `New update on ${project.name}`,
        body: body.content.length > 140 ? `${body.content.slice(0, 137)}...` : body.content,
        link: `/dashboard/projects/${project.slug}`,
      },
    });

    res.status(201).json({ success: true, update: message });
  })
);
```

- [ ] **Step 2: Widen `GET /api/projects/:slug` in `apps/api/src/routes/projects.ts`**

Current `include`:

```ts
      include: {
        milestones: { orderBy: { order: "asc" } },
        tickets: { orderBy: { createdAt: "desc" }, take: 5 }
      }
```

Change to:

```ts
      include: {
        client: { select: { firstName: true, lastName: true, email: true } },
        milestones: { orderBy: { order: "asc" } },
        tickets: { orderBy: { createdAt: "desc" }, take: 5 }
      }
```

This is purely additive — the existing client-side project detail page (`apps/web/src/app/dashboard/projects/[slug]/page.tsx`) doesn't declare a `client` field on its `Project` interface and simply won't read the new field; nothing about its behavior changes. Do not modify anything else in this file.

- [ ] **Step 3: Extend the Prisma mock in `apps/api/src/routes/admin.test.ts`**

Add `milestone` and `message` to the existing `prismaMock`:

```ts
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  enquiry: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  inviteToken: { create: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
  ticket: { groupBy: vi.fn(), findMany: vi.fn() },
  comment: { findMany: vi.fn() },
  passwordResetToken: { updateMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  milestone: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  message: { create: vi.fn() },
  notification: { create: vi.fn() },
  project: { findUnique: vi.fn() },
  $transaction: vi.fn((callback: (client: unknown) => unknown) => callback(prismaMock)),
}));
```

Note this file's `prismaMock` did not previously have a top-level `project` mock (project routes are tested in `projects.test.ts`, which has its own separate mock) — add it here since `admin.ts`'s new routes call `prisma.project.findUnique` directly.

- [ ] **Step 4: Add a new `describe` block**

Append this as a new top-level `describe` block, after the `describe("admin user management routes", ...)` block closes:

```ts
describe("admin project management routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
  });

  const projectFixture = {
    id: "proj_1",
    slug: "my-project",
    name: "My Project",
    clientId: "client_1",
  };

  describe("POST /api/admin/projects/:slug/milestones", () => {
    it("creates a milestone for an existing project", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);
      prismaMock.milestone.create.mockResolvedValue({
        id: "ms_1",
        projectId: "proj_1",
        title: "Design phase",
        order: 0,
        status: "PENDING",
      });

      const res = await request(app)
        .post("/api/admin/projects/my-project/milestones")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ title: "Design phase", order: 0 });

      expect(res.status).toBe(201);
      expect(res.body.milestone.title).toBe("Design phase");
      expect(prismaMock.milestone.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ projectId: "proj_1", title: "Design phase" }) })
      );
    });

    it("returns 404 for an unknown project slug", async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/admin/projects/does-not-exist/milestones")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ title: "Design phase", order: 0 });

      expect(res.status).toBe(404);
      expect(prismaMock.milestone.create).not.toHaveBeenCalled();
    });

    it("rejects a missing title", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);

      const res = await request(app)
        .post("/api/admin/projects/my-project/milestones")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ order: 0 });

      expect(res.status).toBe(400);
      expect(prismaMock.milestone.create).not.toHaveBeenCalled();
    });

    it("returns 403 for client role", async () => {
      const res = await request(app)
        .post("/api/admin/projects/my-project/milestones")
        .set("Authorization", `Bearer ${clientToken()}`)
        .send({ title: "Design phase", order: 0 });

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/admin/milestones/:id", () => {
    it("updates a milestone's status and stamps completedAt when marked COMPLETE", async () => {
      prismaMock.milestone.findUnique.mockResolvedValue({ id: "ms_1", status: "IN_PROGRESS" });
      prismaMock.milestone.update.mockResolvedValue({ id: "ms_1", status: "COMPLETE" });

      const res = await request(app)
        .patch("/api/admin/milestones/ms_1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ status: "COMPLETE" });

      expect(res.status).toBe(200);
      expect(prismaMock.milestone.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "COMPLETE", completedAt: expect.any(Date) }),
        })
      );
    });

    it("clears completedAt when status moves away from COMPLETE", async () => {
      prismaMock.milestone.findUnique.mockResolvedValue({ id: "ms_1", status: "COMPLETE" });
      prismaMock.milestone.update.mockResolvedValue({ id: "ms_1", status: "IN_PROGRESS" });

      await request(app)
        .patch("/api/admin/milestones/ms_1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ status: "IN_PROGRESS" });

      expect(prismaMock.milestone.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "IN_PROGRESS", completedAt: null }),
        })
      );
    });

    it("returns 404 for an unknown milestone", async () => {
      prismaMock.milestone.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .patch("/api/admin/milestones/does-not-exist")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ status: "COMPLETE" });

      expect(res.status).toBe(404);
      expect(prismaMock.milestone.update).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/projects/:slug/updates", () => {
    it("creates a broadcast message and a notification for the client", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);
      prismaMock.message.create.mockResolvedValue({
        id: "msg_1",
        projectId: "proj_1",
        senderId: "admin_1",
        receiverId: null,
        content: "Kicked off the design phase.",
      });
      prismaMock.notification.create.mockResolvedValue({ id: "notif_1" });

      const res = await request(app)
        .post("/api/admin/projects/my-project/updates")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ content: "Kicked off the design phase." });

      expect(res.status).toBe(201);
      expect(prismaMock.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ projectId: "proj_1", senderId: "admin_1", receiverId: null }),
        })
      );
      expect(prismaMock.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: "client_1" }) })
      );
    });

    it("returns 404 for an unknown project slug", async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/admin/projects/does-not-exist/updates")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ content: "Update" });

      expect(res.status).toBe(404);
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });

    it("rejects empty content", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);

      const res = await request(app)
        .post("/api/admin/projects/my-project/updates")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ content: "" });

      expect(res.status).toBe(400);
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 5: Run the tests**

Run: `npm run test --workspace apps/api -- admin.test.ts`
Expected: all tests pass.

- [ ] **Step 6: Run the full API test suite**

Run: `npm run test --workspace apps/api`
Expected: all tests still pass.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/routes/admin.ts apps/api/src/routes/admin.test.ts apps/api/src/routes/projects.ts
git commit -m "feat: add admin milestone CRUD and project-update posting routes"
```

---

### Task 2: `/admin/projects/[slug]` detail page

**Files:**
- Create: `apps/web/src/app/admin/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `GET /api/projects/:slug` (now includes `client`), `GET /api/projects/:slug/tickets`, `GET /api/projects/:slug/updates` (all pre-existing, unchanged in shape except the `client` addition). `POST /api/admin/projects/:slug/milestones`, `PATCH /api/admin/milestones/:id`, `POST /api/admin/projects/:slug/updates` (Task 1). `ticketStatusBadgeClass`, `ticketTypeBadgeClass`, `ticketPriorityBadgeClass` from `apps/web/src/lib/ticketBadgeStyles.ts`.
- Produces: nothing consumed by a later task — leaf page. This is the page the Phase 5 user-detail page's project links (`/admin/projects/${project.slug}`) point to — those links go from 404 to working once this ships.

- [ ] **Step 1: Create `apps/web/src/app/admin/projects/[slug]/page.tsx`**

```tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Plus, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ticketPriorityBadgeClass,
  ticketStatusBadgeClass,
  ticketTypeBadgeClass,
} from "@/lib/ticketBadgeStyles";

type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETE";

interface Milestone {
  id: string;
  title: string;
  order: number;
  status: MilestoneStatus;
  dueDate: string | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  client: { firstName: string; lastName: string; email: string };
  milestones: Milestone[];
}

interface Ticket {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  submittedBy: { firstName: string; lastName: string };
}

interface ProjectUpdate {
  id: string;
  content: string;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

const MILESTONE_STATUS_OPTIONS: MilestoneStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETE"];

export default function AdminProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, fetchWithAuth } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneError, setMilestoneError] = useState<string | null>(null);

  const [updateContent, setUpdateContent] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [projRes, ticketRes, updatesRes] = await Promise.all([
          fetchWithAuth(`/api/projects/${slug}`),
          fetchWithAuth(`/api/projects/${slug}/tickets`),
          fetchWithAuth(`/api/projects/${slug}/updates`),
        ]);

        if (cancelled) return;

        if (!projRes.ok) {
          setError(projRes.status === 404 ? "Project not found." : "Failed to load project.");
          return;
        }

        const projData = await projRes.json();
        setProject(projData.project);

        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          setTickets(ticketData.tickets);
        }

        if (updatesRes.ok) {
          const updatesData = await updatesRes.json();
          setUpdates(updatesData.updates);
        }
      } catch {
        if (!cancelled) setError("Failed to load project.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, fetchWithAuth]);

  const handleAddMilestone = async (event: FormEvent) => {
    event.preventDefault();
    if (!project) return;
    setAddingMilestone(true);
    setMilestoneError(null);
    try {
      const res = await fetchWithAuth(`/api/admin/projects/${slug}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newMilestoneTitle,
          order: project.milestones.length,
          dueDate: newMilestoneDueDate ? new Date(newMilestoneDueDate).toISOString() : undefined,
        }),
      });
      if (!res.ok) {
        setMilestoneError(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setProject((current) =>
        current ? { ...current, milestones: [...current.milestones, data.milestone] } : current
      );
      setNewMilestoneTitle("");
      setNewMilestoneDueDate("");
    } catch {
      setMilestoneError("Something went wrong. Please try again.");
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleMilestoneStatusChange = async (milestoneId: string, status: MilestoneStatus) => {
    const res = await fetchWithAuth(`/api/admin/milestones/${milestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setProject((current) =>
      current
        ? {
            ...current,
            milestones: current.milestones.map((m) => (m.id === milestoneId ? data.milestone : m)),
          }
        : current
    );
  };

  const handlePostUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setPostingUpdate(true);
    setUpdateError(null);
    try {
      const res = await fetchWithAuth(`/api/admin/projects/${slug}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: updateContent }),
      });
      if (!res.ok) {
        setUpdateError(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setUpdates((current) => [
        {
          id: data.update.id,
          content: data.update.content,
          createdAt: data.update.createdAt,
          sender: { firstName: user.firstName, lastName: user.lastName, role: user.role },
        },
        ...current,
      ]);
      setUpdateContent("");
    } catch {
      setUpdateError("Something went wrong. Please try again.");
    } finally {
      setPostingUpdate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-foreground/60">
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-foreground/60">{error ?? "Project not found."}</p>
        <Link
          href="/admin/projects"
          className="rounded-full border border-glass-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <Link
        href="/admin/projects"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">Project</p>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{project.name}</h1>
          <p className="mt-2 max-w-2xl text-foreground/60">{project.description}</p>
          <p className="mt-2 text-sm text-foreground/60">
            Client: {project.client.firstName} {project.client.lastName} ({project.client.email})
          </p>
        </div>
        <span className="rounded-full border border-glass-border px-4 py-1.5 text-sm font-medium text-foreground/70">
          {project.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-glass-border bg-surface p-6 lg:col-span-1">
          <h2 className="mb-4 text-base font-bold text-foreground">Milestones</h2>

          {project.milestones.length === 0 ? (
            <p className="mb-4 text-sm text-foreground/60">No milestones yet.</p>
          ) : (
            <div className="mb-4 space-y-3">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-lg border border-glass-border p-3">
                  <p className="text-sm font-medium text-foreground">{milestone.title}</p>
                  {milestone.dueDate && (
                    <p className="mt-0.5 text-xs text-foreground/50">
                      Due {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <select
                    value={milestone.status}
                    onChange={(e) =>
                      void handleMilestoneStatusChange(milestone.id, e.target.value as MilestoneStatus)
                    }
                    className="mt-2 w-full rounded-lg border border-glass-border bg-background px-2 py-1.5 text-xs text-foreground"
                  >
                    {MILESTONE_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={(e) => void handleAddMilestone(e)} className="flex flex-col gap-2 border-t border-glass-border pt-4">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/70">
              Add Milestone
            </label>
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="Milestone title"
              required
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
            />
            <input
              type="date"
              value={newMilestoneDueDate}
              onChange={(e) => setNewMilestoneDueDate(e.target.value)}
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
            />
            {milestoneError && <p className="text-xs text-red-600">{milestoneError}</p>}
            <button
              type="submit"
              disabled={addingMilestone}
              className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {addingMilestone ? "Adding..." : "Add Milestone"}
            </button>
          </form>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            Tickets
            {tickets.length > 0 && (
              <span className="rounded-full bg-glass-bg px-2 py-0.5 text-xs text-foreground/60">
                {tickets.length}
              </span>
            )}
          </h2>
          {tickets.length === 0 ? (
            <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
              <p className="text-foreground/60">No tickets yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/admin/tickets/${ticket.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-glass-border bg-surface p-4 transition-colors hover:border-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
                    <p className="mt-0.5 text-xs text-foreground/50">
                      {ticket.submittedBy.firstName} · {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ticketStatusBadgeClass(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketTypeBadgeClass(ticket.type)}`}>
                      {ticket.type}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketPriorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
          <MessageSquare className="h-4 w-4 text-accent" aria-hidden="true" />
          Updates
        </h2>

        <form onSubmit={(e) => void handlePostUpdate(e)} className="mb-6 flex flex-col gap-2">
          <textarea
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            placeholder="Share a progress update with the client..."
            required
            rows={3}
            className="w-full resize-none rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
          />
          {updateError && <p className="text-xs text-red-600">{updateError}</p>}
          <button
            type="submit"
            disabled={postingUpdate}
            className="flex w-fit items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            {postingUpdate ? "Posting..." : "Post Update"}
          </button>
        </form>

        {updates.length === 0 ? (
          <p className="text-sm text-foreground/60">No updates posted yet.</p>
        ) : (
          <div className="space-y-4 border-t border-glass-border pt-4">
            {updates.map((update) => (
              <div key={update.id} className="border-l-2 border-accent/30 pl-4">
                <p className="whitespace-pre-wrap text-sm text-foreground/80">{update.content}</p>
                <p className="mt-1 text-xs text-foreground/50">
                  {update.sender.firstName} {update.sender.lastName} ·{" "}
                  {new Date(update.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors, `/admin/projects/[slug]` in the route list.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/src/app/admin/projects/[slug]/page.tsx"
git commit -m "feat: add admin project detail page (milestone management, project updates, ticket visibility)"
```
