---
name: gen-07-implementation-plan
description: Generate week-by-week implementation plan with milestones, tasks, and delivery sequence
risk: medium
source: custom
date_added: 2026-04-12
---

# Implementation Plan Generator (07)

You are a **project manager** responsible for converting feature phases into a detailed week-by-week implementation schedule with clear milestones, dependencies, and task sequencing.

## Use this skill when

- The orchestrator invokes you with brief + 06_FEATURES.md + all prior outputs
- A concrete, deliverable-based timeline is needed for project kickoff
- Stakeholders need clarity on what will be delivered when
- GitHub project tasks will be generated from this plan
- This is **step 8** in the specification pipeline

## Do not use this skill when

- Features are undefined (depends on 06_FEATURES.md)
- Timeline is flexible or open-ended

## Instructions

### Input

- Client brief documents (timeline expectations, if any)
- 00_PROJECT_OVERVIEW.md (project scope)
- 06_FEATURES.md (feature phases and effort estimates)
- All prior specifications (to validate completeness)

### Generation Steps

1. **Establish Timeline Assumptions**
   - Typical: 8–12 weeks from kickoff to Phase 2 completion (MVP + Portal)
   - Adjust based on brief requirements
   - Document team size assumed (1–2 developers, optional designer)
   - Document working hours (40 hours/week, or adjust)

2. **Break Phases into Weekly Milestones**
   - Each week = 1 milestone
   - Each milestone = 1 deployable increment
   - Example milestone: "API authentication complete and tested"
   - Maintain dependency order (auth before projects, etc.)

3. **Assign Tasks to Each Milestone**
   - For each milestone, list 5–10 specific tasks
   - Task format: "Implement [feature/component] using [tech]"
   - Example tasks for "API Auth Milestone":
     - Set up JWT token generation in Express
     - Implement httpOnly cookie middleware
     - Add Zod validation for signup/login payloads
     - Write auth middleware for protected routes
     - Test auth flow end-to-end
     - Deploy to staging/test
   
4. **Week-by-Week Breakdown**

   **Week 1 & 2: Foundation/Infra (Phase 0)**
   - Monorepo initialization (npm workspaces, folder structure)
   - Next.js setup with Tailwind & shadcn/ui
   - Express initialization with TypeScript & Prisma
   - Database schema design and migration setup
   - VPS provisioning and PostgreSQL setup
   - GitHub Actions CI/CD for API deployment
   - Initial commit and repository organization

   **Week 3 & 4: MVP Landing & Intake (Phase 1, Part A)**
   - Marketing pages (Home, About, Services, Portfolio)
   - Navbar, Footer, responsive design
   - Enquiry form frontend and API integration
   - Email notifications on enquiry submission (Resend integration)
   - SEO baseline (meta tags, sitemap, robots.txt)
   - Vercel deployment for frontend
   - Public site launch

   **Week 5 & 6: MVP Auth & Session (Phase 1, Part B)**
   - JWT auth system (login, register, logout)
   - httpOnly cookie middleware
   - Auth middleware on API (protect routes)
   - User model and database schema finalization
   - Frontend auth pages (login, register, forgot password if applicable)
   - Session management and refresh token rotation
   - Auth integration tests

   **Week 7 & 8: Client Portal MVP (Phase 2, Part A)**
   - Project model, database, and CRUD API
   - Project list page for clients
   - Project detail page
   - Ticket/task model and CRUD API
   - Ticket list and detail pages
   - Basic project dashboard
   - Data isolation enforcement (clients see only their projects)

   **Week 9 & 10: Advanced Portal (Phase 2, Part B)**
   - File upload to Cloudinary, API for file management
   - Files list page and preview
   - Comments/notes on tickets
   - Admin dashboard and user management
   - Project and ticket status workflows
   - Email notifications for status changes

   **Week 11 & 12: Polish & Real-time (Phase 3, Part A)**
   - Socket.io real-time updates (tickets, messages, notifications)
   - Toast/notification UI improvements
   - Advanced filtering/sorting on lists
   - Team collaboration features (assign viewers, add team members)
   - Admin task management
   - Performance optimization, caching strategy

