# AGENTS.md

Illustriober Creatives Platform: a full-stack monorepo. A Next.js marketing site and client portal run on Vercel. An Express API and PostgreSQL run on a VPS. TypeScript, Prisma, npm workspaces.
Git, PR, commit and prose rules come from the global build standards. This file holds project facts only.

## Commands

- `npm install`: install all workspaces (root `postinstall` builds `@illustriober/shared`)
- `npm run dev --workspace apps/web` / `apps/api`: Next.js on :3000, Express on :4000 (`tsx watch`)
- `npm run build`: build everything (shared first); `npm run lint --workspace apps/web`
- `npm test --workspace apps/api` / `apps/web`: Vitest. API tests use Supertest and sit beside the source as `*.test.ts`

## Architecture

```
apps/
  web/              # Next.js 16 (App Router), port 3000
  api/              # Express + Prisma, port 4000
packages/
  shared/           # Shared Zod schemas (@illustriober/shared)
```

Conventions: TypeScript `strict` everywhere. Request and response schemas live in `packages/shared` as Zod. Tailwind CSS 4 utilities. React 19 function components. API routes hold business logic directly (no controllers layer) and use middleware for auth, validation and errors.

### Frontend (apps/web)

- **Framework:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- **Routes** (flat under `src/app/`):
  - Marketing: `/`, `/about`, `/services`, `/work`, `/tech-stack`, `/enquiry`, `/thank-you`
  - Auth: `/login`, `/register`, `/forgot-password`
  - Portal: `/dashboard` (auth-gated)
  - Legal: `/privacy`, `/terms`
- **Key files:**
  - `next.config.ts`: API proxy rewrites, image optimization, security headers
  - `src/contexts/AuthContext.tsx`: auth state, access token persistence, refresh recovery
  - `src/components/auth/ProtectedRoute.tsx`: client-side route guard
  - `src/lib/`: SEO helpers, analytics, theme utilities, image fallback

### Backend (apps/api)

- **Entry:** `src/index.ts` then `src/app.ts` (middleware registration)
- **Routes:** `src/routes/` (`auth.ts`, `enquiries.ts`, and others)
- **Middleware:** `src/middleware/`: `authenticate.ts` (JWT Bearer), `authorize.ts` (roles), `validateBody.ts` (Zod), `errorHandler.ts`, `requestLogger.ts`, `rateLimit.ts`
- **Lib:** `src/lib/`: `prisma.ts` (singleton and URL resolver), `jwt.ts`, `cookies.ts`, `email.ts`
- **CORS:** allows localhost variants, configured origins and `*.vercel.app` previews

### Shared package and build

- `@illustriober/shared` exports Zod schemas (enquiry, register, login) and types. It must be built before the API.
- API depends on it through `file:../../packages/shared`. API build compiles to `dist/` (CommonJS). Web build outputs `.next/`.
- `vercel.json` sets the framework to Next.js with output `.next`. The API is not on Vercel.
- Aliases: `@/*` maps to `./src/*` in both apps. The API also has `@routes/*`, `@middleware/*`, `@lib/*`, `@controllers/*`.

### API proxy

Next.js rewrites `/api/:path*` to `${API_PROXY_URL}/api/:path*` (`next.config.ts`). Browsers only talk to the Vercel site, so requests are same-origin and the refresh cookie stays first-party.
Local: `http://localhost:4000`. Production: `https://api.illustriober.com`, set as `API_PROXY_URL` in Vercel.

### API endpoints

```
GET  /                     # API info + docs links
GET  /health
POST /api/enquiries
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me          # Requires Bearer access token
```

## Database

Prisma schema: `apps/api/prisma/schema.prisma`. Key tables: users, refresh tokens, enquiries, projects, tickets, comments.

**Local development**
1. Start a local Postgres. Never point local work at the production database.
2. Copy `apps/api/.env.example` to `apps/api/.env` and set `DATABASE_URL`.
3. `npm run prisma:generate --workspace apps/api`
4. First run only: `npm run prisma:db:push --workspace apps/api` to create the tables.
5. `npm run dev --workspace apps/api`

**Schema changes**
1. Edit `schema.prisma`.
2. `npm run prisma:migrate:dev --workspace apps/api -- --name describe_change`
3. Commit the schema change and the new `apps/api/prisma/migrations/*` files, then build and test.

