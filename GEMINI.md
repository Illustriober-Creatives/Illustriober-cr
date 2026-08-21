# GEMINI.md — Project Instructions

This file provides foundational guidance for Gemini CLI when working in the Illustriober Creatives Platform repository.

## Project Overview

**Illustriober Creatives Platform** is a full-stack monorepo designed for a digital studio's operations and public presence. It consists of a high-performance frontend, a robust API, and shared validation logic.

- **Architecture:** Monorepo using npm workspaces.
- **Frontend (`apps/web`):** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.
- **Backend (`apps/api`):** Express 5, TypeScript, Prisma ORM, PostgreSQL.
- **Shared Logic (`packages/shared`):** Zod schemas and TypeScript types.
- **Port Mapping:**
  - Web: `3000`
  - API: `4000`

## Core Workflows

### 1. Building and Running

**Root Commands:**
- `npm install`: Install dependencies for all workspaces.
- `npm run dev`: Start both Web and API dev servers in parallel.
- `npm run build`: Build all workspaces (Shared → API/Web).
- `npm run lint`: Run linting across the entire monorepo.

**Workspace Commands:**
- `npm run dev --workspace apps/web`: Start only the Next.js frontend.
- `npm run dev --workspace apps/api`: Start only the Express backend (uses `tsx watch`).
- `npm run test --workspace apps/api`: Run Vitest for the backend.
- `npm run build --workspace @illustriober/shared`: Build shared schemas (required before API/Web build).

### 2. Database Management (API Workspace)

Managed via Prisma. Always run these from the root using `--workspace apps/api`.

- `npm run prisma:generate --workspace apps/api`: Update Prisma Client.
- `npm run prisma:migrate:dev --workspace apps/api`: Create and apply a new migration.
- `npm run prisma:db:push --workspace apps/api`: Push schema to DB (use for local bootstrap only).
- `npm run prisma:studio --workspace apps/api`: Open Prisma Studio.

### 3. Authentication Strategy

- **Tokens:** Access token (JWT, short-lived, stored in `sessionStorage`) + Refresh token (HttpOnly cookie, long-lived, tracked in DB).
- **Flow:** Frontend calls `/api/auth/login`. API returns JSON with access token and sets cookie.
- **Proxy:** Next.js `next.config.ts` proxies `/api/*` requests to the Express backend (default `http://localhost:4000`).

## Development Conventions

### Code Intelligence (GitNexus)

This project uses **GitNexus** for code intelligence. **Always prioritize GitNexus tools** for navigation and impact analysis:
- Run `gitnexus_impact` before editing any symbol.
- Run `gitnexus_detect_changes` before committing.
- Use `gitnexus_query` to find execution flows by concept.

### Coding Standards

- **TypeScript:** Strict mode is enabled. Use explicit types; avoid `any`.
- **Validation:** Define all request/response schemas in `packages/shared` using Zod.
- **Styling:** Use Tailwind CSS 4 utility classes. Prefer CSS variables for theme management.
- **Components:** React 19 functional components with hooks.
- **API Routes:** Express routes contain business logic directly (controller-lite pattern). Use middleware for common tasks (auth, validation, error handling).

### Testing

- **Backend:** Vitest + Supertest. Tests are located alongside source files (e.g., `*.test.ts`).
- **Frontend:** Currently no automated tests for the UI.

## File Structure

```text
/
├── apps/
│   ├── web/                 # Next.js Frontend
│   └── api/                 # Express Backend + Prisma
├── packages/
│   └── shared/              # Shared Zod schemas & types
├── ai-spec/                 # Project blueprints (Architecture, API, UI, etc.)
├── my-skills/               # Specialized AI agent skills
└── package.json             # Root workspace configuration
```

## Key Documentation

- `README.md`: General overview and setup.
- `CLAUDE.md`: Technical guide for AI assistants.
- `ai-spec/`: Deep dive into product specifications (00-11).
- `QUICK_REFERENCE.md`: Summary of the project spec generation skill pack.
- `SPACING_GUIDE.md`: Guidelines for UI layout and spacing.
- `TESTING_GUIDE.md`: Standards for writing and running tests.
