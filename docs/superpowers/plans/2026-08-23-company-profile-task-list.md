# Company Profile + Internal Task List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins a studio-settings page (`/admin/company`) and an internal ops task list (`/admin/tasks`) — the "company profile" and "task list for the company" asks from the original overnight request. Both are backed by the `Task` and `CompanyProfile` Prisma models added in this plan's preparatory schema-migration commit (`d397b14`, already applied to the local database and committed — no migration work remains in this plan's tasks).

**Architecture:** Six new routes in the existing `apps/api/src/routes/admin.ts`: `GET/POST /api/admin/tasks`, `PATCH/DELETE /api/admin/tasks/:id` (internal task CRUD, `createdById` always the acting admin), `GET/PATCH /api/admin/company` (a singleton row, `id` fixed to the literal `"singleton"`, read via `findUnique` and written via `upsert` so the very first save creates it — no separate create endpoint needed). Two new frontend pages: `/admin/tasks` (list + add + inline status change + delete) and `/admin/company` (a settings form). Two new nav entries, inserted in content order before "Profile" (per Phase 4/6's established convention that Profile stays the trailing nav item): "Tasks" then "Company".

**Tech Stack:** Express + Prisma, Zod, vitest + supertest, Next.js 16 (App Router, Client Components), lucide-react icons, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-08-23-dashboard-platform-redesign.md` (§4.3 Admin Dashboard Redesign — `/admin/tasks`, `/admin/company`; §4.4 New API Surface — task CRUD, company profile; §4.5 Schema Changes — `Task`, `CompanyProfile`, already migrated)

## Global Constraints

- Design tokens only: `bg-background`, `text-foreground`, `bg-surface`, `text-accent`, `border-glass-border`, `bg-glass-bg`. Never `text-accent-foreground`. Contrast floor `/60`+ for readable text; `/50` accepted only for bare-timestamp-style decorative micro-text.
- API route style in `admin.ts`: `asyncHandler` + a `try { schema.parse(req.body) } catch (e) { if (e instanceof z.ZodError) throw new AppError(400, e.issues.map(i => i.message).join(", ")); throw e; }` block — this is the pattern the prior phase's whole-plan review established as the file's corrected convention (its earlier routes used a bare `.parse()`, which let authored Zod messages go unseen; do not repeat that mistake in new routes). Every new route uses the file's existing `...adminOnly` spread. Validate the request body *before* any database lookup (also established by the prior phase's review — a malformed body against a nonexistent id should 400, not 404).
- `/admin/company` is a deliberately distinct route from the already-existing `/admin/profile` (self-service admin account settings, built in an earlier phase) — do not conflate them or reuse `ProfileSettingsForm` for this. They edit unrelated things (the studio's own settings vs. the logged-in admin's personal account).
- `CompanyProfile` has no `PATCH`-partial semantics — the form always submits every field (matching the `ProfileSettingsForm` pattern from an earlier phase: the frontend fetches current state first, so a full-replace `PATCH` is safe and simpler than partial-update semantics for a 5-field settings form).
- `Task` deletion is a hard delete (no soft-delete/archive field on the model) — the DELETE route is destructive and immediate, matching the model's own schema (no `deletedAt` column exists to do otherwise).
- No frontend test suite exists in this repo — frontend tasks are verified via `npm run build --workspace apps/web` succeeding with no TypeScript errors.
- `DashboardShell`'s `<main data-app-shell>` provides the full-bleed container — pages render directly inside it with their own `p-8`.

---

### Task 1: Task CRUD + company profile routes

**Files:**
- Modify: `apps/api/src/routes/admin.ts`
- Modify: `apps/api/src/routes/admin.test.ts`

**Interfaces:**
- Consumes: `prisma.task.findMany/create/findUnique/update/delete`, `prisma.companyProfile.findUnique/upsert` (Prisma models — see `apps/api/prisma/schema.prisma`'s `Task` and `CompanyProfile` models, migrated in commit `d397b14`).
- Produces: `GET/POST /api/admin/tasks`, `PATCH/DELETE /api/admin/tasks/:id`, `GET/PATCH /api/admin/company` — response shapes documented in each step. Consumed by Task 2 (tasks page) and Task 3 (company page).

- [ ] **Step 1: Add the task routes to `apps/api/src/routes/admin.ts`**

Insert these after the existing `POST /projects/:slug/updates` route (right before `GET /dashboard`):

```ts
const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

const taskStatusFilterSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional();

// GET /api/admin/tasks?status=TODO
router.get(
  "/tasks",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const status = taskStatusFilterSchema.parse(req.query.status || undefined);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: { createdBy: { select: { firstName: true, lastName: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    res.json({ success: true, tasks });
  })
);

// POST /api/admin/tasks
router.post(
  "/tasks",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    let body: z.infer<typeof createTaskSchema>;
    try {
      body = createTaskSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new AppError(400, e.issues.map((issue) => issue.message).join(", "));
      }
      throw e;
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        createdById: req.user!.id,
      },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });

    res.status(201).json({ success: true, task });
  })
);

