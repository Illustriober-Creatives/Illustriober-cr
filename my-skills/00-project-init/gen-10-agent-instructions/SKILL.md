---
name: gen-10-agent-instructions
description: Generate consolidated agent instructions for AI developers, embedding security rules, naming conventions, and build discipline
risk: high
source: custom
date_added: 2026-04-12
---

# Agent Instructions Generator (10)

You are a **governance architect** responsible for synthesizing all prior specifications into a single, authoritative set of rules that AI agents must follow during development.

## Use this skill when

- The orchestrator invokes you with ALL prior outputs (00–09)
- Security rules, naming conventions, and build discipline must be enforced across teams
- Future AI agents will be given these instructions to ensure consistency
- This is **step 11** in the specification pipeline

## Do not use this skill when

- Prior specifications are incomplete (depends on all prior skills)

## Instructions

### Input

- All prior generated files (00_PROJECT_OVERVIEW.md through 09_UI_DESIGN_SYSTEM.md)
- Project brief (for context on domain-specific rules)

### Generation Steps

1. **Security Rules (Non-Negotiable)**
   - **Authentication:**
     - JWT tokens MUST be stored in httpOnly cookies only (never localStorage)
     - Tokens MUST have expiration (access: 15–30 min, refresh: 7–30 days)
     - All endpoints except /auth/*, /, /enquiry, /contact MUST validate JWT
   
   - **Authorization:**
     - Every API endpoint must check: Is this user allowed to access this resource?
     - Rule: `clientId === req.user.userId` OR `req.user.role === 'admin'`
     - NEVER return data from other users/clients
     - Test this before shipping: Create client A and client B, verify A cannot see B's projects
   
   - **Input Validation:**
     - All inputs (query, body params) MUST be validated with Zod schemas from packages/shared
     - Return 400 Bad Request with validation error details if invalid
     - Never pass unvalidated input to database queries
   
   - **SQL Injection Prevention:**
     - Use Prisma ORM only (no raw SQL)
     - Prisma parameterizes queries automatically
     - If raw SQL required, use parameterized queries: `$1, $2` syntax
   
   - **XSS Prevention:**
     - All user input rendered in React must be auto-escaped (React default behavior)
     - If using `dangerouslySetInnerHTML`, sanitize HTML first (DOMPurify library)
     - Content Security Policy (CSP) headers recommended on API responses
   
   - **CSRF Protection:**
     - httpOnly cookies naturally prevent CSRF (no JavaScript access)
     - If making cross-origin requests, ensure CORS is configured correctly
   
   - **Rate Limiting:**
     - Auth endpoints (login, register, password reset): 5 requests/minute per IP
     - All other endpoints: 100 requests/minute per authenticated user
     - Implement with express-rate-limit middleware

2. **Data Isolation (Critical for Multi-Client SaaS)**
   - Every table that stores per-client data MUST have `clientId` or path to `clientId`
   - Every query MUST filter: `WHERE clientId = $1`
   - Example:
     ```sql
     -- WRONG: returns all projects
     SELECT * FROM projects WHERE status = 'active';
     
     -- CORRECT: returns only this client's projects
     SELECT * FROM projects WHERE status = 'active' AND clientId = $1;
     ```
   - Test: Create 2 test client accounts, verify each sees only their own data
   - Document the "clientId path" for each model (e.g., Ticket → Project → Client)

3. **Build & Development Order (Strict Sequence)**
   - Phase 0 (Weeks 1–2): Monorepo + Database + Infra ONLY
   - Phase 1 (Weeks 3–6): Public site + Enquiry + Auth
   - Phase 2 (Weeks 7–10): Client portal (Projects, Tickets, Files)
   - Phase 3 (Weeks 11–12): Collaboration (Real-time, Advanced features)
   - Do NOT skip to Phase 2 before Auth is solid (data isolation depends on auth)
   - Do NOT deploy to production before data isolation is tested

4. **Naming Conventions (Consistency)**
   - **Components (React):** PascalCase, one per file
     - `components/ProjectCard.tsx`
     - `components/user/UserAvatar.tsx`
   - **Files (non-components):** camelCase
     - `utils/dateFormatter.ts`
     - `lib/cloudinary.ts`
     - `hooks/useProjects.ts`
   - **Database tables/fields:** camelCase
     - `projects`, `projectId`, `createdAt`
   - **API routes:** kebab-case
     - `/api/projects`, `/api/projects/:id`, `/api/project-files`
   - **Environment variables:** UPPER_SNAKE_CASE
     - `DATABASE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `CLOUDINARY_API_KEY`
   - **Branches:** kebab-case with prefix
     - `feature/project-creation`, `fix/data-isolation-bug`, `chore/upgrade-deps`

5. **TypeScript Strictness (No Exceptions)**
   - `"strict": true` in tsconfig.json (all strict options enabled)
   - **NO `any` types** — always specify types or use generics
   - **NO non-null assertions (!)** — handle null/undefined explicitly
   - All function parameters have types: `function getName(user: User): string {}`
   - All return types specified (no implicit any)
   - Enable `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`

6. **Error Handling (Predictable & Logged)**
   - **Async/Await + Try/Catch:**
     ```typescript
     try {
       const user = await prisma.user.findUnique({ where: { id } });
       return user;
     } catch (error) {
       logger.error('Failed to fetch user', error);
       throw new APIError('User not found', 404);
     }
     ```
   - **Never swallow errors silently** — always log or throw
   - **Standard error object:**
     ```json
     {
       "error": "unauthorized",
       "message": "User not authenticated",
       "statusCode": 401
     }
     ```
   - **Log levels:** error (failures), warn (unusual), info (important), debug (detailed)
   - Never log PII or secrets (API keys, passwords, tokens)

7. **Testing Requirements**
   - **Unit tests:** Pure functions, utilities, validation
   - **Integration tests:** API endpoints with database (test data isolation)
   - **E2E tests:** Critical user flows (login, create project, view projects, verify isolation)
   - Target: 70%+ code coverage for /api routes
   - Test every data isolation scenario (user A cannot see/modify user B's data)
   - Run tests before every commit (pre-commit hook)

8. **Code Review Checklist (Before Merge)**
   - [ ] All types are explicit (no `any`)
   - [ ] All async functions are wrapped in try/catch
   - [ ] All inputs are validated with Zod
   - [ ] Data isolation is enforced (clientId check present)
   - [ ] No secrets/credentials in code
   - [ ] Tests pass and cover new code
   - [ ] Component/function is documented (JSDoc)
   - [ ] No console.log in production code
   - [ ] No network requests without error handling
   - [ ] PR description explains what & why

9. **File Structure & Organization**
   - Enforce the structure from 02_ARCHITECTURE.md
   - apps/web/* and apps/api/* must not cross-import
   - shared/* is the only bridge (types, validation, constants)
   - Each developer works on separate features (avoid conflicts)

10. **Documentation Requirements**
    - JSDoc comments on exported functions/components
    - README in each app (web, api) explaining how to run locally
    - .env.example at root with all env vars
    - Architecture decisions documented (in ai-spec/)
    - Complex logic explained with inline comments

11. **Performance & Optimization**
    - Frontend: Use TanStack Query for data fetching (not fetch directly)
    - API: Add database indexes for commonly filtered fields
    - Images: Optimize via Cloudinary (use transformation URLs)
    - Caching: Set Cache-Control headers on static assets
    - No N+1 queries: Use Prisma `include` for relationships

12. **Deployment & Versioning**
    - Main branch = production
    - Staging branch = pre-production testing
    - Feature branches from develop or feature/*
    - Always test on staging before production
    - Document breaking changes in CHANGELOG

13. **Communication & Transparency**
    - Link PRs to GitHub issues
    - Update issue status as you work (In Progress → Done)
    - Announce data schema changes (affects everyone)
    - Document API breaking changes (notify frontend team)

### Output Format

Markdown file: `AGENT_INSTRUCTIONS.md` (note: no numeric prefix)

Standard sections:
- **Security Rules** — Auth, authorization, validation, injection prevention, rate limiting
- **Data Isolation** — Multi-client scoping, testing requirements
- **Build Order** — Phase-by-phase sequence (do not skip)
- **Naming Conventions** — Components, files, database, API, env vars, branches
- **TypeScript Strictness** — No any, proper types, function signatures
- **Error Handling** — Try/catch, logging, standard error format
- **Testing Requirements** — Unit, integration, E2E, coverage targets
- **Code Review Checklist** — Before merge requirements
- **File Structure** — Enforce monorepo layout
- **Documentation** — JSDoc, README, decisions, comments
- **Performance & Optimization** — Caching, indexing, N+1 prevention
- **Deployment & Versioning** — Branch strategy, testing environments
- **Communication** — Transparency, announcements, PR/issue linking

### Validation

- ✓ All security-critical rules are present and unambiguous
- ✓ Data isolation rules are explicit and testable
- ✓ Build order matches 07_IMPLEMENTATION_PLAN.md
- ✓ Naming conventions are consistent with tech stack
- ✓ TypeScript strictness rules are clear
- ✓ Testing requirements are specific (coverage %, scenarios)
- ✓ Error handling pattern is documented with examples
- ✓ Code review checklist is actionable

### Safety

- This document is **non-negotiable**. Every rule exists because it prevents a real security/stability issue.
- Security rules (auth, authorization, validation, isolation) are CRITICAL. Do not allow exceptions.
- Data isolation is the #1 blocker for Phase 2 → no client-scoped features without it.
- Review with security expert if project handles sensitive data (PII, financial, health).

## Purpose

This document is the **development constitution** — it sets expectations for all contributors (human or AI) and ensures the codebase is secure, maintainable, and consistent. No exceptions to security rules.

