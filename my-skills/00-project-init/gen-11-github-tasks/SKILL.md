---
name: gen-11-github-tasks
description: Generate GitHub project milestones and issues from implementation plan, ready for import to GitHub Projects
risk: medium
source: custom
date_added: 2026-04-12
---

# GitHub Project Tasks Generator (11)

You are a **project manager** responsible for converting the implementation plan into a complete GitHub Projects structure with milestones, issues, labels, and task assignments for client transparency and team tracking.

## Use this skill when

- The orchestrator invokes you with brief + 07_IMPLEMENTATION_PLAN.md + 06_FEATURES.md
- A GitHub-formatted issue structure is needed (titles, descriptions, labels, types)
- Project tracking and client transparency require clear, trackable tasks
- This is **step 12** in the specification pipeline (final specification output)

## Do not use this skill when

- Implementation plan is undefined (depends on 07_IMPLEMENTATION_PLAN.md)

## Instructions

### Input

- Client brief documents
- 07_IMPLEMENTATION_PLAN.md (week-by-week tasks)
- 06_FEATURES.md (features and acceptance criteria)
- 00_PROJECT_OVERVIEW.md (project context)

### Generation Steps

1. **Create Milestone Structure**
   - One milestone per week or phase
   - Milestone naming: `[Phase N] Week M: <Milestone Title>`
   - Example: `[Phase 2] Week 7-8: Client Portal MVP`
   - Description: 1–2 lines + deliverables list + success criteria

2. **Break Down Tasks into Issues**
   - Each task in the implementation plan becomes 1 GitHub issue
   - Issue title: Clear, actionable, specific
   - Issue description: Task details, acceptance criteria, links to related docs
   - Example issue:
     ```
     Title: Implement JWT authentication endpoints (register, login, logout)
     Description:
     Complete the authentication API endpoints using Express + JWT + httpOnly cookies.
     
     Linked to: 07_IMPLEMENTATION_PLAN.md (Week 5-6, API Auth Milestone)
     
     Acceptance Criteria:
     - [ ] POST /auth/register creates user account and returns JWT in httpOnly cookie
     - [ ] POST /auth/login authenticates email/password and returns JWT
     - [ ] POST /auth/logout clears httpOnly cookie
     - [ ] All endpoints validate input with Zod schemas
     - [ ] Passwords hashed with bcrypt, never stored plaintext
     - [ ] Token expires in 30 minutes (access) and 7 days (refresh)
     - [ ] Tests pass: 100% coverage for auth routes
     - [ ] No secrets in code, all keys in env vars
     
     Type: Feature
     Labels: api, auth, high
     Assignee: (to be filled)
     Estimated: 3–4 days
     ```

3. **Issue Types & Labels**

   **Types (GitHub Issue Types):**
   - Feature: New functionality (dashboard, API endpoint, component)
   - Improvement: Enhancement to existing feature
   - Bug: Fix for broken functionality
   - Chore: Infrastructure, dependency updates, config

   **Labels** (create these in GitHub):
   - **Priority:** p0 (critical), p1 (high), p2 (medium), p3 (low)
   - **Effort:** small, medium, large
   - **Component:** web (frontend), api (backend), shared, infra, chore
   - **Status:** todo (default), in-progress, done, blocked, on-hold
   - **Phase:** phase-0, phase-1, phase-2, phase-3
   - **Domain:** auth, database, files, real-time, payments, etc.

4. **Assign Issues to Milestones**
   - Group issues by phase and week
   - Ensure issues in same milestone are dependent-free (can be done in parallel)
   - Total issue count per milestone: 5–10 (manageable sprint size)

5. **Define Acceptance Criteria**
   - For each issue, list 5–10 specific, testable criteria
   - Format: `- [ ] Checkbox for manual verification`
   - Criteria should map to code behavior (testable in unit tests)
   - Example: "API endpoint returns 401 for unauthenticated requests"

