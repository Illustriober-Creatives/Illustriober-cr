# Design Spec: Admin Operational Dashboard

## 1. Problem Statement

`/admin` currently just redirects to `/admin/enquiries` — there is no real dashboard. Admins have no single place to see ticket volume by status, a filterable/searchable queue, or what changed recently, and no live indication of new activity without opening a specific ticket. This builds on the realtime ticket-comment work from PR #73 (`apps/api/src/lib/realtime.ts`, `apps/web/src/lib/realtime.ts`, `CommentThread.tsx`) and the existing admin surface (`AdminGuard`, `AdminSidebar`, `/admin/tickets`, `/admin/tickets/[id]`, `/admin/projects`, `/admin/enquiries`).

## 2. Current-State Findings (informing scope)

- `GET /api/tickets` (`apps/api/src/routes/tickets.ts`) returns the full unfiltered ticket list — no pagination, no status/priority filter, no search, no assignee resolution, no comment-derived "latest activity."
- `Ticket.assignedToId` (`apps/api/prisma/schema.prisma`) is a bare `String?` column with **no Prisma relation to `User`** — assignment is not wired end-to-end anywhere in the codebase.
- There is no audit/activity-log model. "Recent activity" cannot be reconstructed retroactively for status changes — only ticket creation (`Ticket.createdAt`) and comments (`Comment.createdAt`) are queryable after the fact.
- Realtime rooms (`apps/api/src/lib/realtime.ts`) are strictly per-ticket (`ticket:<id>` / `ticket:<id>:internal`), joined only when a client explicitly opens that ticket. No room exists that an admin is in by default.
- `GET /api/tickets` (unfiltered) is also consumed by the client-facing `/dashboard/tickets` page and the new-ticket form — any change must be additive/backward-compatible.
- No `StatCard`/`EmptyState`/`ErrorState` components exist yet in `apps/web/src/components`; they need to be built new, following the existing token vocabulary (`bg-surface`, `bg-background`, `text-foreground/40`, `border-glass-border`, `text-accent`, `bg-accent/10`).

## 3. Scope Decisions (confirmed with user)

| Decision | Choice | Why |
|---|---|---|
| Dashboard data source | New `GET /api/admin/dashboard` aggregate endpoint + extend `GET /api/tickets` with filters/pagination | Avoids fetching the entire ticket table into the browser; DB-side counts scale. |
| Assignment | Out of scope entirely for this phase | `assignedToId` has no relation; wiring it up is its own follow-up phase. Queue drops the assignee column rather than showing a permanently empty one. |
| Live activity for ticket creation/status change | Extend the socket protocol (new `admin:tickets` room, new events) | Chosen over polling; comments already have a working live path from PR #73, this extends the same connection/pattern to cover creation and status changes too. |
| "Recent" window | Last 24 hours | Applies to the activity panel query on the aggregate endpoint. |
| `/admin/tickets` (existing full table) | Left untouched this phase | Keeps the diff focused; consolidating it with the new queue component is a future improvement, not required now. |

**Known limitation to carry forward:** because there's no persisted status-change history, the activity panel can only show retroactive (page-load) entries for ticket creation and comments. A status-change entry appears only for changes that happen while a session is connected and receives the live socket event. This is intentional for this phase, not an oversight.

## 4. API Design

### 4.1 `GET /api/admin/dashboard` (new)

- `authenticate` + admin-only (403 for non-admin, consistent with existing route patterns).
- Response:
  ```ts
  {
    success: true,
    statusCounts: { OPEN: number, IN_REVIEW: number, IN_PROGRESS: number, RESOLVED: number },
    recentActivity: Array<{
      id: string;              // ticket id or comment id
      kind: "ticket_created" | "comment_created";
      ticketId: string;
      ticketTitle: string;
      projectName: string;
      actorName: string;       // submitter or comment author
      isInternal?: boolean;    // only present for kind: "comment_created"
      createdAt: string;       // ISO
    }>
  }
  ```
- `statusCounts`: `prisma.ticket.groupBy({ by: ["status"], _count: true })`, mapped into the four buckets (other statuses like `CLOSED`/`REJECTED` are not part of the KPI strip per the brief).
- `recentActivity`: two queries scoped to `createdAt >= now - 24h` — tickets (`select: id, title, project.name, submittedBy.firstName/lastName, createdAt`) and comments (`select: id, ticketId, ticket.title, ticket.project.name, author.firstName/lastName, isInternal, createdAt`) — merged in application code, sorted desc, capped at 20.

### 4.2 `GET /api/tickets` (extended, backward compatible)

- New optional query params, validated by a new shared Zod schema (`packages/shared`):
  - `status` (`TicketStatus`), `priority` (`TicketPriority`)
  - `search` (string; matches ticket title contains, or client first/last name contains, or project name contains — case-insensitive `OR`)
  - `page`, `limit` (positive integers; `limit` capped, e.g. max 100)
- **No params present → response is byte-identical to today's shape** (`{ success, tickets }`), so `/dashboard/tickets` and `new/page.tsx` are unaffected.
- **`page`/`limit` present → response gains `pagination: { page, limit, total, totalPages }`.**
- Each returned ticket additionally includes its most recent comment timestamp (`comments: { take: 1, orderBy: { createdAt: "desc" }, select: { createdAt: true } }`), so the queue can compute `latestActivity = max(ticket.updatedAt, comments[0]?.createdAt ?? ticket.createdAt)` — `ticket.updatedAt` alone does not change when a comment is added, so it would misrepresent "latest activity" on its own.
- Role-based row scoping (`project.clientId === userId` for non-admins) is unchanged.
- No changes related to `assignedToId`.

