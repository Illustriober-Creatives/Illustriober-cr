# Design Spec: Dashboard Platform Redesign

**Authorized autonomously.** The user requested this overnight, explicitly delegating scope decisions ("brainstorm this and add them whatever you will find useful," "build and add every feature needed there autonomously") and will not be available to answer clarifying questions until morning. Every judgment call below is made on that basis and documented with its rationale for the morning brief — nothing here was rubber-stamped without a reason.

## 1. Problem Statement

Screenshots taken tonight (logged in as a real admin and a real client, `/admin` and `/dashboard`) confirm two classes of problem:

**Bugs (not style preferences):**
- The marketing `Navbar` and `Footer` are rendered unconditionally in the root layout (`apps/web/src/app/layout.tsx`), so they wrap `/dashboard/*` and `/admin/*` too. Both authenticated areas are sandwiched between a floating pill nav and a black marketing footer, with dead whitespace between the app content and the footer because the admin shell's `h-screen` flex box doesn't account for the chrome above/below it.
- The client dashboard (`apps/web/src/app/dashboard/page.tsx`, `dashboard/tickets/page.tsx`, `dashboard/projects/[slug]/page.tsx`) still uses hardcoded dark-theme classes (`text-white`, `bg-zinc-900/50`, `border-zinc-800`) left over from before the site's "warm editorial minimalism" redesign. Against the now-cream page background, headings render **white-on-white — genuinely invisible**, and empty-state boxes render as a broken flat gray. This is an accessibility defect, confirmed visually, not a subjective complaint.

**Real gaps against the user's ask:**
- Admin dashboard (built earlier tonight) is functionally solid — KPI strip, live ticket queue, activity feed all work — but has no personalized welcome header, a bare sidebar, and no operational features beyond tickets/enquiries/projects: no user management, no way to reset a user's password, no profile view, no company settings, no internal task list.
- Client dashboard is a single centered card with no real navigation, no metrics, and a milestone tracker that's already wired to real data (`Milestone` model, `MilestoneTracker.tsx`) but never gets updated by anyone, because there's no admin UI to post progress.

## 2. What Already Exists (don't rebuild)

Grounded by reading the actual schema and routes tonight, not assumed:

- **Design tokens are already correct.** `--background: #F4EFE5`, `--foreground: #171717`, `--surface: #FFFDF8`, `--accent: #D96800` (globals.css). The admin dashboard built tonight already uses these correctly — its problem is missing chrome/features, not wrong colors.
- **Password reset already works end-to-end** for self-service: `POST /api/auth/forgot-password` + `POST /api/auth/reset-password`, backed by `PasswordResetToken`. What's missing is an *admin-triggered* version (an admin sending a reset link on a user's behalf) and a *self-service change* (already-logged-in user changing their known password) — neither exists yet.
- **`Milestone` model is already wired for reads**: `GET /api/projects/:slug` includes milestones, `MilestoneTracker.tsx` renders them. Nothing can create or update one — no admin route exists.
- **`Notification` model exists and is completely unused** — no route, no UI. Built for exactly the "work updates" need.
- **`Message` model exists and is completely unused** — project-scoped, `receiverId: null` = broadcast to the whole project. Built for exactly a project update/announcement feed.
- **`File` model exists but requires Cloudinary** (`url`, `publicId` fields assume it). No Cloudinary credentials are configured in this environment — file upload UI is explicitly **out of scope** tonight; wiring it up blind without credentials to test against would ship something unverifiable.
- Admin already has `GET /api/admin/clients` (list of CLIENT users, no detail/edit/deactivate).
- No `Task`, `CompanyProfile`, or user-management/profile-edit endpoints exist anywhere. These are genuinely new.

## 3. Scope Decisions (the "why you thought I needed them")