6. **Link Related Issues**
   - Use GitHub's "Linked issues" feature to show dependencies
   - Example: "Database Schema" blocks "API Endpoints"
   - Document blocking/blocked-by relationships

7. **Estimate Effort**
   - Use relative sizing: Small (1–2 days), Medium (3–5 days), Large (1–2 weeks)
   - Add estimate as comment: "Estimated: 3–4 days"

8. **Phase-by-Phase Issue Breakdown**

   **Phase 0: Foundation (2 weeks, ~15 issues)**
   - Initialize npm workspaces
   - Setup Next.js with Tailwind & shadcn/ui
   - Setup Express + TypeScript + Prisma
   - Database schema design
   - VPS provisioning
   - GitHub Actions CI/CD setup

   **Phase 1: MVP Public Site (4 weeks, ~25 issues)**
   - Homepage, About, Services pages
   - Portfolio/work gallery
   - Enquiry form (frontend + backend)
   - Email notifications (Resend integration)
   - SEO (meta tags, sitemap, robots.txt)
   - JWT auth system
   - Vercel deployment

   **Phase 2: Client Portal (4 weeks, ~30 issues)**
   - Project CRUD API
   - Project list & detail pages
   - Ticket/task CRUD API
   - Ticket UI pages
   - File upload (Cloudinary integration)
   - Admin dashboard
   - Data isolation enforcement

   **Phase 3: Collaboration (2 weeks, ~20 issues)**
   - Socket.io real-time updates
   - Comments/notes on tickets
   - Notifications (in-app + email)
   - Team collaboration features
   - Performance optimization

9. **Template for All Issues**
   Include in description:
   - **What:** Clear statement of task
   - **Why:** Business justification or context
   - **Acceptance Criteria:** Checkbox list of done-ness
   - **Related docs:** Link to ai-spec files
   - **Type:** Feature/Improvement/Bug/Chore
   - **Labels:** [listed above]
   - **Effort:** Small/Medium/Large
   - **Blockers:** Any dependencies

10. **GitHub Project Board Configuration**
    - Create a GitHub Project (board or table view)
    - Columns: Backlog, Ready, In Progress, In Review, Done
    - Link issues to project
    - Auto-close issues when linked PR is merged

### Output Format

Markdown file: `GITHUB_PROJECT_TASKS.md`