## 5. Realtime Protocol Extension

`apps/api/src/lib/realtime.ts`:

- On successful handshake auth, if `socket.data.user.role === "ADMIN"`, additionally `socket.join("admin:tickets")` — same connection, no new socket, no explicit client-side join call (unlike per-ticket rooms, which still require `ticket:join`).
- New server→client events, broadcast only to `admin:tickets`:
  - `ticket:created` — `{ id, title, type, priority, status, projectName, submitterName, createdAt }`
  - `ticket:status-changed` — `{ id, title, projectName, previousStatus, status, updatedAt }`
- `emitTicketComment` additionally broadcasts the existing `ticket:comment-created` payload to `admin:tickets` for every comment (internal or not) — safe, since only admins are ever members of that room, and internal comments already never reach client-facing rooms.
- New emit helpers `emitTicketCreated(...)` and `emitTicketStatusChanged(...)` (same module), called from `tickets.ts`:
  - `POST /` (ticket creation) — after the ticket is created, one small follow-up query for project name (client name already available from the auth'd user) before emitting.
  - `PATCH /:id` — only when `data.status` is present and differs from the ticket's prior status (not on every field edit).

## 6. Frontend

### 6.1 `apps/web/src/app/admin/page.tsx`

Stops redirecting; becomes the dashboard. Composed of new components under `apps/web/src/components/admin/dashboard/`:

- `KpiStrip.tsx` — 4 stat cards (OPEN / IN_REVIEW / IN_PROGRESS / RESOLVED) from `/api/admin/dashboard`, live-updated by socket events (increment/decrement counts locally on `ticket:created` / `ticket:status-changed` rather than refetching).
- `TicketQueue.tsx` — filters (status, priority), search input, pagination controls, table on desktop / stacked cards on mobile (no horizontal scroll, per design constraints in `docs/PROJECT-HANDOVER.md`). Fetches `/api/tickets` with query params. Columns: ticket/title+type, project, client, status, priority, latest activity (computed per §4.2), unread dot. No assignee column (§3).
- `ActivityPanel.tsx` — renders `recentActivity` from the aggregate endpoint on load, then prepends live entries constructed from the three socket events as they arrive during the session (deduped by id).
- A small hook (e.g. `useAdminRealtime`) that reuses the existing socket client (`apps/web/src/lib/realtime.ts`) — opens/reuses the connection (no new `ticket:join` needed for the admin room) and exposes the three events via callbacks.
- Unread indicator: a session-only (not persisted) `Set<ticketId>` populated by incoming socket events; a dot renders on matching queue rows; the set clears that ticket's entry when its detail page is navigated to. No read-cursor persistence in this phase, matching the earlier scope call.
- Each of the three sections (KPI strip, queue, activity panel) fetches and errors independently — its own loading/empty/error/retry UI, so one failing request doesn't blank the page.

### 6.2 `apps/web/src/components/admin/AdminSidebar.tsx`

Add a "Dashboard" nav entry as the first item, pointing at `/admin` (currently missing since `/admin` was only ever a redirect target, never a real page).

### 6.3 Shared package (`packages/shared/src/index.ts`)

- Zod schema for the admin ticket list query params (`status`, `priority`, `search`, `page`, `limit`).
- Types for the dashboard aggregate response (`AdminDashboardSummary`, `RecentActivityEntry`) and the two new socket event payloads, so API and web share one source of truth (matches existing pattern for `TicketComment`).

## 7. Testing Plan

**API (vitest + supertest, prisma mocked via `vi.hoisted`, following existing test patterns in `apps/api`):**
- `GET /api/admin/dashboard`: 401 unauthenticated, 403 non-admin, correct status-count aggregation, 24h activity-window boundary (item just inside vs. just outside the window), merge/sort/cap-at-20 behavior.
- `GET /api/tickets`: regression test asserting the no-params response is unchanged (protects `/dashboard/tickets`), plus filter/search/pagination correctness and role scoping unchanged for non-admins.
- Realtime: admin socket auto-joins `admin:tickets` on connect; non-admin socket does not; `ticket:created`, `ticket:status-changed`, and comment events reach `admin:tickets`; internal comments still never reach client-facing rooms — extending the existing realtime test file/pattern from PR #73.

**Web:** no frontend test suite exists in this repo (per `CLAUDE.md`). Verify manually via the dev server at mobile, tablet, and desktop widths — filters/search usable on mobile without horizontal overflow, live KPI/queue/activity updates observable across two sessions (one admin, one client action), loading/empty/error/retry states for each section, keyboard accessibility of filter/search controls.

## 8. GitNexus Workflow (per `CLAUDE.md`)

- `gitnexus_impact` before editing `GET /api/tickets` handler, `emitTicketComment`, `AdminSidebar`, and the `/admin` page — report blast radius, stop and warn on HIGH/CRITICAL.
- `gitnexus_detect_changes({ scope: "staged" })` before each commit.
- Re-run `npx gitnexus analyze` after committing (handled by the repo's post-commit hook).

## 9. Out of Scope (this phase)

- Ticket assignment (relation, UI, filtering by assignee).
- Persisted read-cursors / cross-session unread state.
- Persisted status-change history / audit log.
- Consolidating `/admin/tickets` with the new `TicketQueue` component.
- Any change to the PM2/production Socket.IO topology noted in the handover (`.continue-here.md`) — orthogonal to this feature.
