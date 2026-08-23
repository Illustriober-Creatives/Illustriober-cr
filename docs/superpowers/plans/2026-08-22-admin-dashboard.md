# Admin Operational Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/admin` from a redirect into a real operational dashboard: KPI strip by ticket status, a filterable/searchable/paginated ticket queue, and a live-updating recent-activity panel, backed by one new aggregate API endpoint and a realtime protocol extension.

**Architecture:** A new `GET /api/admin/dashboard` endpoint supplies status counts and a 24h activity feed; `GET /api/tickets` gains backward-compatible filters/pagination for the queue. The existing per-ticket Socket.IO rooms gain a new admin-wide room (`admin:tickets`, auto-joined on connect for admin sockets) and two new events (`ticket:created`, `ticket:status-changed`); the existing comment event is additionally broadcast there. One `useAdminRealtime` hook opens a single socket connection per dashboard page load and fans live events out as props to three independent, self-fetching components.

**Tech Stack:** Express + Prisma + Zod (API), Next.js App Router + React + Tailwind (web), Socket.IO, vitest + supertest (API tests only — no frontend test suite in this repo).

**Spec:** `docs/superpowers/specs/2026-08-22-admin-dashboard-design.md`

## Global Constraints

- No Prisma migration in this phase — no schema changes (`docs/superpowers/specs/2026-08-22-admin-dashboard-design.md` §3, §9).
- `GET /api/tickets` with no query params must return a byte-identical response shape to today (protects `/dashboard/tickets` for clients) — only add fields/behavior when new query params are present.
- Internal comments (`isInternal: true`) must never reach a non-admin socket or a client-facing HTTP response.
- Exactly one Socket.IO connection per admin dashboard page load — no component below `admin/page.tsx` opens its own socket.
- No ticket assignment work of any kind (`assignedToId` stays untouched) — out of scope this phase.
- Reuse existing design tokens only: `bg-surface`, `bg-background`, `text-foreground` (with `/NN` opacity suffixes), `border-glass-border`, `text-accent`, `bg-accent/10`. No new tokens.
- Web tasks have no test suite to extend (per `CLAUDE.md`: "There are no frontend tests"). Verify web tasks with `npm run build --workspace apps/web` and `npm run lint --workspace apps/web` instead of a test run.
- Run `gitnexus_impact({ target, direction: "upstream" })` before editing any existing symbol named in a task, and `gitnexus_detect_changes({ scope: "staged" })` before every commit, per `CLAUDE.md`.
- All commands below assume the repo root `/home/itsriober/illustriober-cr/Illustriober-cr` as cwd unless a task says otherwise.

---

### Task 1: Shared types and validation schema

**Files:**
- Modify: `packages/shared/src/index.ts` (append to end of file, after the existing `TicketComment` type)

**Interfaces:**
- Produces (consumed by every later task):
  - `adminTicketQuerySchema: ZodObject` — parses `{ status?, priority?, search?, page?, limit? }`
  - `type AdminTicketQuery = z.infer<typeof adminTicketQuerySchema>`
  - `type AdminDashboardStatusCounts = { OPEN: number; IN_REVIEW: number; IN_PROGRESS: number; RESOLVED: number }`
  - `type RecentActivityEntry` — discriminated union on `kind: "ticket_created" | "comment_created" | "status_changed"` (the server, Task 5, only ever produces the first two — no persisted status-change history exists; the client, Task 10, synthesizes `"status_changed"` entries locally from live socket events)
  - `type AdminDashboardSummary = { statusCounts: AdminDashboardStatusCounts; recentActivity: RecentActivityEntry[] }`
  - `type AdminTicketCreatedEvent = { id, title, type, priority, status, projectName, submitterName, createdAt }` (all `string`)
  - `type AdminTicketStatusChangedEvent = { id, title, projectName, previousStatus, status, updatedAt }` (all `string`)

- [ ] **Step 1: Append the schema and types**

Add to the end of `packages/shared/src/index.ts`:

```ts
export const adminTicketQuerySchema = z.object({
  status: z
    .enum(["OPEN", "IN_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  search: z.string().trim().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type AdminTicketQuery = z.infer<typeof adminTicketQuerySchema>;

export type AdminDashboardStatusCounts = {
  OPEN: number;
  IN_REVIEW: number;
  IN_PROGRESS: number;
  RESOLVED: number;
};

export type RecentActivityEntry =
  | {
      id: string;
      kind: "ticket_created";
      ticketId: string;
      ticketTitle: string;
      projectName: string;
      actorName: string;
      createdAt: string;
    }
  | {
      id: string;
      kind: "comment_created";
      ticketId: string;
      ticketTitle: string;
      projectName: string;
      actorName: string;
      isInternal: boolean;
      createdAt: string;
    }
  | {
      id: string;
      kind: "status_changed";
      ticketId: string;
      ticketTitle: string;
      projectName: string;
      previousStatus: string;
      status: string;
      createdAt: string;
    };

export type AdminDashboardSummary = {
  statusCounts: AdminDashboardStatusCounts;
  recentActivity: RecentActivityEntry[];
};

export type AdminTicketCreatedEvent = {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  projectName: string;
  submitterName: string;
  createdAt: string;
};

export type AdminTicketStatusChangedEvent = {
  id: string;
  title: string;
  projectName: string;
  previousStatus: string;
  status: string;
  updatedAt: string;
};
```

- [ ] **Step 2: Build the shared package to verify it compiles**

Run: `npm run build --workspace @illustriober/shared`
Expected: builds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/index.ts
git commit -m "feat(shared): add admin dashboard types and ticket query schema"
```

---

### Task 2: Extend `GET /api/tickets` with filters and pagination

**Files:**
- Modify: `apps/api/src/routes/tickets.ts` (the `router.get("/", ...)` handler, currently lines 33-62)
- Test: `apps/api/src/routes/tickets.test.ts`

**Interfaces:**
- Consumes: `adminTicketQuerySchema` from Task 1 (`@illustriober/shared`)
- Produces: `GET /api/tickets` accepts optional query params `status`, `priority`, `search`, `page`, `limit`. With no params, the response is exactly `{ success, tickets }` with the same per-ticket shape as today (no `comments` field — preserves the Global Constraint that the no-params response is byte-identical for `/dashboard/tickets`). When `page` or `limit` is present, the response is `{ success, tickets, pagination: { page, limit, total, totalPages } }` and each ticket additionally includes `comments: [{ createdAt: string }]` (0 or 1 items, most recent first) for "latest activity" display — this richer shape only applies to the paginated (admin queue) path.

- [ ] **Step 1: Run gitnexus impact analysis before editing**

Run `gitnexus_impact({ target: "GET /api/tickets", direction: "upstream" })` (or the handler function if the tool resolves it by symbol name). Report the blast radius. Stop and warn if risk is HIGH or CRITICAL before continuing — the client dashboard (`/dashboard/tickets`) and the new-ticket form both call this endpoint unfiltered, so confirm they're not miscategorized as breaking.

- [ ] **Step 2: Write the failing tests**

Add to `apps/api/src/routes/tickets.test.ts`, inside the existing `describe("GET /api/tickets", ...)` block (after the two existing `it` blocks, before its closing `});`):

```ts
    it("returns no pagination field when no page/limit are given", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.body.pagination).toBeUndefined();
      expect(prismaMock.ticket.count).not.toHaveBeenCalled();
    });

    it("applies status and priority filters", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/tickets?status=IN_PROGRESS&priority=HIGH")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "IN_PROGRESS", priority: "HIGH" }),
        })
      );
    });

    it("applies a search filter across title, project name, and client name", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/tickets?search=login")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: "login", mode: "insensitive" } },
              { project: { name: { contains: "login", mode: "insensitive" } } },
              { submittedBy: { firstName: { contains: "login", mode: "insensitive" } } },
              { submittedBy: { lastName: { contains: "login", mode: "insensitive" } } },
            ],
          }),
        })
      );
    });

    it("paginates and returns pagination metadata when page/limit are given", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([{ id: "t1" }]);
      prismaMock.ticket.count.mockResolvedValue(45);

      const res = await request(app)
        .get("/api/tickets?page=2&limit=20")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 })
      );
      expect(res.body.pagination).toEqual({ page: 2, limit: 20, total: 45, totalPages: 3 });
    });