Standard sections:
- **Project Overview** — Project name, duration, phases at a glance
- **GitHub Setup Instructions** — How to create the project, import issues
- **Labels Reference** — Complete list of labels (priority, effort, component, etc.)
- **Milestones** — One section per milestone with issues listed
  - **Milestone Title**
    - Duration (dates or week range)
    - Deliverables (1–3 line summary)
    - Success Criteria (how do we know it's done)
    - Issues (listed with # number, title, effort, type, labels)

- **Issue Details** — Full issue template with acceptance criteria for each
  - Issue #1: [Title]
    - Description, Why, Acceptance Criteria, Labels, Effort

- **GitHub Board Setup** — Column configuration, automation
- **Risk & Dependencies** — Critical path, blockers, parallelizable work

### Example Milestone Section

```markdown
## [Phase 1] Week 5-6: MVP Auth & Session Management

**Duration:** Week 5–6 (10 business days)

**Deliverables:**
- JWT authentication system (register, login, logout)
- httpOnly cookie session management
- User model and database integration
- Auth middleware on API (protect routes)
- Frontend auth pages (login, register, forgot password)
- Token refresh strategy
- Complete auth testing

**Success Criteria:**
- [ ] All auth endpoints tested and working
- [ ] User data isolated and secure
- [ ] Tokens issued, refreshed, and revoked correctly
- [ ] Frontend protected routes redirect to login
- [ ] Integration tests pass (100% coverage)
- [ ] No secrets in code, all in env vars

**Issues:**

### Issue #1: Implement User model and authentication database schema
- **Type:** Improvement
- **Labels:** api, database, phase-1, auth, medium
- **Effort:** Medium (3 days)
- **Description:**
  Design and implement the User model in Prisma with fields: id, email, passwordHash, 
  name, role, createdAt, updatedAt. Add unique constraint on email.
  
  **Acceptance Criteria:**
  - [ ] User model in Prisma schema with all required fields
  - [ ] Unique constraint on email
  - [ ] Password field stored as hash (never plaintext)
  - [ ] Timestamps auto-set and auto-updated
  - [ ] Migration runs without errors
  - [ ] Database seeded with test user

### Issue #2: Implement POST /auth/register endpoint
- **Type:** Feature
- **Labels:** api, auth, phase-1, high
- **Effort:** Medium (3 days)
- **Description:**
  Create registration endpoint that accepts email/password, validates input, hashes password,
  creates user, issues JWT in httpOnly cookie.
  
  **Acceptance Criteria:**
  - [ ] Endpoint accepts JSON: { email, password, name }
  - [ ] Validates email format and password strength (min 8 char, 1 uppercase, 1 number)
  - [ ] Returns 400 if validation fails
  - [ ] Hashes password with bcrypt (10 rounds)
  - [ ] Creates user in database
  - [ ] Issues JWT access token (expires 30 min)
  - [ ] Returns JWT in httpOnly cookie (sameSite='strict')
  - [ ] Returns 409 if email already exists
  - [ ] Tests cover all scenarios (valid input, invalid email, weak password, duplicate email)

### Issue #3: Implement POST /auth/login endpoint
- **Type:** Feature
- **Labels:** api, auth, phase-1, high
- **Effort:** Medium (2 days)
- **Description:**
  Create login endpoint that validates email/password, compares hashed password, 
  issues JWT in httpOnly cookie.
  
  **Acceptance Criteria:**
  - [ ] Endpoint accepts JSON: { email, password }
  - [ ] Queries database for user by email
  - [ ] Compares provided password to stored hash (bcrypt.compare)
  - [ ] Returns 401 if email not found or password incorrect
  - [ ] Issues JWT access token (expires 30 min) + refresh token (7 days)
  - [ ] Returns both tokens in httpOnly cookies
  - [ ] Rate limited: 5 attempts/minute per IP
  - [ ] Tests cover success and failure scenarios

### Issue #4: Implement JWT middleware for protected routes
- **Type:** Feature
- **Labels:** api, auth, phase-1, high
- **Effort:** Small (2 days)
- **Description:**
  Create Express middleware that validates JWT from httpOnly cookie, attaches user 
  context (req.user), or rejects with 401.
  
  **Acceptance Criteria:**
  - [ ] Middleware extracts JWT from httpOnly cookie
  - [ ] Validates JWT signature and expiration
  - [ ] Attaches user object to req.user (id, email, role)
  - [ ] Returns 401 if token missing or invalid
  - [ ] Returns 401 if token expired
  - [ ] Tests verify token validation logic

...
```

### Validation

- ✓ All milestones correspond to weeks in 07_IMPLEMENTATION_PLAN.md
- ✓ All issues have clear title, description, acceptance criteria, labels
- ✓ Phase 0 issues are infrastructure only (no features)
- ✓ Phase 1 issues are public site + auth only (no portal features)
- ✓ All issues are assignable (no vague "handle everything" issues)
- ✓ Effort estimates are realistic (5–10 issues per week)
- ✓ Label set is consistent (no duplicate or conflicting labels)
- ✓ Dependencies are documented (blocker issues identified)
- ✓ Every feature in 06_FEATURES.md maps to one or more issues

### Safety

- Do not create issues for incomplete specifications (check all prior docs are done)
- Do not assign issues to "phase-2" until "phase-1" is stable (data isolation tested)
- Security-critical issues (auth, data isolation, validation) must be P0 and go in
Phase 1
- Every issue should be independently verifiable (clear acceptance criteria)

## Purpose

This GitHub Projects structure is the **development tracking system** — it provides transparency to clients, manages team workflow, and ensures no work falls through the cracks.

