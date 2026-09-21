# Client Project Detail + Updates Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the client project detail page, the milestone tracker, the tickets list page, and the ticket detail page onto the app's brand tokens (all four still use the pre-redesign dark theme), and add a read-only "Updates" feed to the project detail page backed by a new API endpoint.

**Architecture:** One new API route, `GET /api/projects/:slug/updates`, added to the existing `apps/api/src/routes/projects.ts` (reads `Message` rows where `receiverId IS NULL` — broadcast project updates — for the caller's own project). Two new frontend files: a small shared badge-style helper (`apps/web/src/lib/ticketBadgeStyles.ts`) so the three ticket-displaying pages (project detail, tickets list, ticket detail) use identical status/type/priority chip styling instead of three copies of the same switch statement, and the restyled `MilestoneTracker` + three restyled pages themselves. There is no admin-side "post an update" UI yet (that's Phase 6) — the feed will show its honest empty state until then, same pattern as Phase 2's "Recent Activity" placeholder.

**Tech Stack:** Next.js 16 (App Router, Client Components), Express + Prisma, vitest + supertest, lucide-react icons, Tailwind CSS 4 with the repo's existing design tokens.

**Spec:** `docs/superpowers/specs/2026-08-23-dashboard-platform-redesign.md` (§4.2 Client Dashboard Redesign — project detail, tickets list/detail; §4.4 New API Surface — `GET /api/projects/:slug/updates`)

## Global Constraints

- Design tokens for all surfaces/text/borders: `bg-background`, `text-foreground`, `bg-surface`, `text-accent`, `bg-accent/10`, `border-glass-border`, `bg-glass-bg`. Never reintroduce `zinc-*` surfaces, `text-white`, or `bg-zinc-900` as page chrome, headings, or body text — that is the exact bug this phase (and Phase 2 before it) exists to fix.
- **Exception, stated explicitly so it isn't flagged as a violation of the rule above:** semantic status/type/priority badges (ticket status, ticket type, ticket priority, milestone status) use small translucent color chips — e.g. `bg-blue-500/10 text-blue-400 border-blue-500/20` — matching the pattern already shipped and reviewed in `apps/web/src/components/admin/dashboard/TicketQueue.tsx`. This includes `zinc-500/10`/`zinc-400` as the neutral/default chip color. These are small semantic accents on an otherwise on-brand page, not dark-theme surface chrome, and matching them exactly keeps the client and admin ticket views visually consistent. Do not invent new colors for these — use the exact mappings given in Task 1 below.
- `DashboardShell`'s `<main data-app-shell>` already provides the full-bleed, padding-free container — page components render directly inside it with their own `p-8` (or `flex flex-col gap-N p-8`), matching every page built in Phase 2. Do not wrap in the marketing `Container`/`SectionWrapper`/`Button` components — those are for marketing-chrome routes only, and none of the files this plan touches should import them.
- `apps/web/src/components/tickets/CommentThread.tsx` is already on-brand (confirmed: uses `bg-surface`, `border-glass-border`, `text-accent`, `text-foreground/*` throughout). Do not modify it — Task 4 restyles only the page chrome around it.
- API route style: `apps/api/src/routes/projects.ts`'s existing routes use `asyncHandler` but return errors via `res.status(N).json({ success: false, error: "..." })` inline rather than throwing `AppError` (unlike `auth.ts`/`users.ts`, which throw `AppError`). Match the file you're editing — Task 1's new route uses the inline `res.status().json()` style, consistent with the two routes already in this file, not the `AppError` style used elsewhere in the codebase.
- New vitest+supertest coverage for the new route, extending the existing `apps/api/src/routes/projects.test.ts` file (not a new file) and matching its exact `prismaMock`/`vi.hoisted`/fixture conventions.
- No frontend test suite exists in this repo — frontend tasks are verified via `npm run build --workspace apps/web` + (for Task 2, which adds the only new frontend/backend integration point) a manual check that the endpoint and page agree on the response shape.

