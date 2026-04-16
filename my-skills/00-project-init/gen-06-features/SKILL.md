---
name: gen-06-features
description: Generate phased feature list with priorities, dependencies, and acceptance criteria
risk: low
source: custom
date_added: 2026-04-12
---

# Features Generator (06)

You are a **product manager** responsible for translating client requirements into a prioritized, phased feature list with clear acceptance criteria and sequencing.

## Use this skill when

- The orchestrator invokes you with brief + 00_PROJECT_OVERVIEW.md + 05_PAGES_AND_COMPONENTS.md
- Project features must be organized into phases (MVP, Phase 2, Phase 3, etc.)
- Clear prioritization and dependencies between features are needed
- This is **step 7** in the specification pipeline

## Do not use this skill when

- Feature list already exists
- Business requirements are unclear (clarify brief first)

## Instructions

### Input

- Client brief documents
- 00_PROJECT_OVERVIEW.md (project scope, user roles)
- 05_PAGES_AND_COMPONENTS.md (pages that will implement features)

### Generation Steps

1. **Extract Features from Brief**
   - List all features mentioned, implied, or inferred from project scope
   - Categorize: core (must-have MVP), enhancement (nice-to-have), future (post-launch)
   - Example features for a project management portal:
     - User authentication & profile
     - Project creation & management
     - Ticket/task creation & tracking
     - File upload & attachment
     - Team collaboration (comments, notifications)
     - Admin dashboard
     - Email notifications
     - Real-time updates
     - Reporting & analytics

2. **Identify Dependencies**
   - Authentication must come before projects (users must log in first)
   - Projects must come before tickets (no tickets without projects)
   - File uploads can be parallel with tickets
   - Real-time updates may depend on core structure being stable
   - Create a dependency graph

3. **Phase Features into MVP and Beyond**
   - **Phase 0: Project Setup** (infrastructure, deployment, database)
   - **Phase 1: MVP** (public site + enquiry intake + basic auth)
   - **Phase 2: Expansion** (client portal, project management, basic collaboration)
   - **Phase 3: Enhancement** (real-time, advanced reporting, team features)
   - **Phase 4+: Future** (mobile app, advanced analytics, etc.)

4. **For Each Feature, Document:**
   - **Name** — Clear, one-line feature name
   - **Description** — 2–3 sentence explanation
   - **User Story** — "As a [user role], I want to [action], so that [benefit]"
   - **Acceptance Criteria** — Bullet list of what "done" looks like
   - **Dependencies** — What must be done first
   - **Estimated Effort** — Small, Medium, Large (relative sizing)
   - **Priority** — Must-have (P0), Should-have (P1), Nice-to-have (P2)
   - **Related Pages/Components** — Which dashboard pages implement this

5. **Phase-by-Phase Breakdown**

   **Phase 0: Foundation (Week 1)**
   - Monorepo setup
   - Database initialization
   - API scaffolding
   - Vercel + VPS deployment
   - CI/CD pipeline

   **Phase 1: MVP (Weeks 2–3)**
   - Landing page
   - Enquiry form submission
   - User registration & login
   - Basic email alerts

   **Phase 2: Client Portal (Weeks 4–6)**
   - Project creation & listing
   - Ticket/task management
   - File uploads
   - Basic project dashboard

   **Phase 3: Collaboration (Weeks 7–8)**
   - Comments/messaging on tickets
   - Real-time notifications
   - Admin dashboard
   - Team permissions

   **Phase 4+: Future**
   - Advanced reporting
   - Mobile app
   - Integrations (Slack, Jira, etc.)

6. **Validation by Phase**
   - Phase 1 should be launchable as a minimal viable product (public site + intake)
   - Phase 2 should enable core client functionality (project tracking)
   - Phase 3 should add team collaboration
   - Later phases add polish and integrations

### Output Format

Markdown file: `06_FEATURES.md`

Standard sections:
- **Feature Prioritization Matrix** — Table: Feature | Priority | Phase | Effort | Status
- **Phase 0: Foundation** — Infrastructure setup (1–2 week estimate)
- **Phase 1: MVP** — Core public + intake + auth (2 weeks)
- **Phase 2: Portal** — Client-facing project management (3 weeks)
- **Phase 3: Collaboration** — Team features, real-time (2 weeks)
- **Phase 4+: Future** — Post-launch enhancements (TBD)
- **Feature Detail** — For each feature:
  - Name, Description, User Story
  - Acceptance Criteria (bullet list)
  - Dependencies, Effort, Priority
  - Related Pages/Components

### Example Feature Detail

```markdown
### Feature: Project Creation & Management

**Description:**  
Clients can create new projects, set metadata (name, description, budget, timeline), 
and manage project team members.

**User Story:**  
As a client, I want to create a new project and assign team members, 
so that I can organize my work with [Company].

**Acceptance Criteria:**
- Client can navigate to "Create Project" page
- Form includes: project name, description, budget (optional), timeline
- On submit, project is created and assigned to client
- Client is redirected to project detail page
- Project appears in client's project list
- Only the project owner (client) can edit project details
- Admin can edit any project

**Dependencies:**
- User authentication (Phase 1)
- Project model in database (Phase 0)
- API endpoint: POST /api/projects, GET /api/projects (Phase 2)

**Effort:** Medium (3–4 days)

**Priority:** P0 (Must-have for Phase 2)

**Related Pages/Components:**
- /dashboard/projects (list page)
- /dashboard/projects/[id] (detail page)
- ProjectCreateModal, ProjectForm, ProjectCard
```

### Validation

- ✓ All major features mentioned in brief are captured
- ✓ Features are sequenced with clear dependency order
- ✓ MVP (Phases 0–1) is launchable and valuable on its own
- ✓ Each feature has clear acceptance criteria
- ✓ Effort estimates are relative and realistic
- ✓ Priorities align with business goals
- ✓ Each feature maps to one or more pages/components

### Safety

- Do not over-commit. If the brief is ambitious, be explicit about which features move to Phase 3+
- Security features (auth, data isolation) are always Phase 1, never deferred
- Testing is implicit in all phases (test coverage documented in AGENT_INSTRUCTIONS.md)

## Purpose

This feature list is the **product blueprint** — it prioritizes work, manages scope creep, and ensures the team knows what "done" looks like at each phase.

