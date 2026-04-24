# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Illustriober Creatives Platform — A full-stack monorepo with a Next.js marketing website and client portal (Vercel) and an Express API (VPS). Built with TypeScript, Prisma, PostgreSQL, and npm workspaces.

## Monorepo Structure

```
apps/
  web/              # Next.js 16 (App Router), runs on port 3000
  api/              # Express + Prisma, runs on port 4000
packages/
  shared/           # Shared Zod schemas (@illustriober/shared)
```

## Common Commands

**Development:**
```bash
npm install                   # Install all dependencies
npm run dev                   # Start both web and api dev servers
npm run dev --workspace apps/web     # Start only web
npm run dev --workspace apps/api     # Start only api (tsx watch)
```

**Building:**
```bash
npm run build                 # Build all workspaces
npm run build --workspace apps/web
npm run build --workspace apps/api    # Compiles TypeScript to dist/
npm run build --workspace @illustriober/shared   # Must build before api
```

**Linting:**
```bash
npm run lint                  # Lint all workspaces
```

**Database (API workspace):**
```bash
npm run prisma:generate --workspace apps/api
npm run prisma:migrate:dev --workspace apps/api
npm run prisma:migrate:deploy --workspace apps/api
npm run prisma:migrate:status --workspace apps/api
npm run prisma:db:push --workspace apps/api
npm run prisma:validate --workspace apps/api
```

**Port management (common during dev):**
```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN    # Check Next.js port
lsof -nP -iTCP:4000 -sTCP:LISTEN    # Check API port
kill -15 $(lsof -ti :3000)           # Kill port 3000
```

**Health checks:**
```bash
curl -i http://localhost:4000/health
curl -I http://localhost:3000/
```

## Architecture

### Frontend (apps/web)

- **Framework:** Next.js 16 with App Router, React 19, TypeScript, Tailwind CSS 4
- **Route Groups:**
  - `(public)/` — Marketing pages (/, /about, /services, /work, /tech-stack, /enquiry)
  - `(auth)/` — Login, register, forgot-password
  - `dashboard/` — Client portal (auth-gated)
  - `admin/` — Admin panel (admin role only)
- **Key Files:**
  - `next.config.ts` — API proxy rewrites, image optimization, security headers
  - `src/contexts/AuthContext.tsx` — Client-side auth state, access token persistence, refresh recovery
  - `src/components/auth/ProtectedRoute.tsx` — Client-side route guard for authenticated areas

### Backend (apps/api)

- **Framework:** Express, TypeScript, Prisma ORM, PostgreSQL
- **Entry:** `src/index.ts` → `src/app.ts` (middleware registration)
- **Routes:** `src/routes/` (auth.ts, enquiries.ts)
- **Middleware:** `src/middleware/` — authenticate.ts (JWT), authorize.ts (roles), validateBody.ts (Zod)
- **Structure:** Routes → Controllers → Prisma Client → PostgreSQL

### Shared Package (packages/shared)

- **Name:** `@illustriober/shared`
- **Exports:** Zod schemas (enquirySchema, registerSchema, loginSchema) and types
- **Build Required:** Must be built before API workspace (postinstall runs this automatically)

## API Proxy Pattern

Next.js rewrites all `/api/*` requests to the Express backend:

```typescript
// next.config.ts
rewrites: [{ source: "/api/:path*", destination: "${apiProxyBase}/api/:path*" }]
```

- Local dev: `http://localhost:4000`
- Production: Set via `API_PROXY_URL` env var

This allows the frontend to make same-origin requests and keeps CORS simple.

## Authentication Flow

**Token Strategy:**
- Access token: 15 min expiry, returned by the API and stored client-side in `sessionStorage`
- Refresh token: 30 days expiry, stored in an httpOnly cookie (`illustriober_refresh`) and tracked in DB for revocation
- Tokens contain: `{ sub, role, email }`

**Flow:**
1. Frontend auth pages call `/api/auth/login` or `/api/auth/register`
2. API returns an access token in JSON and sets the refresh session cookie
3. `AuthContext` stores the access token in `sessionStorage` and uses it as a Bearer token for `/api/auth/me`
4. On a `401`, the client deduplicates refresh attempts through `POST /api/auth/refresh`, stores the new access token, and retries the protected request
5. `ProtectedRoute` handles client-side redirects for authenticated areas such as `/dashboard`
6. API `authenticate` middleware verifies Bearer tokens and attaches `req.user`