```

Also add `count: vi.fn()` to the `ticket` entry of the hoisted `prismaMock` at the top of the file, so it reads:

```ts
  ticket: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd apps/api && npx vitest run src/routes/tickets.test.ts`
Expected: the 4 new tests FAIL (no `pagination` field logic, no filters, no `count` call exists yet).

- [ ] **Step 4: Implement the filters and pagination**

In `apps/api/src/routes/tickets.ts`, change the shared import line (currently line 7-12) to add `adminTicketQuerySchema`:

```ts
import {
  adminTicketQuerySchema,
  createCommentSchema,
  createTicketSchema,
  updateTicketSchema,
  type TicketComment,
} from "@illustriober/shared";
```

Replace the entire `GET /api/tickets` handler (currently lines 33-62) with:

```ts
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { projectId } = req.query;
    const query = adminTicketQuerySchema.parse(req.query);

    const where: any = {};

    if (role !== "ADMIN") {
      where.project = { clientId: userId };
    }

    if (projectId && typeof projectId === "string") {
      where.projectId = projectId;
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { project: { name: { contains: query.search, mode: "insensitive" } } },
        { submittedBy: { firstName: { contains: query.search, mode: "insensitive" } } },
        { submittedBy: { lastName: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    const baseInclude = {
      project: { select: { name: true, slug: true } },
      submittedBy: { select: { firstName: true, lastName: true } },
    };

    if (query.page || query.limit) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 20;
      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          include: {
            ...baseInclude,
            comments: {
              orderBy: { createdAt: "desc" as const },
              take: 1,
              select: { createdAt: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.ticket.count({ where }),
      ]);

      res.json({
        success: true,
        tickets,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
      return;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: baseInclude,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, tickets });
  })
);
```

- [ ] **Step 5: Run all ticket route tests to verify they pass**

Run: `cd apps/api && npx vitest run src/routes/tickets.test.ts`
Expected: all tests PASS, including the two pre-existing isolation tests (unchanged behavior for the no-filter case).

- [ ] **Step 6: Run gitnexus change detection**

Run `gitnexus_detect_changes({ scope: "staged" })` after staging (next step) and confirm only `tickets.ts` and `tickets.test.ts` show as affected, with no unexpected flow changes.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/routes/tickets.ts apps/api/src/routes/tickets.test.ts
git commit -m "feat(api): add filters, search, and pagination to GET /api/tickets"
```

---

### Task 3: Extend the realtime protocol (admin room + new events)

**Files:**
- Modify: `apps/api/src/lib/realtime.ts`
- Test: `apps/api/src/lib/realtime.test.ts`

**Interfaces:**
- Consumes: `AdminTicketCreatedEvent`, `AdminTicketStatusChangedEvent` from Task 1 (`@illustriober/shared`)
- Produces (consumed by Task 4):
  - `emitTicketCreated(event: AdminTicketCreatedEvent): void`
  - `emitTicketStatusChanged(event: AdminTicketStatusChangedEvent): void`
  - `emitTicketComment(comment: TicketComment): void` — unchanged signature, now also reaches the `admin:tickets` room
  - New server→client socket events: `"ticket:created"`, `"ticket:status-changed"` (in addition to the existing `"ticket:comment-created"`)

- [ ] **Step 1: Run gitnexus impact analysis before editing**

Run `gitnexus_impact({ target: "emitTicketComment", direction: "upstream" })` and `gitnexus_impact({ target: "initializeRealtime", direction: "upstream" })`. Report blast radius; stop and warn on HIGH/CRITICAL before continuing.

- [ ] **Step 2: Write the failing tests**

Add to `apps/api/src/lib/realtime.test.ts`, inside the `describe("ticket realtime rooms", ...)` block, after the existing `"delivers internal notes to admins but never to clients"` test:

```ts
  it("auto-joins admin sockets to the admin:tickets room without an explicit join call", async () => {
    const url = await startServer();
    const admin = await connect(url, accessToken("admin_1", "ADMIN"));
    const client = await connect(url, accessToken("client_1", "CLIENT"));

    const createdEvent: AdminTicketCreatedEvent = {
      id: "ticket_9",
      title: "New feature request",
      type: "FEATURE",
      priority: "MEDIUM",
      status: "OPEN",
      projectName: "Studio Site",
      submitterName: "Jane Doe",
      createdAt: "2026-08-22T09:00:00.000Z",
    };

    const adminReceived = new Promise<AdminTicketCreatedEvent>((resolve) => {
      admin.once("ticket:created", resolve);
    });
    const clientReceived = vi.fn();
    client.once("ticket:created", clientReceived);

    emitTicketCreated(createdEvent);

    await expect(adminReceived).resolves.toEqual(createdEvent);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(clientReceived).not.toHaveBeenCalled();
  });

  it("broadcasts ticket:status-changed only to the admin room", async () => {
    const url = await startServer();
    const admin = await connect(url, accessToken("admin_1", "ADMIN"));

    const statusEvent: AdminTicketStatusChangedEvent = {
      id: "ticket_9",
      title: "New feature request",
      projectName: "Studio Site",
      previousStatus: "OPEN",
      status: "IN_PROGRESS",
      updatedAt: "2026-08-22T09:05:00.000Z",
    };

    const adminReceived = new Promise<AdminTicketStatusChangedEvent>((resolve) => {
      admin.once("ticket:status-changed", resolve);
    });

    emitTicketStatusChanged(statusEvent);

    await expect(adminReceived).resolves.toEqual(statusEvent);
  });

  it("delivers comments to an admin who has not joined that specific ticket room", async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({
      project: { clientId: "client_1" },
    });
    const url = await startServer();
    const admin = await connect(url, accessToken("admin_1", "ADMIN"));
    // Note: admin does NOT call joinTicket here — only the admin:tickets room membership applies.

    const adminReceived = new Promise<TicketComment>((resolve) => {
      admin.once("ticket:comment-created", resolve);
    });

    emitTicketComment(internalComment);

    await expect(adminReceived).resolves.toEqual(internalComment);
  });
```

Add the new imports at the top of the file, alongside the existing `TicketComment` import:

```ts
import type {
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
  TicketComment,
} from "@illustriober/shared";
```

And extend the existing import from `"./realtime"` to include the new functions:

```ts
import {
  emitTicketComment,
  emitTicketCreated,
  emitTicketStatusChanged,
  initializeRealtime,
  type RealtimeServer,
} from "./realtime";
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd apps/api && npx vitest run src/lib/realtime.test.ts`
Expected: FAIL — `emitTicketCreated`/`emitTicketStatusChanged` are not exported yet, and the third test times out (admin never receives the comment without room membership).

- [ ] **Step 4: Implement the admin room, new events, and emit helpers**

In `apps/api/src/lib/realtime.ts`:

Add to the top-of-file import (alongside the existing `TicketComment` import):

```ts
import type { AdminTicketCreatedEvent, AdminTicketStatusChangedEvent, TicketComment } from "@illustriober/shared";
```

Add a room constant near the existing `publicTicketRoom`/`internalTicketRoom` helpers:

```ts
const ADMIN_ROOM = "admin:tickets";
```

Extend `ServerToClientEvents`:

```ts
interface ServerToClientEvents {
  "ticket:comment-created": (comment: TicketComment) => void;
  "ticket:created": (ticket: AdminTicketCreatedEvent) => void;
  "ticket:status-changed": (ticket: AdminTicketStatusChangedEvent) => void;
}
```

In `io.on("connection", (socket) => { ... })`, as the first line inside the callback (before the existing `socket.on("ticket:join", ...)` handler):

```ts
  io.on("connection", (socket) => {
    if (socket.data.user.role === "ADMIN") {
      void socket.join(ADMIN_ROOM);
    }

    socket.on("ticket:join", async (payload, acknowledge) => {
```

Replace `emitTicketComment` with:

```ts
export function emitTicketComment(comment: TicketComment): void {
  if (!realtimeServer) return;

  const room = comment.isInternal
    ? internalTicketRoom(comment.ticketId)
    : publicTicketRoom(comment.ticketId);
  realtimeServer.to(room).to(ADMIN_ROOM).emit("ticket:comment-created", comment);
}
```

(Using chained `.to(room).to(ADMIN_ROOM)` — Socket.IO unions the room sets and delivers exactly once per matching socket, so an admin who is both in the specific ticket room and the admin room doesn't get a duplicate event.)

Add two new exported functions at the end of the file:

```ts
export function emitTicketCreated(event: AdminTicketCreatedEvent): void {
  if (!realtimeServer) return;
  realtimeServer.to(ADMIN_ROOM).emit("ticket:created", event);
}

export function emitTicketStatusChanged(event: AdminTicketStatusChangedEvent): void {
  if (!realtimeServer) return;
  realtimeServer.to(ADMIN_ROOM).emit("ticket:status-changed", event);
}
```

- [ ] **Step 5: Run the realtime tests to verify they pass**

Run: `cd apps/api && npx vitest run src/lib/realtime.test.ts`
Expected: all tests PASS, including the pre-existing internal-notes test.

- [ ] **Step 6: Run gitnexus change detection and commit**

Run `gitnexus_detect_changes({ scope: "staged" })`, confirm only `realtime.ts` and `realtime.test.ts` are affected, then:

```bash
git add apps/api/src/lib/realtime.ts apps/api/src/lib/realtime.test.ts
git commit -m "feat(api): broadcast ticket creation and status changes to an admin realtime room"
```

---

### Task 4: Wire ticket creation and status-change events into the routes

**Files:**
- Modify: `apps/api/src/routes/tickets.ts` (the `POST /` handler and the `PATCH /:id` handler)
- Test: `apps/api/src/routes/tickets.test.ts`

**Interfaces:**
- Consumes: `emitTicketCreated`, `emitTicketStatusChanged` from Task 3 (`apps/api/src/lib/realtime`)

- [ ] **Step 1: Run gitnexus impact analysis before editing**

Run `gitnexus_impact({ target: "POST /api/tickets", direction: "upstream" })` and the same for the `PATCH /api/tickets/:id` handler. Stop and warn on HIGH/CRITICAL.

- [ ] **Step 2: Write the failing tests**

Add to `apps/api/src/routes/tickets.test.ts`. First, add this mock near the top of the file, right after the existing `vi.mock("../lib/prisma", ...)` line:

```ts
const realtimeMock = vi.hoisted(() => ({
  emitTicketComment: vi.fn(),
  emitTicketCreated: vi.fn(),
  emitTicketStatusChanged: vi.fn(),
}));

vi.mock("../lib/realtime", () => realtimeMock);
```

Then, inside `describe("POST /api/tickets", ...)`, add:

```ts
    it("emits ticket:created after a successful creation", async () => {
      prismaMock.project.findUnique.mockResolvedValue({ id: "p1", clientId: "c123", name: "Studio Site" });
      prismaMock.ticket.create.mockResolvedValue({
        id: "t1",
        title: "Bug",
        type: "BUG",
        priority: "MEDIUM",
        status: "OPEN",
        createdAt: new Date("2026-08-22T10:00:00.000Z"),
      });
      prismaMock.user.findUnique.mockResolvedValue({ firstName: "Jane", lastName: "Doe" });

      await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${clientToken("c123")}`)
        .send({ title: "Bug", description: "Something broke big time", type: "BUG", projectId: "p1" });

      expect(realtimeMock.emitTicketCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "t1",
          title: "Bug",
          projectName: "Studio Site",
          submitterName: "Jane Doe",
        })
      );
    });