// PATCH /api/admin/tasks/:id
router.patch(
  "/tasks/:id",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    let body: z.infer<typeof updateTaskSchema>;
    try {
      body = updateTaskSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new AppError(400, e.issues.map((issue) => issue.message).join(", "));
      }
      throw e;
    }

    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Task not found");

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
      },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });

    res.json({ success: true, task });
  })
);

// DELETE /api/admin/tasks/:id
router.delete(
  "/tasks/:id",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Task not found");

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({ success: true });
  })
);

const upsertCompanyProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  tagline: z.string().trim().max(300).optional(),
  contactEmail: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(500).optional(),
});

// GET /api/admin/company
router.get(
  "/company",
  ...adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const company = await prisma.companyProfile.findUnique({ where: { id: "singleton" } });
    res.json({ success: true, company });
  })
);

// PATCH /api/admin/company
// Upserts the singleton row — the first save creates it.
router.patch(
  "/company",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    let body: z.infer<typeof upsertCompanyProfileSchema>;
    try {
      body = upsertCompanyProfileSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new AppError(400, e.issues.map((issue) => issue.message).join(", "));
      }
      throw e;
    }

    const company = await prisma.companyProfile.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        name: body.name,
        tagline: body.tagline,
        contactEmail: body.contactEmail,
        phone: body.phone,
        address: body.address,
      },
      update: {
        name: body.name,
        tagline: body.tagline,
        contactEmail: body.contactEmail,
        phone: body.phone,
        address: body.address,
      },
    });

    res.json({ success: true, company });
  })
);
```

- [ ] **Step 2: Extend the Prisma mock in `apps/api/src/routes/admin.test.ts`**

Add `task` and `companyProfile` to the existing `prismaMock`:

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
  task: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  companyProfile: { findUnique: vi.fn(), upsert: vi.fn() },
  $transaction: vi.fn((callback: (client: unknown) => unknown) => callback(prismaMock)),
}));
```

- [ ] **Step 3: Add a new `describe` block**

Append this as a new top-level `describe` block, after the `describe("admin project management routes", ...)` block closes:

