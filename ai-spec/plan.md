# Project Initialization Plan — Illustriober Creatives

This plan outlines the steps to initialize the core foundation of the Illustriober Creatives platform, focusing on the first three logical phases: **Project Setup**, **Public Website**, and **Auth System**.

## User Review Required

> [!IMPORTANT]
> **Git Exclusion**: As requested, all documentation files beginning with `0*.md` and `AGENT_INSTRUCTIONS.md` will be added to `.gitignore`. They will remain in your local workspace but will not be tracked or pushed to GitHub.

> [!NOTE]
> **Infrastructure Step**: "Phase 0: Infrastructure" in the original plan includes domain registration and VPS setup. This plan focuses on the *code* initialization. I assume you will handle the manual server provisioning, or I can provide scripts for it later.

## Proposed Changes

### Monorepo Foundation

Create the root structure using npm workspaces to manage the frontend, backend, and shared packages efficiently.

#### [NEW] [.gitignore](file:///Users/apple/Claude/Personal/illustriober-cr/.gitignore)
- Ignore `node_modules`, `.next`, `dist`, `.env`.
- Ignore the guide markdown files: `0*.md`, `AGENT_INSTRUCTIONS.md`, and the `Inspirations/` directory.

#### [NEW] [package.json](file:///Users/apple/Claude/Personal/illustriober-cr/package.json)
- Define `workspaces`: `["apps/*", "packages/*"]`.
- Root scripts for development and building.

---

### Phase 0: App Initialization

Bootstrap the primary applications defined in the tech stack.

#### [NEW] [apps/web](file:///Users/apple/Claude/Personal/illustriober-cr/apps/web)
- Initialize Next.js 14+ (App Router) with TypeScript and Tailwind CSS.
- Configure `shadcn/ui` and basic folder structure (`components/`, `lib/`, `app/`).

#### [NEW] [apps/api](file:///Users/apple/Claude/Personal/illustriober-cr/apps/api)
- Initialize Express with TypeScript.
- Set up Prisma ORM with the initial schema from `03_DATABASE_SCHEMA.md`.
- Basic route structure (`src/routes`, `src/controllers`, `src/middleware`).

#### [NEW] [packages/shared](file:///Users/apple/Claude/Personal/illustriober-cr/packages/shared)
- A TypeScript package for shared Zod schemas (e.g., Enquiry validation) and common types.

---

### Phase 1 & 2: Skeleton Preparation

Set up the scaffolding for the public site and auth system to be ready for immediate development.

#### [MODIFY] [apps/web/app/page.tsx](file:///Users/apple/Claude/Personal/illustriober-cr/apps/web/app/page.tsx)
- Implementation of a clean Hero section as per the DESIGN_SYSTEM.md.

#### [NEW] [apps/api/src/routes/auth.ts](file:///Users/api/src/routes/auth.ts)
- Skeleton endpoints for login, signup, and logout.

## Open Questions

- **Monorepo Tooling**: Would you prefer **Turborepo** for orchestration, or are simple **npm workspaces** sufficient for now? (I recommend npm workspaces for simplicity as requested "no over-engineering").
- **Database**: Do you have a local PostgreSQL instance running for me to run migrations against, or should I just set up the schema and wait for the VPS?

## Verification Plan

### Automated Tests
- `npm run lint` across the workspace.
- `npx prisma validate` to ensure the schema is correct.

### Manual Verification
- Verify that `git status` shows the documentation files as untracked/ignored.
- Run `npm run dev` in both `apps/web` and `apps/api` to ensure they start correctly.