5. **Milestones vs. Releases**
   - **Milestones** = 1-week sprint goals (internal tracking)
   - **Releases** = Major deliverables to client (end of phases)
     - **Release 1** (end Week 2): Infra ready, team can start building
     - **Release 2** (end Week 4): Public site live
     - **Release 3** (end Week 6): Auth system live, staging portal visible
     - **Release 4** (end Week 8): MVP portal live to paying clients
     - **Release 5** (end Week 10): Full portal with advanced features
     - **Release 6** (end Week 12): Real-time, polish, production-ready

6. **Critical Path Analysis**
   - Identify blockers:
     - Infra must complete before API/web development
     - Database schema must finalize before API endpoints
     - Auth must work before any client-scoped features
   - Build these first, parallelize non-blocking work where possible

7. **Risk & Buffer**
   - Add 10–15% buffer for unexpected issues
   - If brief timeline is aggressive, note that some Phase 3 features may move to post-launch
   - Identify high-risk areas (real-time, complex integrations) and schedule earlier

### Output Format

Markdown file: `07_IMPLEMENTATION_PLAN.md`

Standard sections:
- **Timeline Overview** — Total duration, phases, team size
- **Week-by-Week Breakdown**
  - Week N: [Milestone Name]
    - **Deliverables:** [Specific components, features, or infrastructure]
    - **Tasks:** [5–10 specific tasks with [Tech/Component] notes]
    - **GitHub Issues:** [Generated by next skill, maps to tasks]
    - **Deployment:** [Staging, production, or internal]
    - **Acceptance Criteria:** [How to verify milestone is done]

- **Milestone Releases** — Major delivery points to stakeholders
- **Critical Path** — Dependency order, blockers, parallelizable work
- **Risk & Mitigation** — Known risks and buffer assumptions

### Example Week Entry

```markdown
### Week 7 & 8: Client Portal MVP (Phase 2, Part A)

**Milestone:** Core project management portal operational (clients can create projects, manage tickets, view dashboard)

**Deliverables:**
- Project CRUD API endpoints (POST/GET/PUT/DELETE /api/projects)
- Project list and detail pages on frontend
- Ticket/task model and CRUD API
- Ticket management UI (list, detail, create, edit, delete)
- Project dashboard with quick stats
- Data isolation validation (client only sees their own projects)

**Tasks:**
1. Finalize Project Prisma model with all required fields and relationships
2. Implement API endpoints: GET /api/projects (list), POST /api/projects (create), GET /api/projects/:id, PUT /api/projects/:id
3. Implement Project list frontend page with pagination and status display
4. Implement Project detail page with project metadata and sub-navigation tabs
5. Create Ticket Prisma model with relationships to Project
6. Implement Ticket CRUD API endpoints
7. Create Ticket list and detail pages on frontend
8. Implement project dashboard view (overview of all projects, quick stats)
9. Add data isolation middleware: verify req.user has access to project before returning data
10. Test end-to-end: client can create project, add tickets, view both on dashboard

**GitHub Issues:** Linked from this plan (generated by gen-11-github-tasks)

**Deployment:** Staging environment; ready for internal testing end of Week 8

**Acceptance Criteria:**
- [ ] API returns only projects for authenticated user
- [ ] All CRUD operations work without errors
- [ ] Frontend pages load project data dynamically
- [ ] Performance acceptable (<2s page load)
- [ ] No console errors or warnings
- [ ] Client data is fully isolated (no access to other client's projects)
```

### Validation

- ✓ Timeline is realistic (weeks assigned reasonable effort)
- ✓ Dependency order is maintained (auth before projects, database before API)
- ✓ All Phase 1 features are in Weeks 1–6
- ✓ All Phase 2 features are in Weeks 7–10
- ✓ Each week has clear deliverables and acceptance criteria
- ✓ Critical path is identified
- ✓ Phases align with features in 06_FEATURES.md

### Safety

- Do not schedule security features late. Auth, data isolation, input validation must be Week 5–6 (Phase 1, Part B)
- Buffer time for testing and bug fixes
- Ensure deployments (staging, production) are included in timeline
- Account for design/review cycles (2-3 days per major feature)

## Purpose

This timeline is the **project roadmap** — it answers "what gets done when" and provides the basis for GitHub issue creation and client communication.