```

Add a new `describe("PATCH /api/tickets/:id", ...)` block after the existing `describe("GET /api/tickets/:id", ...)` block:

```ts
  describe("PATCH /api/tickets/:id", () => {
    it("emits ticket:status-changed when status changes", async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: "t1",
        status: "OPEN",
        title: "Bug",
        project: { clientId: "c123", name: "Studio Site" },
      });
      prismaMock.ticket.update.mockResolvedValue({
        id: "t1",
        title: "Bug",
        status: "IN_PROGRESS",
        updatedAt: new Date("2026-08-22T11:00:00.000Z"),
      });

      await request(app)
        .patch("/api/tickets/t1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ status: "IN_PROGRESS" });

      expect(realtimeMock.emitTicketStatusChanged).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "t1",
          previousStatus: "OPEN",
          status: "IN_PROGRESS",
          projectName: "Studio Site",
        })
      );
    });

    it("does not emit ticket:status-changed when status is unchanged", async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: "t1",
        status: "OPEN",
        title: "Bug",
        project: { clientId: "c123", name: "Studio Site" },
      });
      prismaMock.ticket.update.mockResolvedValue({
        id: "t1",
        title: "Bug",
        status: "OPEN",
        updatedAt: new Date("2026-08-22T11:00:00.000Z"),
      });

      await request(app)
        .patch("/api/tickets/t1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ priority: "HIGH" });

      expect(realtimeMock.emitTicketStatusChanged).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd apps/api && npx vitest run src/routes/tickets.test.ts`
Expected: FAIL — the route doesn't call `emitTicketCreated`/`emitTicketStatusChanged` yet.

- [ ] **Step 4: Implement the emit calls**

In `apps/api/src/routes/tickets.ts`, change the existing realtime import (currently `import { emitTicketComment } from "../lib/realtime";`) to:

```ts
import { emitTicketComment, emitTicketCreated, emitTicketStatusChanged } from "../lib/realtime";
```

In the `POST /` handler, replace:

```ts
    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority || "MEDIUM",
        projectId: data.projectId,
        submittedById: userId,
      },
    });

    res.status(201).json({ success: true, ticket });
