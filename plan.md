# Illustriober — development roadmap (concise)

This file is the **living product roadmap** for the monorepo. Infra details live in [`ai-spec/illustriober-setup-log.md`](ai-spec/illustriober-setup-log.md) and [`ai-spec/deployplan.md`](ai-spec/deployplan.md).

## Done (baseline)

- **Phase 0:** npm workspaces, Next.js app, Express API, Prisma, `@illustriober/shared`.
- **Public marketing site:** core routes and enquiry form proxied to the API (`API_PROXY_URL` on Vercel, rewrite in `apps/web/next.config.ts`).
- **Deploy:** Vercel (web) + VPS + GitHub Actions (`deploy-vps.yml`).
- **Phase 1 closeout:** optional Resend emails on enquiry; production-oriented CORS; env-driven API proxy.
- **Phase 2 (started):** JWT access tokens, refresh sessions (DB + httpOnly cookie), auth API routes, `/login`, `/register`, `/dashboard` shell.

## Next (prioritized)

1. **Portal features:** projects, tickets, messages per Prisma schema and local specs (`04_API_SPEC.md`, `06_FEATURES.md` when present).
2. **Hardening:** refresh-token rotation, admin-only registration or invites, rate limits on auth routes, `trust proxy` on the VPS for accurate IP rate limiting.
3. **Phase 3 (later):** CMS for portfolio/static content (per original phase plan).
4. **Quality:** integration tests for auth + enquiry; Lighthouse and analytics from [`apps/web/src/lib/deployment.ts`](apps/web/src/lib/deployment.ts) checklist.

## Agent rule

Before implementation, read [`ai-spec/errorhistory.md`](ai-spec/errorhistory.md).