---

### Task 1: `GET /api/projects/:slug/updates` endpoint + tests

**Files:**
- Modify: `apps/api/src/routes/projects.ts`
- Modify: `apps/api/src/routes/projects.test.ts`

**Interfaces:**
- Consumes: `prisma.message.findMany` (Prisma `Message` model — see `apps/api/prisma/schema.prisma`'s `Message` model: `id, content, type, projectId, senderId, receiverId, readAt, createdAt`, `sender` relation to `User`), the existing `resolveProject`-equivalent inline logic already present in this file's `:slug` route (re-look-up the project by slug, 404 if missing, 403 if the caller is a non-admin who doesn't own it).
- Produces: `GET /api/projects/:slug/updates` → `{ success: true, updates: Array<{ id, content, type, projectId, senderId, receiverId, readAt, createdAt, sender: { firstName, lastName, role } }> }`, newest-first. Consumed by Task 2's project detail page.

- [ ] **Step 1: Add the new route to `apps/api/src/routes/projects.ts`**

Insert this route between the existing `GET /:slug` route and `export default router;`:

```ts
// GET /api/projects/:slug/updates
// Broadcast project updates (Messages with receiverId: null), newest first
router.get(
  "/:slug/updates",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { slug } = req.params;

    const project = await prisma.project.findUnique({ where: { slug } });
    if (!project) return res.status(404).json({ success: false, error: "Project not found" });

    if (role !== "ADMIN" && project.clientId !== userId) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const updates = await prisma.message.findMany({
      where: { projectId: project.id, receiverId: null },
      include: { sender: { select: { firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, updates });
  })
);
```

No new imports are needed — `prisma`, `authenticate`, and `asyncHandler` are already imported in this file.

- [ ] **Step 2: Extend the Prisma mock in `apps/api/src/routes/projects.test.ts`**

Add a `message` mock to the existing `prismaMock` object (currently `project` and `ticket` and `refreshToken`):

```ts
const prismaMock = vi.hoisted(() => ({
  project: { findMany: vi.fn(), findUnique: vi.fn() },
  ticket: { findMany: vi.fn() },
  message: { findMany: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
}));
```

- [ ] **Step 3: Add a new `describe` block for the endpoint**

Append this block inside the existing `describe("project routes — data isolation", ...)` block, after the `describe("GET /api/projects/:slug — detail", ...)` block (as a sibling, before the final closing `});` of the outer describe):

```ts
  describe("GET /api/projects/:slug/updates", () => {
    const updateFixture = {
      id: "msg_1",
      content: "Kicked off the design phase.",
      type: "TEXT",
      projectId: "proj_1",
      senderId: "admin_1",
      receiverId: null,
      readAt: null,
      createdAt: new Date(),
      sender: { firstName: "Ada", lastName: "Admin", role: "ADMIN" },
    };

    it("returns broadcast updates for the owning client", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);
      prismaMock.message.findMany.mockResolvedValue([updateFixture]);

      const res = await request(app)
        .get("/api/projects/my-project/updates")
        .set("Authorization", `Bearer ${clientToken("client_1")}`);

      expect(res.status).toBe(200);
      expect(res.body.updates).toHaveLength(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: "proj_1", receiverId: null },
          orderBy: { createdAt: "desc" },
        })
      );
    });

    it("blocks a different client from viewing another client's updates", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);

      const res = await request(app)
        .get("/api/projects/my-project/updates")
        .set("Authorization", `Bearer ${clientToken("client_other")}`);

      expect(res.status).toBe(403);
      expect(prismaMock.message.findMany).not.toHaveBeenCalled();
    });

    it("allows admin to view any project's updates", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);
      prismaMock.message.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/projects/my-project/updates")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("returns 404 for unknown project", async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/projects/does-not-exist/updates")
        .set("Authorization", `Bearer ${clientToken()}`);

      expect(res.status).toBe(404);
    });

    it("returns 401 for unauthenticated requests", async () => {
      const res = await request(app).get("/api/projects/my-project/updates");
      expect(res.status).toBe(401);
    });
  });
```

- [ ] **Step 4: Run the tests**

Run: `npm run test --workspace apps/api -- projects.test.ts`
Expected: all tests pass, including the 5 new ones.

- [ ] **Step 5: Run the full API test suite**

Run: `npm run test --workspace apps/api`
Expected: all tests still pass (93 existing + 5 new = 98).

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/routes/projects.ts apps/api/src/routes/projects.test.ts
git commit -m "feat: add GET /api/projects/:slug/updates endpoint for the client updates feed"
```

---

### Task 2: Restyle `MilestoneTracker` + project detail page, add the Updates feed

**Files:**
- Create: `apps/web/src/lib/ticketBadgeStyles.ts`
- Modify: `apps/web/src/components/MilestoneTracker.tsx` (full rewrite)
- Modify: `apps/web/src/app/dashboard/projects/[slug]/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `GET /api/projects/:slug/updates` (Task 1) — response shape `{ success, updates: Array<{ id, content, createdAt, sender: { firstName, lastName, role } }> }`. Existing `GET /api/projects/:slug` (unchanged) and `GET /api/projects/:slug/tickets` (unchanged).
- Produces: `ticketStatusBadgeClass(status)`, `ticketTypeBadgeClass(type)`, `ticketPriorityBadgeClass(priority)` from `apps/web/src/lib/ticketBadgeStyles.ts` — consumed by this task's own page and by Task 3 and Task 4.

- [ ] **Step 1: Create `apps/web/src/lib/ticketBadgeStyles.ts`**

```ts
export function ticketStatusBadgeClass(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "IN_REVIEW":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "IN_PROGRESS":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "RESOLVED":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export function ticketTypeBadgeClass(type: string): string {
  switch (type) {
    case "BUG":
      return "bg-red-500/10 text-red-400";
    case "FEATURE":
      return "bg-purple-500/10 text-purple-400";
    case "IDEA":
      return "bg-yellow-500/10 text-yellow-400";
    case "QUESTION":
      return "bg-sky-500/10 text-sky-400";
    default:
      return "bg-zinc-500/10 text-zinc-400";
  }
}

export function ticketPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-500/10 text-red-400";
    case "HIGH":
      return "bg-orange-500/10 text-orange-400";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-400";
    default:
      return "bg-blue-500/10 text-blue-400";
  }
}
```

These mappings mirror `apps/web/src/components/admin/dashboard/TicketQueue.tsx`'s `statusColor`/`priorityColor` functions (status) and the old project-detail page's `TYPE_BADGE`/`PRIORITY_BADGE` maps (type/priority), so the client views read identically to the already-shipped admin view. Do not modify `TicketQueue.tsx` itself — that file is out of this phase's scope (it's admin-side, covered by a later phase).

- [ ] **Step 2: Replace `apps/web/src/components/MilestoneTracker.tsx` entirely**

```tsx
"use client";

type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETE";

interface Milestone {
  id: string;
  title: string;
  order: number;
  status: MilestoneStatus;
  dueDate?: string | null;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
}

const STATUS_CONFIG: Record<MilestoneStatus, { ring: string; bg: string; text: string }> = {
  COMPLETE: { ring: "ring-accent", bg: "bg-accent", text: "text-accent" },
  IN_PROGRESS: { ring: "ring-blue-400", bg: "bg-blue-400/20", text: "text-blue-400" },
  PENDING: { ring: "ring-glass-border", bg: "bg-glass-bg", text: "text-foreground/40" },
};

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  if (!milestones.length) {
    return <p className="text-sm text-foreground/50">No milestones defined for this project yet.</p>;
  }

  const sorted = [...milestones].sort((a, b) => a.order - b.order);
  const completeCount = sorted.filter((m) => m.status === "COMPLETE").length;
  const pct = Math.round((completeCount / sorted.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-foreground/50">
          <span>
            {completeCount} of {sorted.length} complete
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-glass-bg">
          <div
            className="h-1.5 rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {sorted.map((milestone, i) => {
          const cfg = STATUS_CONFIG[milestone.status];
          const isLast = i === sorted.length - 1;
          return (
            <div key={milestone.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ${cfg.ring} ${cfg.bg} transition-all`}
                >
                  {milestone.status === "COMPLETE" ? (
                    <svg
                      className="h-3.5 w-3.5 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : milestone.status === "IN_PROGRESS" ? (
                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-foreground/30" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-px flex-1 ${milestone.status === "COMPLETE" ? "bg-accent/40" : "bg-glass-border"}`}
                    style={{ minHeight: 24 }}
                  />
                )}
              </div>

              <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                <p className={`text-sm font-medium leading-7 ${cfg.text}`}>{milestone.title}</p>
                {milestone.dueDate && (
                  <p className="text-xs text-foreground/40">
                    Due {new Date(milestone.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

The completed-milestone checkmark icon uses `text-foreground` (near-black, #171717) against the solid `bg-accent` (orange) circle behind it — this matches the existing convention in `DashboardSidebar.tsx`'s logo mark (`bg-accent` circle with `text-foreground` "il" lettering), not a reintroduction of `text-white`.

- [ ] **Step 3: Replace `apps/web/src/app/dashboard/projects/[slug]/page.tsx` entirely**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MilestoneTracker } from "@/components/MilestoneTracker";
import {
  ticketPriorityBadgeClass,
  ticketStatusBadgeClass,
  ticketTypeBadgeClass,
} from "@/lib/ticketBadgeStyles";

type TicketStatus = "OPEN" | "IN_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type TicketType = "BUG" | "FEATURE" | "IDEA" | "QUESTION" | "SUPPORT";

interface Ticket {
  id: string;
  title: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  submittedBy: { firstName: string; lastName: string };
}

interface Milestone {
  id: string;
  title: string;
  order: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETE";
  dueDate?: string | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  startDate?: string | null;
  estimatedEnd?: string | null;
  milestones: Milestone[];
}

interface ProjectUpdate {
  id: string;
  content: string;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
}

const STATUS_COLUMNS: { key: TicketStatus; label: string }[] = [
  { key: "OPEN", label: "Open" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, ticketRes, updatesRes] = await Promise.all([
          fetchWithAuth(`/api/projects/${slug}`),
          fetchWithAuth(`/api/projects/${slug}/tickets`),
          fetchWithAuth(`/api/projects/${slug}/updates`),
        ]);

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
        setError("Failed to load project.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [slug, fetchWithAuth]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-foreground/50">
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-foreground/60">{error ?? "Project not found."}</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-full border border-glass-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const ticketsByStatus = STATUS_COLUMNS.map((col) => ({
    ...col,
    tickets: tickets.filter((t) => t.status === col.key),
  }));

  return (
    <div className="flex flex-col gap-8 p-8">
      <Link
        href="/dashboard"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/50 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">Project</p>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{project.name}</h1>
          <p className="mt-2 max-w-2xl text-foreground/60">{project.description}</p>
        </div>
        <span className="rounded-full border border-glass-border px-4 py-1.5 text-sm font-medium text-foreground/70">
          {project.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-glass-border bg-surface p-6 lg:col-span-1">
          <h2 className="mb-5 text-base font-bold text-foreground">Milestones</h2>
          <MilestoneTracker milestones={project.milestones} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              Tickets
              {tickets.length > 0 && (
                <span className="rounded-full bg-glass-bg px-2 py-0.5 text-xs text-foreground/50">
                  {tickets.length}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/projects/${slug}/tickets/new`)}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              New Ticket
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="rounded-xl border border-glass-border bg-surface p-8 text-center">
              <p className="text-foreground/50">No tickets yet.</p>
              <p className="mt-1 text-sm text-foreground/40">
                Submit a bug, feature request, or question to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ticketsByStatus
                .filter((col) => col.tickets.length > 0)
                .map((col) => (
                  <div key={col.key} className="overflow-hidden rounded-xl border border-glass-border">
                    <div className="flex items-center gap-2 border-b border-glass-border bg-glass-bg px-4 py-2.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${ticketStatusBadgeClass(col.key)}`}
                      >
                        {col.label}
                      </span>
                      <span className="rounded-full bg-glass-bg px-1.5 py-0.5 text-xs text-foreground/40">
                        {col.tickets.length}
                      </span>
                    </div>
                    <div className="divide-y divide-glass-border">
                      {col.tickets.map((ticket) => (
                        <Link
                          key={ticket.id}
                          href={`/dashboard/tickets/${ticket.id}`}
                          className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-glass-bg"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
                            <p className="mt-0.5 text-xs text-foreground/40">
                              {ticket.submittedBy.firstName} · {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketTypeBadgeClass(ticket.type)}`}
                            >
                              {ticket.type}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketPriorityBadgeClass(ticket.priority)}`}
                            >
                              {ticket.priority}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
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
        {updates.length === 0 ? (
          <p className="text-sm text-foreground/50">
            Updates from your project team will appear here as they happen.
          </p>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border-l-2 border-accent/30 pl-4">
                <p className="whitespace-pre-wrap text-sm text-foreground/80">{update.content}</p>
                <p className="mt-1 text-xs text-foreground/40">
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

Note two deliberate small behavior changes versus the old page, both within the scope of "restyle this exact block," not new features: (1) ticket rows in the board are now real `<Link href="/dashboard/tickets/{id}">` elements — the old version rendered plain, non-interactive `<div>`s with no way to reach a ticket's detail page from here at all; (2) the "back" and "no project" fallback buttons are plain buttons matching the rest of the redesigned dashboard instead of the marketing `<Button>` component.

- [ ] **Step 4: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/ticketBadgeStyles.ts apps/web/src/components/MilestoneTracker.tsx apps/web/src/app/dashboard/projects/[slug]/page.tsx
git commit -m "fix: restyle project detail page and milestone tracker onto brand tokens, add Updates feed"
```

---

### Task 3: Restyle the tickets list page (`/dashboard/tickets`)

**Files:**
- Modify: `apps/web/src/app/dashboard/tickets/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `ticketStatusBadgeClass` from `apps/web/src/lib/ticketBadgeStyles.ts` (Task 2). `GET /api/tickets` (unchanged, already scoped to the caller).
- Produces: nothing consumed by a later task — leaf page.

- [ ] **Step 1: Replace `apps/web/src/app/dashboard/tickets/page.tsx` entirely**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ticketStatusBadgeClass } from "@/lib/ticketBadgeStyles";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string };
  createdAt: string;
}

export default function ClientTicketsPage() {
  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetchWithAuth("/api/tickets");
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets);
        }
      } catch (err) {
        console.error("Failed to load tickets", err);
      } finally {
        setLoading(false);
      }
    }
    void loadTickets();
  }, [fetchWithAuth]);

  if (loading) {
    return <div className="p-8 text-foreground/50">Loading tickets...</div>;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-foreground/50 transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Back to Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">Your Support Tickets</h1>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/tickets/new")}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Ticket
        </button>
      </div>

      <div className="grid gap-3">
        {tickets.length === 0 ? (
          <div className="rounded-xl border border-glass-border bg-surface p-12 text-center">
            <p className="text-foreground/50">No tickets submitted yet. Have a bug or a feature request?</p>
            <button
              type="button"
              onClick={() => router.push("/dashboard/tickets/new")}
              className="mt-6 rounded-full border border-glass-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-glass-bg hover:text-foreground"
            >
              Create your first ticket
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/tickets/${ticket.id}`}
              className="group flex flex-col justify-between gap-4 rounded-xl border border-glass-border bg-surface p-6 transition-colors hover:border-accent/40 sm:flex-row sm:items-center"
            >
              <div>
                <div className="mb-1 flex items-center gap-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ticketStatusBadgeClass(ticket.status)}`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-xs text-foreground/40">{ticket.project.name}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                  {ticket.title}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-foreground/40">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                <span className="rounded-full border border-glass-border px-4 py-1.5 text-xs font-semibold text-foreground/70 transition-colors group-hover:bg-glass-bg">
                  View
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/tickets/page.tsx
git commit -m "fix: restyle client tickets list page onto brand tokens"
```

---

### Task 4: Restyle the ticket detail page chrome (`/dashboard/tickets/[id]`)

**Files:**
- Modify: `apps/web/src/app/dashboard/tickets/[id]/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `ticketStatusBadgeClass`, `ticketPriorityBadgeClass` from `apps/web/src/lib/ticketBadgeStyles.ts` (Task 2). `CommentThread` component (`apps/web/src/components/tickets/CommentThread.tsx`, unmodified — already on-brand, same props as before: `ticketId`, `initialComments`). `GET /api/tickets/:id` (unchanged).
- Produces: nothing consumed by a later task — leaf page.

- [ ] **Step 1: Replace `apps/web/src/app/dashboard/tickets/[id]/page.tsx` entirely**

```tsx
"use client";

import { useEffect, useState } from "react";
import type { TicketComment } from "@illustriober/shared";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Clock, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CommentThread } from "@/components/tickets/CommentThread";
import { ticketPriorityBadgeClass, ticketStatusBadgeClass } from "@/lib/ticketBadgeStyles";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string };
  createdAt: string;
  comments: TicketComment[];
}

export default function ClientTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetchWithAuth(`/api/tickets/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTicket(data.ticket);
        } else if (res.status === 403) {
          router.replace("/dashboard/tickets");
        }
      } catch (err) {
        console.error("Failed to load ticket", err);
      } finally {
        setLoading(false);
      }
    }
    void loadTicket();
  }, [id, fetchWithAuth, router]);

  if (loading) {
    return <div className="p-8 text-foreground/50">Loading ticket...</div>;
  }
  if (!ticket) return null;

  return (
    <div className="flex flex-col gap-6 p-8">
      <Link
        href="/dashboard/tickets"
        className="inline-flex w-fit items-center gap-1 text-xs font-medium text-foreground/50 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        Back to Tickets
      </Link>

      <div>
        <div className="mb-2 flex items-center gap-3">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${ticketStatusBadgeClass(ticket.status)}`}
          >
            {ticket.status}
          </span>
          <span className="text-xs font-bold uppercase tracking-tighter text-foreground/40">{ticket.type}</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">{ticket.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-glass-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-glass-border pb-3">
              <Briefcase className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/60">Context</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Project</p>
                <p className="mt-0.5 text-base font-medium text-foreground">{ticket.project.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Priority</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ticketPriorityBadgeClass(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-glass-border bg-surface p-8">
            <div className="mb-6 flex items-center gap-2 border-b border-glass-border pb-4">
              <Info className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-lg font-bold text-foreground">Issue Description</h2>
            </div>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/70">
              {ticket.description}
            </p>

            <div className="mt-10 border-t border-glass-border pt-6">
              <p className="flex items-center gap-2 text-xs text-foreground/40">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Submitted on{" "}
                {new Date(ticket.createdAt).toLocaleString(undefined, {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <CommentThread ticketId={ticket.id} initialComments={ticket.comments} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build the web workspace**

Run: `npm run build --workspace apps/web`
Expected: builds cleanly, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/src/app/dashboard/tickets/[id]/page.tsx"
git commit -m "fix: restyle client ticket detail page chrome onto brand tokens"
```