`prisma db push` is for local bootstrap and disposable databases only. Production changes go through migrations.
The runtime client prefers `DIRECT_DATABASE_URL` over `DATABASE_URL`. The Prisma CLI follows the same rule through `apps/api/prisma.config.ts`.

## Deployment

- **Web:** Vercel, from `main`.
- **API:** Contabo VPS at `https://api.illustriober.com`. nginx and Let's Encrypt sit in front of port 4000, which is closed to the internet. PostgreSQL runs on the same host, local only.
- **Pipeline:** a push to `main` runs `.github/workflows/deploy-vps.yml`. `verify` builds and tests, then `deploy` runs `.github/scripts/deploy-api.sh` over SSH. The script backs up the files and the database, runs `prisma migrate deploy`, restarts the service, and restores the old files if `/health` does not answer.
- **GitHub settings the workflow needs:** secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, and variable `VPS_HOST_FINGERPRINT` (the server's ed25519 host key fingerprint).
- **Server layout:** code in `/opt/illustriober/app`, systemd unit `illustriober-api`, secrets in `/etc/illustriober/api.env` (root:illustriober, mode 640). The service runs as the no-login user `illustriober`. CI connects as `deploy`, which can only restart that unit and take a database dump.
- **Admin access:** the owner's SSH alias is `illustriober-vps`. `srv help` on the server lists the health and maintenance commands.

## Environment

Local `apps/api/.env`: see `apps/api/.env.example`. Production: `/etc/illustriober/api.env`, never in git, never printed. Web: `apps/web/.env.local` (`NEXT_PUBLIC_API_URL`, `API_PROXY_URL`).

| Variable | When missing |
|---|---|
| `JWT_SECRET` | Production API exits at startup. Other environments use a dev-only secret. |
| `DATABASE_URL`, `DIRECT_DATABASE_URL` | The API throws on first database use. Direct wins when both are set. |
| `CORS_ORIGIN` | Only the built-in origins, localhost and `*.vercel.app` previews are allowed. |
| `APP_URL` | Invite links point at `http://localhost:3000`. Some other links use the first `CORS_ORIGIN` first. |
| `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL` | Emails are skipped with a console warning. |
| `ENQUIRY_ADMIN_EMAIL` | The admin copy of an enquiry email is not sent. |
| `ALLOW_PUBLIC_REGISTRATION` | Registration stays open. Only the exact value `false` closes it. |
| `PORT`, `NODE_ENV` | Default to 4000 and `development`. Production sets secure cookies and hides error details. |
| `API_PROXY_URL` (web) | Defaults to `http://localhost:4000`, so a deployed site cannot reach the API. |

## Read Before Touching This

**Authentication flow**
- Access token: 15 min, returned as JSON, kept in `sessionStorage`. Refresh token: 30 days, httpOnly cookie `illustriober_refresh`, tracked in the database for revocation. Claims: `{ sub, role, email }`.
- Auth pages call `/api/auth/login` or `/register`. `AuthContext` sends the access token as a Bearer token to `/api/auth/me`. On a `401` it makes one deduplicated `POST /api/auth/refresh`, stores the new token and retries.
- `ProtectedRoute` redirects unauthenticated users. The API `authenticate` middleware verifies Bearer tokens and sets `req.user`.

**Migration history cannot rebuild a database from empty** (incident: first deploy to the new VPS, 2026-11-27, error P3018)
- The second migration renames a constraint that only existed on the old server, and the third repeats the whole schema.
- The production database was created with `prisma db push`, then every migration was marked applied with `prisma migrate resolve --applied`.
- Never run `prisma migrate deploy` against an empty database. A baseline migration is the proper fix.

**Keep Prisma at one version** (same incident)
- `apps/api` pins `prisma` and `@prisma/client` at 6.19.3. A second copy at the repo root made `npx prisma` pick another version and fail on the server. Do not add `prisma` to the root `package.json`.

**Keep dev tooling out of root dependencies** (same incident)
- `npm ci` runs in CI and on the server. A root tool whose install script downloaded a binary failed both when that download returned 404. The deploy script installs only the API and shared workspaces, with install scripts off.

**Rate limiter trusts a forgeable header**
- `src/middleware/rateLimit.ts` keys clients by the first `X-Forwarded-For` value. Anyone calling the API host directly can forge it. Do not rely on it as brute-force protection until proxy trust is fixed.