```ts
describe("admin tasks and company profile routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
  });

  const taskFixture = {
    id: "task_1",
    title: "Renew domain",
    description: null,
    status: "TODO",
    dueDate: null,
    createdById: "admin_1",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { firstName: "Ada", lastName: "Admin" },
  };

  describe("GET /api/admin/tasks", () => {
    it("returns all tasks for admin", async () => {
      prismaMock.task.findMany.mockResolvedValue([taskFixture]);

      const res = await request(app)
        .get("/api/admin/tasks")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(1);
      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });

    it("filters by status", async () => {
      prismaMock.task.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/admin/tasks?status=DONE")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: "DONE" } })
      );
    });

    it("returns 403 for client role", async () => {
      const res = await request(app)
        .get("/api/admin/tasks")
        .set("Authorization", `Bearer ${clientToken()}`);
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/admin/tasks", () => {
    it("creates a task owned by the acting admin", async () => {
      prismaMock.task.create.mockResolvedValue(taskFixture);

      const res = await request(app)
        .post("/api/admin/tasks")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ title: "Renew domain" });

      expect(res.status).toBe(201);
      expect(prismaMock.task.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ title: "Renew domain", createdById: "admin_1" }) })
      );
    });

    it("rejects a missing title", async () => {
      const res = await request(app)
        .post("/api/admin/tasks")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({});

      expect(res.status).toBe(400);
      expect(prismaMock.task.create).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/admin/tasks/:id", () => {
    it("updates a task's status", async () => {
      prismaMock.task.findUnique.mockResolvedValue(taskFixture);
      prismaMock.task.update.mockResolvedValue({ ...taskFixture, status: "DONE" });

      const res = await request(app)
        .patch("/api/admin/tasks/task_1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ status: "DONE" });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe("DONE");
    });

    it("returns 404 for an unknown task", async () => {
      prismaMock.task.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .patch("/api/admin/tasks/does-not-exist")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ status: "DONE" });

      expect(res.status).toBe(404);
      expect(prismaMock.task.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/admin/tasks/:id", () => {
    it("deletes an existing task", async () => {
      prismaMock.task.findUnique.mockResolvedValue(taskFixture);
      prismaMock.task.delete.mockResolvedValue(taskFixture);

      const res = await request(app)
        .delete("/api/admin/tasks/task_1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(prismaMock.task.delete).toHaveBeenCalledWith({ where: { id: "task_1" } });
    });

    it("returns 404 for an unknown task", async () => {
      prismaMock.task.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/admin/tasks/does-not-exist")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
      expect(prismaMock.task.delete).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/admin/company", () => {
    it("returns null when no profile has been saved yet", async () => {
      prismaMock.companyProfile.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/admin/company")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.company).toBeNull();
    });

    it("returns the saved profile", async () => {
      prismaMock.companyProfile.findUnique.mockResolvedValue({
        id: "singleton",
        name: "Illustriober",
        tagline: null,
        contactEmail: "hello@illustriober.com",
        phone: null,
        address: null,
        updatedAt: new Date(),
      });

      const res = await request(app)
        .get("/api/admin/company")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.company.name).toBe("Illustriober");
    });
  });

  describe("PATCH /api/admin/company", () => {
    it("upserts the singleton profile", async () => {
      prismaMock.companyProfile.upsert.mockResolvedValue({
        id: "singleton",
        name: "Illustriober",
        tagline: "Creative studio",
        contactEmail: "hello@illustriober.com",
        phone: null,
        address: null,
        updatedAt: new Date(),
      });

      const res = await request(app)
        .patch("/api/admin/company")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Illustriober", tagline: "Creative studio", contactEmail: "hello@illustriober.com" });

      expect(res.status).toBe(200);
      expect(prismaMock.companyProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "singleton" } })
      );
    });

    it("rejects an invalid contact email", async () => {
      const res = await request(app)
        .patch("/api/admin/company")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Illustriober", contactEmail: "not-an-email" });

      expect(res.status).toBe(400);
      expect(prismaMock.companyProfile.upsert).not.toHaveBeenCalled();
    });

    it("returns 403 for client role", async () => {
      const res = await request(app)
        .patch("/api/admin/company")
        .set("Authorization", `Bearer ${clientToken()}`)
        .send({ name: "Illustriober", contactEmail: "hello@illustriober.com" });

      expect(res.status).toBe(403);
    });
  });
});
```

- [ ] **Step 4: Run the tests**

Run: `npm run test --workspace apps/api -- admin.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Run the full API test suite**

Run: `npm run test --workspace apps/api`
Expected: all tests still pass.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/routes/admin.ts apps/api/src/routes/admin.test.ts
git commit -m "feat: add admin task CRUD and company profile routes"
```

---

### Task 2: `/admin/tasks` page + nav entries