## Environment Variables

**apps/api/.env (local development):**
```
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/illustriober_local?schema=public
DIRECT_DATABASE_URL=
JWT_SECRET=...
RESEND_API_KEY=...           # Optional (email)
ALLOW_PUBLIC_REGISTRATION=true
```

**apps/api production env (VPS):**
```
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://illustriober.com,https://www.illustriober.com
JWT_SECRET=...
RESEND_API_KEY=...
ALLOW_PUBLIC_REGISTRATION=true
DIRECT_DATABASE_URL=postgresql://app_user:app_password@localhost:5432/illustrioberdb?schema=public
```

**apps/web/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
API_PROXY_URL=https://...    # Production API URL (no trailing slash)
```

**Database URL policy:**
- Local development must use a local Postgres database, not the VPS production database.
- On the VPS, `localhost` in the Postgres URL is correct when the API and Postgres run on the same machine.
- The runtime Prisma client prefers `DIRECT_DATABASE_URL` when set; otherwise it falls back to `DATABASE_URL`.
- Prisma CLI now follows the same rule through `apps/api/prisma.config.ts`.

## Database Schema

Managed by Prisma. See `apps/api/prisma/schema.prisma`. Key tables:
- Users (clients, admins)
- Refresh tokens
- Enquiries (contact form submissions)
- Projects, Tickets, Comments (in progress per phase specs)

## Database Workflow

**Local development**
1. Start a local Postgres instance.
2. Copy `apps/api/.env.example` to `apps/api/.env`.
3. Set `DATABASE_URL` to your local Postgres database.
4. Run `npm run prisma:generate --workspace apps/api`.
5. For an existing schema with no migration history yet, use `npm run prisma:db:push --workspace apps/api` once to create the local tables.
6. Start the API with `npm run dev --workspace apps/api`.

**Schema changes going forward**
1. Edit `apps/api/prisma/schema.prisma`.
2. Create a migration locally with:
   ```bash
   npm run prisma:migrate:dev --workspace apps/api -- --name describe_change
   ```
3. Commit both the schema change and the generated `apps/api/prisma/migrations/*` files.
4. Rebuild and test locally before deployment.

**VPS deployment**
1. Set production env vars on the VPS, especially `DIRECT_DATABASE_URL`.
2. Pull the new code to the VPS.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Apply committed migrations to the VPS database:
   ```bash
   npm run prisma:migrate:deploy --workspace apps/api
   ```
5. Regenerate the Prisma client if needed:
   ```bash
   npm run prisma:generate --workspace apps/api
   ```
6. Build and restart the API process:
   ```bash
   npm run build --workspace apps/api
   npm run start --workspace apps/api
   ```

**When to use `db push` vs migrations**
- Use `prisma migrate dev` for normal schema evolution that will be deployed to VPS.
- Use `prisma db push` only for local bootstrap, disposable databases, or quick non-production resets.
- Do not rely on `db push` as the main production change workflow.

## API Endpoints

```
GET  /health
POST /api/enquiries
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me          # Requires Bearer access token
```

## Path Aliases

**Web (tsconfig.json):**
- `@/*` → `./src/*`

**API (tsconfig.json):**
- `@/*` → `./src/*`
- `@routes/*`, `@middleware/*`, `@lib/*`, `@controllers/*` → respective src dirs

## Build Process

1. Root `postinstall` builds `@illustriober/shared`
2. API depends on `@illustriober/shared` via `file:../../packages/shared`
3. API build compiles TypeScript to `dist/` (CommonJS)
4. Web build uses Next.js with output to `.next/`

## Vercel Configuration

`vercel.json` sets framework to Next.js and output directory to `.next`. The API runs on a separate VPS, not Vercel.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **illustriober-cr** (3878 symbols, 4374 relationships, 25 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/illustriober-cr/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/illustriober-cr/context` | Codebase overview, check index freshness |
| `gitnexus://repo/illustriober-cr/clusters` | All functional areas |
| `gitnexus://repo/illustriober-cr/processes` | All execution flows |
| `gitnexus://repo/illustriober-cr/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
