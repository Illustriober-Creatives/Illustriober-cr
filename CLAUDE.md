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
npm run prisma:migrate --workspace apps/api
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
  - `middleware.ts` — Route protection via JWT cookie check
  - `lib/axios.ts` — Axios instance with auth interceptors

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
- Access token: 15 min expiry, stored in httpOnly cookie (`access_token`)
- Refresh token: 30 days expiry, stored in httpOnly cookie (`refresh_token`), also tracked in DB for revocation
- Tokens contain: `{ userId, role, clientId, email }`

**Flow:**
1. Next.js middleware checks for access token cookie
2. Axios interceptor attaches token from cookie to API requests
3. API `authenticate` middleware verifies JWT, attaches user to `req.user`
4. On 401, Axios calls `POST /api/auth/refresh` to get new access token
5. `authorize` middleware checks role permissions

**Data Isolation:** All DB queries scoped by `req.user.clientId` for multi-tenant security.

## Environment Variables

**apps/api/.env:**
```
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
RESEND_API_KEY=...           # Optional (email)
ALLOW_PUBLIC_REGISTRATION=true
```

**apps/web/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
API_PROXY_URL=https://...    # Production API URL (no trailing slash)
```

## Database Schema

Managed by Prisma. See `apps/api/prisma/schema.prisma`. Key tables:
- Users (clients, admins)
- Refresh tokens
- Enquiries (contact form submissions)
- Projects, Tickets, Comments (in progress per phase specs)

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