| Ask | Decision | Why |
|---|---|---|
| "navigation bar should be removed" | Conditional chrome: root layout stops rendering `Navbar`/`Footer` unconditionally; a route-aware wrapper hides them for `/dashboard/*` and `/admin/*` only | Confirmed root cause via code read, not assumption. Login/register/forgot-password keep the marketing chrome — not called out as broken, lower risk to leave alone. |
| "full width app on the screen" | New shared `DashboardShell` (sidebar + topbar + full-width content) used by both `/admin` and `/dashboard` | One component, two role-specific nav configs — avoids building two divergent shells that drift apart. |
| "admin should have metrics thing like welcome illustriober" | Personalized welcome header on both dashboards ("Welcome, {firstName}"), plus admin KPI strip (already built) surfaced under it | Matches the client dashboard's own existing (currently invisible) "Welcome, {firstName}" pattern — making both consistent rather than inventing a new convention. |
| "user management" | Admin: list all users (CLIENT + ADMIN), view detail (their projects/tickets), toggle `isActive` (already a schema field, never exposed), invite/create | `isActive` already exists on `User` and is checked nowhere in login logic yet either — worth wiring both the check and the toggle together. |
| "password reset" | Admin-triggered reset (reuses the existing forgot-password token flow, admin clicks "Send reset link" for a user) — not an admin setting a password directly, which would mean the admin learns the user's new password | Reusing the existing, already-tested token/email flow is safer and less code than a parallel "set password directly" path, and avoids an admin ever knowing a client's password. |
| "profile view" | Self-service profile page (view/edit name, phone) + self-service change-password (requires current password) for both roles | Every authenticated user needs this regardless of role; building it once at `/dashboard/profile` and `/admin/profile` (shared component) covers both asks in one feature. |
| "work updates" | Two mechanisms, both reusing unused schema: (1) admin can add/update `Milestone`s on a project, visible on the client's project page (already has a renderer); (2) admin can post a broadcast `Message` as a project update, shown in a new "Updates" feed on the client's project page, and creates a `Notification` | Milestones = structured progress ("Design phase: complete"). Messages = narrative updates ("Shipped the new checkout flow today"). Both were designed into the schema already and both map to real, distinct client-facing value. |
| "task list feature for the company" | New `Task` model (admin-only, internal — not client-facing), simple list/board (`TODO`/`IN_PROGRESS`/`DONE`), no relation to client Tickets | Explicitly ambiguous in the request. Interpreted as an internal ops todo list (e.g. "renew domain," "follow up with client X") since the existing `Ticket` model already covers client-facing support/bug/feature requests — a second client-facing system would duplicate it. This is the one deliberate schema migration this phase adds. |
| "company profile" | New singleton `CompanyProfile` model + admin-only settings page: business name, contact email, phone, address | Ambiguous between "the studio's own settings" and "each client's company info." Chose studio settings: `User`/`Project` have no company field for clients today, and adding one would be a bigger, riskier schema change to existing hot-path models for a use case never mentioned again in the request. A studio settings singleton is small, additive, and immediately useful (can seed future invoice/email templates). |
| "beautiful landing page energy" | Apply the same display-serif headline + eyebrow-label + generous whitespace pattern from the homepage hero to dashboard headers; keep dense data (tables, KPI cards) compact per the existing admin design constraints already documented | Consistency with `docs/PROJECT-HANDOVER.md`'s existing design language rather than inventing a new one. |

**Explicitly deferred (with reasons, not silently dropped):**
- File uploads/deliverables UI — needs Cloudinary credentials not present in this environment; building against an untestable integration would ship unverified code.
- Real-time notifications via the existing Socket.IO infrastructure (in-app toast when a notification arrives) — the `Notification` model gets full CRUD and a UI list this phase; wiring it into the realtime layer is a natural follow-up but doubles this phase's realtime surface area for a "nice to have" (a bell icon with an unread count that requires a page load to update is still a complete, working feature).
- Company-profile-per-client (as opposed to studio-wide) — see table above.
- Avatar upload — depends on the same deferred file-upload capability.

## 4. Architecture

### 4.1 App Shell

- `apps/web/src/app/layout.tsx`: remove the unconditional `<Navbar />`/`<Footer />`. Add a new client component `apps/web/src/components/SiteChrome.tsx` that reads `usePathname()` and renders `<Navbar/>{children}<Footer/>` for marketing/auth routes, or bare `{children}` for `/dashboard` and `/admin` routes. Chosen over a route-group file-tree reorganization (moving every marketing page under a `(marketing)/` folder) because it's a single new file with zero risk of breaking existing route paths, appropriate for unattended overnight work.
- New `apps/web/src/components/dashboard/DashboardShell.tsx`: sidebar (branded, icon + label nav items, active-state highlighting) + topbar (welcome text, sign-out) + `<main>` content area, full viewport height, no dead space. Takes `role: "ADMIN" | "CLIENT"` and a `navItems` array as props so both dashboards share one implementation.
- `apps/admin/layout.tsx` and `apps/dashboard/layout.tsx` both adopt `DashboardShell`, replacing `AdminSidebar`/`AdminGuard`'s bespoke markup and the client dashboard's centered-card pattern.

### 4.2 Client Dashboard Redesign