**Files:**
- Create: `apps/web/src/app/admin/tasks/page.tsx`
- Modify: `apps/web/src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: `GET/POST /api/admin/tasks`, `PATCH/DELETE /api/admin/tasks/:id` (Task 1).
- Produces: nothing consumed by a later task. Adds both new nav entries ("Tasks" here, "Company" for Task 3's page — added together in this one nav-edit step since both belong to the same `ADMIN_NAV` array and touching it twice in two tasks would conflict).

- [ ] **Step 1: Add both nav entries to `apps/web/src/app/admin/layout.tsx`**

Current `ADMIN_NAV` (after Phase 5):

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

Add `ListTodo` and `Building2` to the `lucide-react` import, and insert both new entries before "Profile":

```tsx
import { LayoutDashboard, Mail, FolderKanban, Ticket, Users, ListTodo, Building2, User } from "lucide-react";
```

```tsx
const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { href: "/admin/company", label: "Company", icon: Building2 },
  { href: "/admin/profile", label: "Profile", icon: User },
];
```

- [ ] **Step 2: Create `apps/web/src/app/admin/tasks/page.tsx`**

```tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdBy: { firstName: string; lastName: string };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function AdminTasksPage() {
  const { fetchWithAuth } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [fetchWithAuth]);

  const handleAddTask = async (event: FormEvent) => {
    event.preventDefault();
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetchWithAuth("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        setAddError(await readErrorMessage(res));
        return;
      }
      const data = await res.json();
      setTasks((current) => [data.task, ...current]);
      setNewTitle("");
    } catch {
      setAddError("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const res = await fetchWithAuth(`/api/admin/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setTasks((current) => current.map((t) => (t.id === taskId ? data.task : t)));
  };

  const handleDelete = async (taskId: string) => {
    const res = await fetchWithAuth(`/api/admin/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) return;
    setTasks((current) => current.filter((t) => t.id !== taskId));
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Admin</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">Tasks</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/60">
          Internal ops todos — not visible to clients.
        </p>
      </div>

      <form onSubmit={(e) => void handleAddTask(e)} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task..."
          required
          className="min-w-[240px] flex-1 rounded-lg border border-glass-border bg-surface px-3 py-2 text-sm text-foreground"
        />
        <button
          type="submit"
          disabled={adding}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {adding ? "Adding..." : "Add Task"}
        </button>
      </form>
      {addError && <p className="text-xs text-red-600">{addError}</p>}

      {loading ? (
        <p className="text-foreground/60">Loading tasks...</p>
      ) : error ? (
        <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-foreground/60">Couldn&apos;t load tasks. Refresh to try again.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-foreground/60">No tasks yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-glass-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium text-foreground ${task.status === "DONE" ? "line-through opacity-50" : ""}`}
                >
                  {task.title}
                </p>
                <p className="mt-0.5 text-xs text-foreground/50">
                  Added by {task.createdBy.firstName} {task.createdBy.lastName}
                  {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => void handleStatusChange(task.id, e.target.value as TaskStatus)}
                  aria-label={`Status for ${task.title}`}
                  className="rounded-lg border border-glass-border bg-background px-2 py-1.5 text-xs text-foreground"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void handleDelete(task.id)}
                  aria-label={`Delete ${task.title}`}
                  className="rounded-full border border-glass-border p-2 text-foreground/50 transition-colors hover:border-red-500/40 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors, `/admin/tasks` in the route list.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/admin/tasks/page.tsx apps/web/src/app/admin/layout.tsx
git commit -m "feat: add admin internal task list page"
```

---

### Task 3: `/admin/company` page

**Files:**
- Create: `apps/web/src/app/admin/company/page.tsx`

**Interfaces:**
- Consumes: `GET/PATCH /api/admin/company` (Task 1). The "Company" nav entry was already added in Task 2.
- Produces: nothing consumed by a later task — leaf page.

- [ ] **Step 1: Create `apps/web/src/app/admin/company/page.tsx`**

```tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyProfile {
  name: string;
  tagline: string | null;
  contactEmail: string;
  phone: string | null;
  address: string | null;
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export default function AdminCompanyPage() {
  const { fetchWithAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchWithAuth("/api/admin/company");
        if (res.ok && !cancelled) {
          const data = (await res.json()) as { company: CompanyProfile | null };
          if (data.company) {
            setName(data.company.name);
            setTagline(data.company.tagline ?? "");
            setContactEmail(data.company.contactEmail);
            setPhone(data.company.phone ?? "");
            setAddress(data.company.address ?? "");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchWithAuth]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetchWithAuth("/api/admin/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tagline, contactEmail, phone, address }),
      });
      if (!res.ok) {
        setSaveError(await readErrorMessage(res));
        return;
      }
      setSaveSuccess(true);
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Admin</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Company Profile
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/60">
          Studio settings — not client-facing yet.
        </p>
      </div>

      {loading ? (
        <p className="text-foreground/60">Loading...</p>
      ) : (
        <div className="max-w-xl rounded-xl border border-glass-border bg-surface p-6">
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="company-name"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Business Name
              </label>
              <input
                id="company-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="company-tagline"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Tagline
              </label>
              <input
                id="company-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="company-email"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Contact Email
              </label>
              <input
                id="company-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="company-phone"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Phone
              </label>
              <input
                id="company-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="company-address"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Address
              </label>
              <textarea
                id="company-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Optional"
                rows={2}
                className="w-full resize-none rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            {saveSuccess && <p className="text-sm text-accent">Company profile saved.</p>}

            <button
              type="submit"
              disabled={saving}
              className="self-start rounded-full bg-accent px-6 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors, `/admin/company` in the route list.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/admin/company/page.tsx
git commit -m "feat: add admin company profile settings page"
```
