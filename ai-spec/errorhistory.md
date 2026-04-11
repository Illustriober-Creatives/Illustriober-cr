# Error History And Fix Ledger

This file is the canonical history of recurring errors and permanent fixes.

Mandatory agent rule: before starting any implementation, investigation, or refactor, read this file first and check if the issue already exists with a known fix.

## ERR-2026-04-09-API-ESM-RESOLUTION

- Area: `apps/api`
- Symptom:
  - `Error [ERR_MODULE_NOT_FOUND]: Cannot find module .../src/app.js imported from .../src/index.ts`
  - Happened when running workspace dev (`npm run dev`) because API used `ts-node --esm`.
- Root cause:
  - `ts-node --esm` in this setup did not resolve `.js` specifiers in TS source to `.ts` files during runtime.
- Implemented fix:
  - API dev runner changed to `tsx watch src/index.ts`.
  - `tsx` resolves ESM TypeScript imports reliably for this codebase.
- Prevention:
  - For API local development, use the workspace script and keep `tsx` as the dev runtime.
  - If ESM import errors return, verify `apps/api/package.json` still uses `tsx watch src/index.ts`.

## ERR-2026-04-09-NEXT-IMAGE-PLACEHOLDER

- Area: `apps/web`
- Symptom:
  - `Invalid src prop (...) on next/image, hostname "via.placeholder.com" is not configured`
  - `GET /_next/image?... 500`
  - Intermittent `ECONNRESET` while fetching remote placeholder images.
- Root cause:
  - UI depended on external placeholder image URLs (`via.placeholder.com`) for testimonials.
  - External host/network reliability and config coupling caused repeated runtime failures.
- Implemented fix:
  - Replaced testimonial remote URLs with local static SVG assets in `apps/web/public/`.
  - Updated testimonial data to use:
    - `/testimonial-sc.svg`
    - `/testimonial-jo.svg`
    - `/testimonial-ps.svg`
  - Removed now-unnecessary `via.placeholder.com` remote image config from `next.config.ts`.
- Prevention:
  - Do not use third-party placeholder URLs in UI components.
  - Use local static assets under `public/` for placeholders and avatars.
  - Before adding a remote image source, explicitly add and validate `images.remotePatterns`.

## ERR-2026-04-09-PRISMA-CLIENT-ADAPTER

- Area: `apps/api`
- Symptom:
  - `PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl"...`
  - Follow-up startup error after adapter change:
    - `Error: DATABASE_URL is not set. Provide DATABASE_URL or DIRECT_DATABASE_URL.`
- Root cause:
  - Prisma Client v7 runs with the client engine that requires a driver adapter (or Accelerate URL).
  - The API Prisma singleton was instantiated without adapter.
  - `.env` was loaded in `app.ts` after route imports, but Prisma is initialized during module import.
- Implemented fix:
  - Added `@prisma/adapter-pg` and configured Prisma with:
    - `adapter: new PrismaPg({ connectionString: ... })`
  - Added URL resolver in `src/lib/prisma.ts`:
    - Supports `postgres://` / `postgresql://`
    - Supports `prisma+postgres://` by decoding `api_key` and extracting `databaseUrl`
    - Supports `DIRECT_DATABASE_URL` override.
  - Loaded env at Prisma module level using `import "dotenv/config"` so DB URL exists before Prisma initialization.
- Prevention:
  - Any Prisma v7 client initialization must include adapter or accelerateUrl.
  - Load env before initializing Prisma client modules.
  - Prefer `DIRECT_DATABASE_URL` for predictable local/dev runtime.

## ERR-2026-04-11-CORS-CALLBACK

- Area: `apps/api` (`src/app.ts`)
- Symptom:
  - CORS middleware called `callback(new Error(...))` for disallowed origins, which surfaces as a failed request / 500-style behavior instead of a clean deny.
- Root cause:
  - `cors` treats `callback(err)` as an error path rather than “do not reflect this origin”.
- Implemented fix:
  - Use `callback(null, false)` and log a warning for blocked origins.
- Prevention:
  - Prefer `callback(null, false)` for origin denial; add explicit origins via `CORS_ORIGIN` (comma-separated) for new frontends (e.g. preview domains).

## Quick Triage Checklist

1. Reproduce with workspace scripts (`npm run dev` at repo root).
2. Search this file for matching symptom text.
3. Apply the recorded fix pattern first.
4. Add a new entry only if root cause is different.