- Home (`/dashboard`): welcome header (fixed contrast bug — `text-foreground`, not `text-white`), stat row (active projects, open tickets), project cards (real data, on-brand), recent activity note.
- Project detail (`/dashboard/projects/[slug]`): same visual system as the admin dashboard (bg-surface cards, border-glass-border, text-accent), milestone tracker restyled, new "Updates" feed section (Messages, newest first), ticket board restyled.
- Tickets list/detail: restyle the list page; the ticket *detail* page's `CommentThread` is already on-brand (built in PR #74) — only the page chrome around it needs restyling.
- New: `/dashboard/profile` — view/edit name & phone, change password.

### 4.3 Admin Dashboard Redesign

- Sidebar: icons (lucide-react, matching the rest of the app), "Dashboard" nav entry already added tonight, add "Users," "Tasks," "Company," "Profile."
- Dashboard home: welcome header above the existing KPI strip/queue/activity panel.
- New: `/admin/users` (list + detail + deactivate + reset-password), `/admin/tasks` (internal task list), `/admin/company` (studio settings), `/admin/profile`.
- Project detail page (`/admin/projects/[slug]`, doesn't exist yet): milestone management (add/update status) + post a project update (Message) + existing ticket visibility.

### 4.4 New API Surface

All new routes follow this repo's existing patterns (`authenticate` + `requireRoles`, Zod validation, vitest+supertest coverage).

- `PATCH /api/users/me` — update own `firstName`/`lastName`/`phone`.
- `POST /api/users/me/password` — change own password (current + new, both required).
- `GET /api/admin/users` — list all users, filter by role/search (extends the existing `/api/admin/clients` pattern to cover admins too).
- `GET /api/admin/users/:id` — user detail + their projects/tickets summary.
- `PATCH /api/admin/users/:id` — toggle `isActive`.
- `POST /api/admin/users/:id/reset-password` — triggers the existing forgot-password email flow for that user.
- `POST /api/admin/projects/:slug/milestones`, `PATCH /api/admin/milestones/:id` — milestone CRUD.
- `POST /api/admin/projects/:slug/updates` — post a broadcast Message + create a Notification for the client.
- `GET /api/projects/:slug/updates` — client reads the update feed (Messages where `receiverId IS NULL`).
- `GET /api/notifications`, `PATCH /api/notifications/:id/read` — both roles.
- `GET/PATCH /api/admin/company` — company profile singleton.
- `GET/POST/PATCH/DELETE /api/admin/tasks` — internal task CRUD.

### 4.5 Schema Changes

One migration, additive only (no changes to existing columns):
```prisma
enum TaskStatus { TODO IN_PROGRESS DONE }

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?    @db.Text
  status      TaskStatus @default(TODO)
  dueDate     DateTime?
  createdById String
  createdBy   User       @relation(fields: [createdById], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([status])
}

model CompanyProfile {
  id           String   @id @default("singleton")
  name         String
  tagline      String?
  contactEmail String
  phone        String?
  address      String?
  updatedAt    DateTime @updatedAt
}
```

## 5. Execution Plan

Phased, each phase following brainstorm (done above) → plan → subagent-driven-development (implementer + reviewer per task) → phase-scoped review, same discipline as tonight's admin dashboard PR:

1. **App shell** — conditional chrome + `DashboardShell` (blocks all visual work, do first)
2. **Client dashboard core** — home, profile, password change (fixes the invisible-text bug immediately)
3. **Client project detail + updates feed**
4. **Admin dashboard polish** — welcome header, sidebar icons
5. **Admin user management**
6. **Admin project detail + milestones/updates**
7. **Admin company profile + task list** (the one schema migration)
8. **Final whole-branch review + full verification + morning brief**

Continuing on the already-open `feat/admin-dashboard` branch / PR #74 rather than opening a new branch — this work directly modifies files from tonight's session and the user has not yet merged or reviewed that PR, so there is nothing to conflict with. This will be called out clearly in the morning brief in case they'd rather split it.

## 6. Testing

- API: vitest+supertest for every new route (auth gating, validation, the actual business logic), following existing patterns exactly (mocked Prisma via `vi.hoisted`).
- Web: no test suite in this repo (per `CLAUDE.md`) — verified via real login + Playwright screenshots at each phase boundary, the same technique used to find tonight's bugs, not just build/lint.
- Schema migration: `prisma migrate dev` locally against the real local Postgres (confirmed running), verified the app boots and the new tables are usable before considering the phase done.