```

with:

```ts
    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority || "MEDIUM",
        projectId: data.projectId,
        submittedById: userId,
      },
    });

    const submitter = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    emitTicketCreated({
      id: ticket.id,
      title: ticket.title,
      type: ticket.type,
      priority: ticket.priority,
      status: ticket.status,
      projectName: project.name,
      submitterName: submitter ? `${submitter.firstName} ${submitter.lastName}` : "Unknown",
      createdAt: ticket.createdAt.toISOString(),
    });

    res.status(201).json({ success: true, ticket });
```

In the `PATCH /:id` handler, replace:

```ts
    const updated = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...data,
        resolvedAt: data.status === "RESOLVED" ? new Date() : undefined,
      },
    });

    res.json({ success: true, ticket: updated });
```

with:

```ts
    const updated = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...data,
        resolvedAt: data.status === "RESOLVED" ? new Date() : undefined,
      },
    });

    if (data.status && data.status !== ticket.status) {
      emitTicketStatusChanged({
        id: updated.id,
        title: updated.title,
        projectName: ticket.project.name,
        previousStatus: ticket.status,
        status: updated.status,
        updatedAt: updated.updatedAt.toISOString(),
      });
    }

    res.json({ success: true, ticket: updated });
```

- [ ] **Step 5: Run all ticket route tests to verify they pass**

Run: `cd apps/api && npx vitest run src/routes/tickets.test.ts`
Expected: all tests PASS, including every test added in Task 2.

- [ ] **Step 6: Run gitnexus change detection and commit**

Run `gitnexus_detect_changes({ scope: "staged" })`, then:

```bash
git add apps/api/src/routes/tickets.ts apps/api/src/routes/tickets.test.ts
git commit -m "feat(api): broadcast ticket creation and status changes to the admin dashboard"
```

---

### Task 5: `GET /api/admin/dashboard` aggregate endpoint

**Files:**
- Modify: `apps/api/src/routes/admin.ts` (append a new route)
- Test: `apps/api/src/routes/admin.test.ts`

**Interfaces:**
- Consumes: `AdminDashboardStatusCounts`, `RecentActivityEntry`, `AdminDashboardSummary` from Task 1 (`@illustriober/shared`)
- Produces: `GET /api/admin/dashboard` → `{ success: true, statusCounts, recentActivity }`, admin-only.

- [ ] **Step 1: Run gitnexus impact analysis before editing**

Run `gitnexus_impact({ target: "adminRoutes", direction: "upstream" })` (or the `admin.ts` router file). Stop and warn on HIGH/CRITICAL.

- [ ] **Step 2: Write the failing tests**

In `apps/api/src/routes/admin.test.ts`, extend the hoisted `prismaMock` to add ticket and comment mocks:

```ts
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  enquiry: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  inviteToken: { create: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
  ticket: { groupBy: vi.fn(), findMany: vi.fn() },
  comment: { findMany: vi.fn() },
}));
```

Add a new `describe` block at the end of the file, before the final closing of the outer `describe("admin enquiry routes", ...)` — i.e. as its own top-level `describe`, after that block's closing `});`:

```ts
describe("GET /api/admin/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("rejects non-admin requests", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${clientToken()}`);
    expect(res.status).toBe(403);
  });

  it("aggregates status counts and merges recent activity, sorted and capped at 20", async () => {
    prismaMock.ticket.groupBy.mockResolvedValue([
      { status: "OPEN", _count: 3 },
      { status: "IN_PROGRESS", _count: 1 },
      { status: "CLOSED", _count: 9 },
    ]);
    prismaMock.ticket.findMany.mockResolvedValue([
      {
        id: "t1",
        title: "Login broken",
        createdAt: new Date("2026-08-22T08:00:00.000Z"),
        project: { name: "Studio Site" },
        submittedBy: { firstName: "Jane", lastName: "Doe" },
      },
    ]);
    prismaMock.comment.findMany.mockResolvedValue([
      {
        id: "c1",
        ticketId: "t1",
        isInternal: false,
        createdAt: new Date("2026-08-22T09:00:00.000Z"),
        ticket: { title: "Login broken", project: { name: "Studio Site" } },
        author: { firstName: "Ada", lastName: "Admin" },
      },
    ]);

    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.statusCounts).toEqual({ OPEN: 3, IN_REVIEW: 0, IN_PROGRESS: 1, RESOLVED: 0 });
    expect(res.body.recentActivity).toHaveLength(2);
    expect(res.body.recentActivity[0]).toMatchObject({ kind: "comment_created", ticketId: "t1" });
    expect(res.body.recentActivity[1]).toMatchObject({ kind: "ticket_created", ticketId: "t1" });
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd apps/api && npx vitest run src/routes/admin.test.ts`
Expected: FAIL with 404 (route doesn't exist yet).

- [ ] **Step 4: Implement the route**

In `apps/api/src/routes/admin.ts`, add to the top import block:

```ts
import type { AdminDashboardStatusCounts, RecentActivityEntry } from "@illustriober/shared";
```

Append this route before the final `export default router;`:

```ts
// GET /api/admin/dashboard
router.get(
  "/dashboard",
  ...adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [statusGroups, recentTickets, recentComments] = await Promise.all([
      prisma.ticket.groupBy({ by: ["status"], _count: true }),
      prisma.ticket.findMany({
        where: { createdAt: { gte: since } },
        select: {
          id: true,
          title: true,
          createdAt: true,
          project: { select: { name: true } },
          submittedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.comment.findMany({
        where: { createdAt: { gte: since } },
        select: {
          id: true,
          ticketId: true,
          isInternal: true,
          createdAt: true,
          ticket: { select: { title: true, project: { select: { name: true } } } },
          author: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const statusCounts: AdminDashboardStatusCounts = {
      OPEN: 0,
      IN_REVIEW: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
    };
    for (const group of statusGroups) {
      if (group.status in statusCounts) {
        statusCounts[group.status as keyof AdminDashboardStatusCounts] = group._count;
      }
    }

    const ticketActivity: RecentActivityEntry[] = recentTickets.map((ticket) => ({
      id: ticket.id,
      kind: "ticket_created",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      projectName: ticket.project.name,
      actorName: `${ticket.submittedBy.firstName} ${ticket.submittedBy.lastName}`,
      createdAt: ticket.createdAt.toISOString(),
    }));

    const commentActivity: RecentActivityEntry[] = recentComments.map((comment) => ({
      id: comment.id,
      kind: "comment_created",
      ticketId: comment.ticketId,
      ticketTitle: comment.ticket.title,
      projectName: comment.ticket.project.name,
      actorName: `${comment.author.firstName} ${comment.author.lastName}`,
      isInternal: comment.isInternal,
      createdAt: comment.createdAt.toISOString(),
    }));

    const recentActivity = [...ticketActivity, ...commentActivity]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 20);

    res.json({ success: true, statusCounts, recentActivity });
  })
);
```

- [ ] **Step 5: Run the admin route tests to verify they pass**

Run: `cd apps/api && npx vitest run src/routes/admin.test.ts`
Expected: all tests PASS.

- [ ] **Step 6: Run the full API test suite**

Run: `npm run test --workspace apps/api`
Expected: all suites PASS (69+ tests, matching the count noted in the handover, plus everything added in Tasks 2-5).

- [ ] **Step 7: Run gitnexus change detection and commit**

Run `gitnexus_detect_changes({ scope: "staged" })`, then:

```bash
git add apps/api/src/routes/admin.ts apps/api/src/routes/admin.test.ts
git commit -m "feat(api): add GET /api/admin/dashboard aggregate endpoint"
```

---

### Task 6: Extend the web realtime client's event types

**Files:**
- Modify: `apps/web/src/lib/realtime.ts`

**Interfaces:**
- Consumes: `AdminTicketCreatedEvent`, `AdminTicketStatusChangedEvent` from Task 1 (`@illustriober/shared`)
- Produces: `TicketSocket` (the exported type) now types `.on("ticket:created", ...)` and `.on("ticket:status-changed", ...)` in addition to the existing comment event.

- [ ] **Step 1: Update the type import and `ServerToClientEvents`**

In `apps/web/src/lib/realtime.ts`, change:

```ts
import type { TicketComment } from "@illustriober/shared";
```

to:

```ts
import type {
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
  TicketComment,
} from "@illustriober/shared";
```

Change:

```ts
interface ServerToClientEvents {
  "ticket:comment-created": (comment: TicketComment) => void;
}
```

to:

```ts
interface ServerToClientEvents {
  "ticket:comment-created": (comment: TicketComment) => void;
  "ticket:created": (ticket: AdminTicketCreatedEvent) => void;
  "ticket:status-changed": (ticket: AdminTicketStatusChangedEvent) => void;
}
```

No other changes in this file — `createTicketSocket()` stays the same.

- [ ] **Step 2: Typecheck via build**

Run: `npm run build --workspace apps/web`
Expected: succeeds (this file has no other consumers yet, so this is purely a type-surface change).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/realtime.ts
git commit -m "feat(web): type the admin realtime events on the shared ticket socket"
```

---

### Task 7: `useAdminRealtime` hook

**Files:**
- Create: `apps/web/src/lib/useAdminRealtime.ts`

**Interfaces:**
- Consumes: `createTicketSocket` from Task 6 (`apps/web/src/lib/realtime`); `AdminTicketCreatedEvent`, `AdminTicketStatusChangedEvent`, `TicketComment` from `@illustriober/shared`
- Produces (consumed by Task 12):
  ```ts
  export type AdminRealtimeConnectionState = "connecting" | "live" | "offline";
  export interface UseAdminRealtimeHandlers {
    onTicketCreated?: (event: AdminTicketCreatedEvent) => void;
    onStatusChanged?: (event: AdminTicketStatusChangedEvent) => void;
    onComment?: (comment: TicketComment) => void;
  }
  export function useAdminRealtime(handlers: UseAdminRealtimeHandlers): { connectionState: AdminRealtimeConnectionState }
  ```
  One socket connection per mount; no explicit room join needed (the server auto-joins admin sockets to `admin:tickets` on connect, per Task 3).

- [ ] **Step 1: Create the hook**

```ts
"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
  TicketComment,
} from "@illustriober/shared";
import { createTicketSocket } from "@/lib/realtime";

export type AdminRealtimeConnectionState = "connecting" | "live" | "offline";

export interface UseAdminRealtimeHandlers {
  onTicketCreated?: (event: AdminTicketCreatedEvent) => void;
  onStatusChanged?: (event: AdminTicketStatusChangedEvent) => void;
  onComment?: (comment: TicketComment) => void;
}

export function useAdminRealtime(handlers: UseAdminRealtimeHandlers): {
  connectionState: AdminRealtimeConnectionState;
} {
  const [connectionState, setConnectionState] = useState<AdminRealtimeConnectionState>("connecting");
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = createTicketSocket();

    socket.on("connect", () => setConnectionState("live"));
    socket.on("disconnect", () => setConnectionState("connecting"));
    socket.on("connect_error", () => setConnectionState("offline"));
    socket.on("ticket:created", (event) => handlersRef.current.onTicketCreated?.(event));
    socket.on("ticket:status-changed", (event) => handlersRef.current.onStatusChanged?.(event));
    socket.on("ticket:comment-created", (comment) => handlersRef.current.onComment?.(comment));
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return { connectionState };
}
```

The handlers are read through a ref (updated on every render, but not in the effect's dependency array) so the socket connects exactly once per mount even though `page.tsx` will pass new inline handler closures on every render.

- [ ] **Step 2: Typecheck via build and lint**

Run: `npm run build --workspace apps/web && npm run lint --workspace apps/web`
Expected: both succeed. The hook isn't imported anywhere yet, so this only checks the file compiles standalone — full integration is verified in Task 12.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/useAdminRealtime.ts
git commit -m "feat(web): add useAdminRealtime hook for the admin dashboard socket connection"
```

---

### Task 8: `KpiStrip` component

**Files:**
- Create: `apps/web/src/components/admin/dashboard/KpiStrip.tsx`

**Interfaces:**
- Consumes: `useAuth().fetchWithAuth` from `@/contexts/AuthContext`; `AdminDashboardStatusCounts`, `AdminTicketCreatedEvent`, `AdminTicketStatusChangedEvent` from `@illustriober/shared`
- Produces (consumed by Task 12):
  ```ts
  interface KpiStripProps {
    ticketCreatedSeq?: { seq: number; event: AdminTicketCreatedEvent } | null;
    statusChangedSeq?: { seq: number; event: AdminTicketStatusChangedEvent } | null;
  }
  export function KpiStrip(props: KpiStripProps): JSX.Element
  ```
  Fetches `GET /api/admin/dashboard` on mount for `statusCounts`; adjusts counts locally when `ticketCreatedSeq`/`statusChangedSeq` change (does not refetch on every event).

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminDashboardStatusCounts,
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
} from "@illustriober/shared";
import { AlertCircle, CircleDot, Loader2, RotateCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_LABELS: Record<keyof AdminDashboardStatusCounts, string> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

const EMPTY_COUNTS: AdminDashboardStatusCounts = { OPEN: 0, IN_REVIEW: 0, IN_PROGRESS: 0, RESOLVED: 0 };

interface KpiStripProps {
  ticketCreatedSeq?: { seq: number; event: AdminTicketCreatedEvent } | null;
  statusChangedSeq?: { seq: number; event: AdminTicketStatusChangedEvent } | null;
}

export function KpiStrip({ ticketCreatedSeq, statusChangedSeq }: KpiStripProps) {
  const { fetchWithAuth } = useAuth();
  const [counts, setCounts] = useState<AdminDashboardStatusCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load ticket counts");
      const data = await res.json();
      setCounts(data.statusCounts);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load ticket counts");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!ticketCreatedSeq) return;
    setCounts((current) => {
      const base = current ?? EMPTY_COUNTS;
      const status = ticketCreatedSeq.event.status as keyof AdminDashboardStatusCounts;
      if (!(status in base)) return base;
      return { ...base, [status]: base[status] + 1 };
    });
  }, [ticketCreatedSeq]);

  useEffect(() => {
    if (!statusChangedSeq) return;
    setCounts((current) => {
      const base = current ?? EMPTY_COUNTS;
      const next = { ...base };
      const { previousStatus, status } = statusChangedSeq.event;
      const prevKey = previousStatus as keyof AdminDashboardStatusCounts;
      const nextKey = status as keyof AdminDashboardStatusCounts;
      if (prevKey in next) next[prevKey] = Math.max(0, next[prevKey] - 1);
      if (nextKey in next) next[nextKey] += 1;
      return next;
    });
  }, [statusChangedSeq]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-24 items-center justify-center rounded-xl border border-glass-border bg-surface"
          >
            <Loader2 className="h-5 w-5 animate-spin text-foreground/30" aria-hidden="true" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-glass-border bg-surface px-5 py-4 text-sm text-foreground/60">
        <span className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
          {error}
        </span>
        <button
          onClick={() => void load()}
          className="flex items-center gap-1.5 rounded-lg border border-glass-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-glass-bg"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  const safeCounts = counts ?? EMPTY_COUNTS;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {(Object.keys(STATUS_LABELS) as Array<keyof AdminDashboardStatusCounts>).map((status) => (
        <div key={status} className="rounded-xl border border-glass-border bg-surface px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/40">
            <CircleDot className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {STATUS_LABELS[status]}
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{safeCounts[status]}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck via build and lint**

Run: `npm run build --workspace apps/web && npm run lint --workspace apps/web`
Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/admin/dashboard/KpiStrip.tsx
git commit -m "feat(web): add admin dashboard KPI strip"
```

---

### Task 9: `TicketQueue` component

**Files:**
- Create: `apps/web/src/components/admin/dashboard/TicketQueue.tsx`

**Interfaces:**
- Consumes: `useAuth().fetchWithAuth`; `AdminTicketCreatedEvent`, `AdminTicketStatusChangedEvent`, `TicketComment` from `@illustriober/shared`
- Produces (consumed by Task 12):
  ```ts
  interface TicketQueueProps {
    ticketCreatedSeq?: { seq: number; event: AdminTicketCreatedEvent } | null;
    statusChangedSeq?: { seq: number; event: AdminTicketStatusChangedEvent } | null;
    commentSeq?: { seq: number; event: TicketComment } | null;
  }
  export function TicketQueue(props: TicketQueueProps): JSX.Element
  ```
  Owns its own filter/search/pagination state and fetches `GET /api/tickets` (from Task 2) accordingly. No assignee column (out of scope). Desktop table / mobile stacked cards, no horizontal overflow.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type {
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
  TicketComment,
} from "@illustriober/shared";
import { AlertCircle, Loader2, RotateCw, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface QueueTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string; slug: string };
  submittedBy: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
  comments: Array<{ createdAt: string }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TicketQueueProps {
  ticketCreatedSeq?: { seq: number; event: AdminTicketCreatedEvent } | null;
  statusChangedSeq?: { seq: number; event: AdminTicketStatusChangedEvent } | null;
  commentSeq?: { seq: number; event: TicketComment } | null;
}

const STATUS_OPTIONS = ["OPEN", "IN_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PAGE_SIZE = 20;

function statusColor(status: string) {
  switch (status) {
    case "OPEN": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "RESOLVED": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "CLOSED": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "IN_PROGRESS": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "IN_REVIEW": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "CRITICAL": return "text-red-500";
    case "HIGH": return "text-orange-500";
    case "MEDIUM": return "text-yellow-500";
    case "LOW": return "text-blue-500";
    default: return "text-zinc-500";
  }
}

function latestActivity(ticket: QueueTicket): string {
  const commentAt = ticket.comments[0]?.createdAt;
  if (!commentAt) return ticket.updatedAt;
  return Date.parse(commentAt) > Date.parse(ticket.updatedAt) ? commentAt : ticket.updatedAt;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function TicketQueue({ ticketCreatedSeq, statusChangedSeq, commentSeq }: TicketQueueProps) {
  const { fetchWithAuth } = useAuth();
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [status, priority, debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetchWithAuth(`/api/tickets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      setTickets(data.tickets);
      setPagination(data.pagination ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, status, priority, debouncedSearch, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!ticketCreatedSeq) return;
    setUnread((current) => new Set(current).add(ticketCreatedSeq.event.id));
  }, [ticketCreatedSeq]);

  useEffect(() => {
    if (!statusChangedSeq) return;
    const { id, status: nextStatus } = statusChangedSeq.event;
    setUnread((current) => new Set(current).add(id));
    setTickets((current) => current.map((ticket) => (ticket.id === id ? { ...ticket, status: nextStatus } : ticket)));
  }, [statusChangedSeq]);

  useEffect(() => {
    if (!commentSeq) return;
    setUnread((current) => new Set(current).add(commentSeq.event.ticketId));
  }, [commentSeq]);

  const clearUnread = useCallback((ticketId: string) => {
    setUnread((current) => {
      if (!current.has(ticketId)) return current;
      const next = new Set(current);
      next.delete(ticketId);
      return next;
    });
  }, []);

  const hasFilters = Boolean(status || priority || debouncedSearch);

  return (
    <section className="rounded-xl border border-glass-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-glass-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, client, or project"
            aria-label="Search tickets"
            className="w-full rounded-lg border border-glass-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-accent/60"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
          className="rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          aria-label="Filter by priority"
          className="rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
        >
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-12 text-sm text-foreground/40" aria-busy="true">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading tickets…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 p-12 text-center">
          <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          <p className="text-sm text-foreground/60">{error}</p>
          <button
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-lg border border-glass-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-glass-bg"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center text-sm text-foreground/40">
          {hasFilters ? "No tickets match these filters." : "No tickets found."}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-glass-border bg-glass-bg text-xs uppercase tracking-wider text-foreground/40">
                <tr>
                  <th className="px-6 py-3 font-semibold">Ticket</th>
                  <th className="px-6 py-3 font-semibold">Project</th>
                  <th className="px-6 py-3 font-semibold">Client</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Priority</th>
                  <th className="px-6 py-3 font-semibold">Latest activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-glass-bg transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        onClick={() => clearUnread(ticket.id)}
                        className="flex items-center gap-2 font-medium text-foreground hover:text-accent"
                      >
                        {unread.has(ticket.id) && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread activity" />
                        )}
                        {ticket.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-foreground/40">{ticket.type}</p>
                    </td>
                    <td className="px-6 py-4 text-foreground/60">{ticket.project.name}</td>
                    <td className="px-6 py-4 text-foreground/60">
                      {ticket.submittedBy.firstName} {ticket.submittedBy.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                    </td>
                    <td className="px-6 py-4 text-foreground/40">{formatTime(latestActivity(ticket))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-glass-border md:hidden">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                onClick={() => clearUnread(ticket.id)}
                className="flex flex-col gap-2 p-4"
              >
                <div className="flex items-center gap-2">
                  {unread.has(ticket.id) && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread activity" />
                  )}
                  <span className="font-medium text-foreground">{ticket.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`font-bold ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                  <span>{ticket.project.name}</span>
                </div>
                <p className="text-xs text-foreground/40">{formatTime(latestActivity(ticket))}</p>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-glass-border px-4 py-3 text-xs text-foreground/50">
              <span>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} tickets
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.page <= 1}
                  className="rounded-lg border border-glass-border px-3 py-1.5 font-medium text-foreground/70 hover:bg-glass-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-lg border border-glass-border px-3 py-1.5 font-medium text-foreground/70 hover:bg-glass-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Typecheck via build and lint**

Run: `npm run build --workspace apps/web && npm run lint --workspace apps/web`
Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/admin/dashboard/TicketQueue.tsx
git commit -m "feat(web): add admin ticket queue with filters, search, and pagination"
```

---

### Task 10: `ActivityPanel` component

**Files:**
- Create: `apps/web/src/components/admin/dashboard/ActivityPanel.tsx`

**Interfaces:**
- Consumes: `useAuth().fetchWithAuth`; `RecentActivityEntry`, `AdminTicketCreatedEvent`, `AdminTicketStatusChangedEvent`, `TicketComment` from `@illustriober/shared`
- Produces (consumed by Task 12):
  ```ts
  interface ActivityPanelProps {
    ticketCreatedSeq?: { seq: number; event: AdminTicketCreatedEvent } | null;
    statusChangedSeq?: { seq: number; event: AdminTicketStatusChangedEvent } | null;
    commentSeq?: { seq: number; event: TicketComment } | null;
  }
  export function ActivityPanel(props: ActivityPanelProps): JSX.Element
  ```
  Fetches `GET /api/admin/dashboard` for the initial `recentActivity` list (24h window, from Task 5), then prepends live entries built from socket events (capped at 20). Live comment entries render without a specific ticket title (the live comment payload doesn't carry one) — the initial DB-backed load does have real titles. `statusChangedSeq` entries are synthesized entirely client-side (`kind: "status_changed"`) since the server never persists status history — this is the one `RecentActivityEntry` variant this component produces that the API in Task 5 never sends on initial load.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import type {
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
  RecentActivityEntry,
  TicketComment,
} from "@illustriober/shared";
import { AlertCircle, Loader2, MessageCircle, PlusCircle, RefreshCcw, RotateCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ActivityPanelProps {
  ticketCreatedSeq?: { seq: number; event: AdminTicketCreatedEvent } | null;
  statusChangedSeq?: { seq: number; event: AdminTicketStatusChangedEvent } | null;
  commentSeq?: { seq: number; event: TicketComment } | null;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function activityIcon(kind: RecentActivityEntry["kind"]) {
  if (kind === "ticket_created") return PlusCircle;
  if (kind === "status_changed") return RefreshCcw;
  return MessageCircle;
}

function activityText(entry: RecentActivityEntry): ReactNode {
  if (entry.kind === "ticket_created") {
    return (
      <>
        <span className="font-medium text-foreground">{entry.actorName}</span> opened{" "}
        {entry.ticketTitle ? <span className="font-medium">{entry.ticketTitle}</span> : "a ticket"}
      </>
    );
  }
  if (entry.kind === "status_changed") {
    return (
      <>
        {entry.ticketTitle ? <span className="font-medium">{entry.ticketTitle}</span> : "A ticket"} moved from{" "}
        {entry.previousStatus.replace("_", " ")} to {entry.status.replace("_", " ")}
      </>
    );
  }
  return (
    <>
      <span className="font-medium text-foreground">{entry.actorName}</span> commented on{" "}
      {entry.ticketTitle ? <span className="font-medium">{entry.ticketTitle}</span> : "a ticket"}
      {entry.isInternal && <span className="ml-2 text-[10px] font-bold uppercase text-amber-600">Internal</span>}
    </>
  );
}

export function ActivityPanel({ ticketCreatedSeq, statusChangedSeq, commentSeq }: ActivityPanelProps) {
  const { fetchWithAuth } = useAuth();
  const [entries, setEntries] = useState<RecentActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load recent activity");
      const data = await res.json();
      setEntries(data.recentActivity ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load recent activity");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void load();
  }, [load]);

  const prepend = useCallback((entry: RecentActivityEntry) => {
    setEntries((current) => [entry, ...current].slice(0, 20));
  }, []);

  useEffect(() => {
    if (!ticketCreatedSeq) return;
    const event = ticketCreatedSeq.event;
    prepend({
      id: event.id,
      kind: "ticket_created",
      ticketId: event.id,
      ticketTitle: event.title,
      projectName: event.projectName,
      actorName: event.submitterName,
      createdAt: event.createdAt,
    });
  }, [ticketCreatedSeq, prepend]);

  useEffect(() => {
    if (!statusChangedSeq) return;
    const event = statusChangedSeq.event;
    prepend({
      id: `${event.id}-${event.updatedAt}`,
      kind: "status_changed",
      ticketId: event.id,
      ticketTitle: event.title,
      projectName: event.projectName,
      previousStatus: event.previousStatus,
      status: event.status,
      createdAt: event.updatedAt,
    });
  }, [statusChangedSeq, prepend]);

  useEffect(() => {
    if (!commentSeq) return;
    const comment = commentSeq.event;
    prepend({
      id: comment.id,
      kind: "comment_created",
      ticketId: comment.ticketId,
      ticketTitle: "",
      projectName: "",
      actorName: `${comment.author.firstName} ${comment.author.lastName}`,
      isInternal: comment.isInternal,
      createdAt: comment.createdAt,
    });
  }, [commentSeq, prepend]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-xl border border-glass-border bg-surface p-8 text-sm text-foreground/40"
        aria-busy="true"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading activity…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-glass-border bg-surface p-8 text-center">
        <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
        <p className="text-sm text-foreground/60">{error}</p>
        <button
          onClick={() => void load()}
          className="flex items-center gap-1.5 rounded-lg border border-glass-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-glass-bg"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-glass-border bg-surface">
      <h2 className="border-b border-glass-border px-5 py-4 text-sm font-bold uppercase tracking-widest text-foreground/70">
        Recent activity
      </h2>
      {entries.length === 0 ? (
        <p className="p-8 text-center text-sm text-foreground/40">Nothing in the last 24 hours.</p>
      ) : (
        <ul className="divide-y divide-glass-border">
          {entries.map((entry) => {
            const Icon = activityIcon(entry.kind);
            return (
              <li key={`${entry.kind}-${entry.id}`} className="px-5 py-3">
                <Link href={`/admin/tickets/${entry.ticketId}`} className="flex items-start gap-3 hover:text-accent">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="flex-1 text-sm text-foreground/80">{activityText(entry)}</span>
                  <time dateTime={entry.createdAt} className="shrink-0 text-xs text-foreground/40">
                    {formatTime(entry.createdAt)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck via build and lint**

Run: `npm run build --workspace apps/web && npm run lint --workspace apps/web`
Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/admin/dashboard/ActivityPanel.tsx
git commit -m "feat(web): add admin dashboard recent activity panel"
```

---

### Task 11: Add the Dashboard nav entry to `AdminSidebar`

**Files:**
- Modify: `apps/web/src/components/admin/AdminSidebar.tsx`

**Interfaces:** None beyond the existing component's own render output.

- [ ] **Step 1: Run gitnexus impact analysis before editing**

Run `gitnexus_impact({ target: "AdminSidebar", direction: "upstream" })`. Stop and warn on HIGH/CRITICAL.

- [ ] **Step 2: Update the nav list and active-state logic**

In `apps/web/src/components/admin/AdminSidebar.tsx`, change:

```ts
const NAV = [
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tickets", label: "Tickets" },
];
```

to:

```ts
const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tickets", label: "Tickets" },
];
```

And change the active-state calculation inside the `NAV.map(...)`:

```tsx
const active = pathname === href || pathname.startsWith(`${href}/`);
```

to:

```tsx
const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
```

(Without this, every `/admin/*` page would also highlight "Dashboard" as active, since `/admin` is now a prefix of every other nav entry's path too.)

- [ ] **Step 3: Typecheck via build and lint**

Run: `npm run build --workspace apps/web && npm run lint --workspace apps/web`
Expected: both succeed.

- [ ] **Step 4: Run gitnexus change detection and commit**

Run `gitnexus_detect_changes({ scope: "staged" })`, then:

```bash
git add apps/web/src/components/admin/AdminSidebar.tsx
git commit -m "feat(web): add Dashboard entry to the admin sidebar nav"
```

---

### Task 12: Compose the dashboard page

**Files:**
- Modify: `apps/web/src/app/admin/page.tsx` (currently a 5-line redirect to `/admin/enquiries`)

**Interfaces:**
- Consumes: `useAdminRealtime` (Task 7), `KpiStrip` (Task 8), `TicketQueue` (Task 9), `ActivityPanel` (Task 10)

- [ ] **Step 1: Run gitnexus impact analysis before editing**

Run `gitnexus_impact({ target: "AdminPage", direction: "upstream" })` (the `/admin` page component). Confirm nothing depends on it redirecting — `ProtectedRoute.tsx` and `middleware.ts` only reference the `/admin` path itself, not a further redirect target, so this should be low risk; still, report what the tool finds and stop if it flags HIGH/CRITICAL.

- [ ] **Step 2: Replace the redirect with the dashboard**

Replace the entire contents of `apps/web/src/app/admin/page.tsx` with:

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

This is the only place in the page tree that calls `useAdminRealtime` — `KpiStrip`, `TicketQueue`, and `ActivityPanel` never open their own socket, satisfying the "exactly one connection" constraint.

- [ ] **Step 3: Typecheck via build and lint**

Run: `npm run build --workspace apps/web && npm run lint --workspace apps/web`
Expected: both succeed.

- [ ] **Step 4: Manual verification with the dev server**

Start both dev servers (`npm run dev` from repo root, or the two workspace commands separately). Log in as an admin user and visit `/admin`. Verify:
- The page loads the dashboard (no longer redirects to `/admin/enquiries`).
- The sidebar highlights only "Dashboard" on `/admin`, and only "Tickets" on `/admin/tickets` (not both).
- KPI strip shows real counts; filters and search on the ticket queue work and don't cause horizontal scrolling at a 375px-wide viewport.
- Open a second browser session as a client (or use the existing ticket detail page) and post a comment or change a ticket's status as an admin from a second tab — confirm the KPI strip, queue row, and activity panel on the first admin tab update without a page refresh.
- Loading and error states render correctly (e.g., temporarily rename an endpoint or throttle the network to confirm retry buttons work), then revert any temporary changes.

- [ ] **Step 5: Run gitnexus change detection and commit**

Run `gitnexus_detect_changes({ scope: "staged" })`, confirm the affected symbols/flows match this task's scope, then:

```bash
git add apps/web/src/app/admin/page.tsx
git commit -m "feat(web): build the admin operational dashboard at /admin"
```

---

### Task 13: Full verification pass

**Files:** None (verification only).

- [ ] **Step 1: Run the full build and test chain from `CLAUDE.md`**

```bash
npm run build --workspace packages/shared
npm run build --workspace apps/api
npm run test --workspace apps/api
npm run build --workspace apps/web
npm run lint --workspace apps/web
```

Expected: every command succeeds; the API test count should be at least the 69 tests noted in `.continue-here.md` plus everything added across Tasks 2, 4, and 5.

- [ ] **Step 2: Run a full-branch gitnexus change detection**

Run `gitnexus_detect_changes({ scope: "compare", base_ref: "main" })` and review that only the files touched across Tasks 1-12 are listed, with no unexpected execution-flow changes.

- [ ] **Step 3: Re-index GitNexus**

Run `npx gitnexus analyze` (the repo's post-commit hook should already have done this after each commit above; run it once more here as a final check) so the graph is current for whoever picks this up next.

- [ ] **Step 4: Report**

Summarize for the user, per `docs/PROJECT-HANDOVER.md`'s "Expected output from an agent": what changed and why, exact files touched, branch name and commit hashes, which verification commands ran and whether they passed, any warnings/assumptions/remaining limitations (in particular: no ticket-assignment work, no persisted status-change history before this session, unread state is session-only, `/admin/tickets` was left unconsolidated), and a visual QA note covering mobile/tablet/desktop. State explicitly whether the branch was pushed (per `CLAUDE.md`/`docs/PROJECT-HANDOVER.md`: do not push without explicit permission).

---

## Self-Review Notes

- **Spec coverage:** All of spec §4 (API), §5 (realtime), §6 (frontend) map to Tasks 1-12. §7 (testing) is covered by the test steps in Tasks 2-5 plus manual web verification in Task 12. §8 (GitNexus workflow) is a step in every editing task plus Task 13. §9 (out of scope) is respected — no task touches `assignedToId`, adds an audit-log table, touches `/admin/tickets`, or changes PM2 topology.
- **Placeholder scan:** no TBD/TODO markers; every code step is a complete, pasteable snippet.
- **Type consistency:** `AdminTicketCreatedEvent`/`AdminTicketStatusChangedEvent`/`RecentActivityEntry`/`AdminDashboardStatusCounts` are defined once in Task 1 and referenced with the same field names everywhere downstream (verified `previousStatus`/`status` naming matches between Task 3's emit helper, Task 4's call site, and Task 8/9's consumption). The `{ seq, event }` wrapper shape is used identically in Tasks 8, 9, 10, and 12.
