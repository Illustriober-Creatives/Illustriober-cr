# Project Initialization Skill Pack

**Complete, AI-ready project specification automation for client projects.**

This skill pack transforms a client brief (1–3 markdown documents) into a comprehensive project specification suite (11 ai-spec files + GitHub project tasks) in a single orchestrated workflow.

---

## What This Does

The **Project Specification Orchestrator** chains 12 specialized generator skills to produce:

1. **11 AI-Spec Files** (complete project blueprint)
   - `00_PROJECT_OVERVIEW.md` — Company identity, user roles, customer lifecycle
   - `01_TECH_STACK.md` — Frontend, backend, database, deployment, third-party services
   - `02_ARCHITECTURE.md` — Monorepo structure, deployment topology, data flow
   - `03_DATABASE_SCHEMA.md` — Prisma schema with models, enums, relationships
   - `04_API_SPEC.md` — REST endpoints, auth, request/response shapes, error handling
   - `05_PAGES_AND_COMPONENTS.md` — Page structure, component hierarchy, routes
   - `06_FEATURES.md` — Phased feature list with priorities and dependencies
   - `07_IMPLEMENTATION_PLAN.md` — Week-by-week milestones and task sequencing
   - `08_THIRD_PARTY_AND_ENV.md` — Service integration, environment variables
   - `09_UI_DESIGN_SYSTEM.md` — Colors, typography, components, accessibility
   - `AGENT_INSTRUCTIONS.md` — Security rules, naming conventions, build discipline

2. **GITHUB_PROJECT_TASKS.md**
   - GitHub-formatted milestones and issues
   - Ready for import to GitHub Projects
   - Provides client transparency and team tracking

---

## When to Use

**Use this skill pack when:**
- A new client project brief is ready for specification
- You need a complete project blueprint before development starts
- Client transparency and GitHub issue tracking are required
- Your team needs clear, AI-readable specifications for parallel work

**Do NOT use when:**
- Project specs already exist (use individual generator skills instead)
- Business requirements are still being finalized (wait for client confirmation)
- This is an update/continuation to an existing project

---

## How to Use

### Prerequisites

- Client brief documents (1–3 markdown files with project description, scope, features, no tech decisions needed yet)
- Access to the orchestrator skill and all 12 generator skills in my-skills/

### Workflow

1. **Prepare Client Brief**
   - Have the client or BA write 1–3 markdown documents:
     - Project name, description, company background
     - Business goals & target users
     - Core features & scope
     - Timeline expectations (if any)
     - Any preferred tech/tools (optional—defaults applied if not specified)
   - Save to a folder (e.g., `client-brief/` or similar)

2. **Invoke Orchestrator Skill**
   ```
   Invoke: project-spec-orchestrator
   Input: Client brief markdown files + optional reference ai-spec folder
   ```

3. **Orchestrator Chains All 12 Skills**
   - Executes skills 00–11 in strict dependency order
   - Each skill's output feeds into the next
   - Validates cross-file consistency
   - Generates all 11 ai-spec files + GitHub tasks markdown

4. **Review & Validate Output**
   - Check generated ai-spec files for completeness
   - Validate consistency across files
   - Review GitHub project structure for upcoming team work
   - Make adjustments manually if needed (edit individual files)

5. **Create ai-spec/ Folder in Project**
   - Copy/move all generated files into `ai-spec/` folder at project root
   - Commit to git with message: "chore: initialize ai-spec from client brief"

6. **Import GitHub Issues (Optional)**
   - Use GitHub UI to create milestones from GITHUB_PROJECT_TASKS.md
   - Create issues and link to milestones
   - Add labels and estimates per the spec
   - Or: Automate import via GitHub API if desired

7. **Share with Team & Client**
   - Team uses ai-spec folder as the source of truth for all development
   - Client reviews GitHub project for transparency into deliverables/timeline
   - Reference ai-spec in code reviews, PRs, and decisions

---

## Skill Overview

### Master Orchestrator

**`project-spec-orchestrator/SKILL.md`**
- Chains all 12 generator skills in dependency order
- Validates consistency across generated files
- Returns all 11 ai-spec files + GitHub tasks markdown

### Generator Skills (11 Total)

Each generator skill produces ONE ai-spec file. They build on prior outputs.

| Skill | Output File | Input | Purpose |
|-------|-------------|-------|---------|
| gen-00-project-overview | 00_PROJECT_OVERVIEW.md | Brief | Extract company identity, roles, lifecycle |
| gen-01-tech-stack | 01_TECH_STACK.md | Brief + 00 | Select frontend, backend, DB, services |
| gen-02-architecture | 02_ARCHITECTURE.md | Brief + 00 + 01 | Design monorepo, deployment, data flow |
| gen-03-database-schema | 03_DATABASE_SCHEMA.md | Brief + 00 + 02 | Create Prisma schema, models, enums |
| gen-04-api-spec | 04_API_SPEC.md | Brief + 03 + 02 | Design REST API, endpoints, auth |
| gen-05-pages-components | 05_PAGES_AND_COMPONENTS.md | Brief + 04 + 00 | Define pages, routes, component hierarchy |
| gen-06-features | 06_FEATURES.md | Brief + 00 + 05 | Prioritize features, create phased list |
| gen-07-implementation-plan | 07_IMPLEMENTATION_PLAN.md | Brief + 06 + all prior | Create week-by-week milestone plan |
| gen-08-third-party-env | 08_THIRD_PARTY_AND_ENV.md | Brief + 01 | Document services, env configuration |
| gen-09-ui-design-system | 09_UI_DESIGN_SYSTEM.md | Brief + design prefs | Define colors, typography, components |
| gen-10-agent-instructions | AGENT_INSTRUCTIONS.md | All prior (00–09) | Aggregate security, naming, build rules |
| gen-11-github-tasks | GITHUB_PROJECT_TASKS.md | Brief + 07 + 06 | Convert plan to GitHub milestones/issues |

---

## Dependency Graph

```
Client Brief
    ↓
gen-00 (Project Overview)
    ↓
gen-01 (Tech Stack) ← also needs gen-00
    ↓
gen-02 (Architecture) ← also needs gen-00, gen-01
    ↓
gen-03 (Database) ← also needs gen-02
    ↓
gen-04 (API Spec) ← also needs gen-03, gen-02
    ↙        ↖
gen-05 (Pages)    gen-06 (Features) ← also needs gen-00, gen-05
    ↓              ↓
    └──→ gen-07 (Implementation Plan) ← needs both
         ↓
    gen-10 (Agent Instructions) ← needs all 00–09
    
gen-08 (Third-Party) ← parallel with gen-07, needs gen-01
gen-09 (Design System) ← parallel, needs brief + design prefs

    ↓
gen-11 (GitHub Tasks) ← needs gen-07, gen-06
```

**Key constraint:** Skills must run in order. Each skill waits for prior skills to complete before starting.

---

## Output Files Explained

### ai-spec/ Files (11 Total)

Each file is self-contained but cross-referenced. All files use consistent sections and structure.

**Phase 1: Foundation (00–02)**
- Establishes business context, tech choices, system architecture

**Phase 2: Data & API (03–04)**
- Defines database structure and API contract

**Phase 3: Frontend & Features (05–06)**
- Defines pages, components, and product roadmap

**Phase 4: Planning & Governance (07–10)**
- Converts features to timeline, consolidates rules

**Phase 5: GitHub (11)**
- Makes timeline/rules trackable via GitHub Projects

### GITHUB_PROJECT_TASKS.md

Structured like this:

```markdown
# Project Tasks [Client Name]

## Milestone [Phase 0] Week 1-2: Foundation
- Description
- Deliverables
- Success criteria
- Issues (with titles, descriptions, labels, effort)

## Issue #1: [Title]
- Description, acceptance criteria
- Type (Feature/Improvement/Bug/Chore)
- Labels (priority, effort, component, phase)
- Effort (Small/Medium/Large)

## Milestone [Phase 1] Week 3-4: MVP
...
```

**Import into GitHub:**
1. Create GitHub Project (board or table view)
2. Create milestones matching GITHUB_PROJECT_TASKS.md
3. Manually create issues (or automate via GitHub API)
4. Add labels: p0/p1/p2 (priority), small/medium/large (effort), web/api (component), phase-0/1/2 (phase)
5. Link issues to milestones

---

## Validation & Quality

The orchestrator performs these validations before completing:

1. **Structural** — All 11 files generated with expected sections
2. **Cross-Reference** — Tech stack consistent across files, API matches database, etc.
3. **Completeness** — All features from brief appear in feature list and GitHub tasks
4. **Build Order** — Milestones follow dependency order (auth before projects, etc.)
5. **Security** — Agent instructions include auth, validation, data isolation rules

If validation fails, the orchestrator reports which checks failed and which files to re-generate.

---

## Customization & Overrides

### Default Tech Stack (if not specified in brief)

- **Frontend:** Next.js 14 with App Router, Tailwind CSS, shadcn/ui
- **Backend:** Express.js with TypeScript
- **Database:** PostgreSQL
- **Hosting:** Vercel (frontend), VPS (backend)
- **Services:** Cloudinary (files), Resend (email), Socket.io (real-time)

To override, specify in client brief:
- "We prefer Vue instead of React" → gen-01 applies Vue instead

### Default Feature Phases

- **Phase 0** (1–2 weeks): Infrastructure & setup
- **Phase 1** (2–3 weeks): Public + Enquiry + Auth (MVP)
- **Phase 2** (3–4 weeks): Client portal + projects
- **Phase 3** (2 weeks): Real-time & collaboration

To adjust, note in brief:
- "We need MVP in 3 weeks" or "Client portal is Phase 1"

### Individual Skill Usage (Advanced)

If you only need one ai-spec file (e.g., just the architecture), you can invoke individual skills:

```
Invoke: gen-02-architecture
Input: Brief + 00_PROJECT_OVERVIEW.md + 01_TECH_STACK.md
Output: 02_ARCHITECTURE.md
```

But this is not recommended—use the orchestrator for full consistency.

---

## Common Scenarios

### Scenario 1: New SaaS Project (Client Portal)

**Client Brief Mentions:**
- Multi-user project management platform
- Clients, admins, team members
- Projects, tickets, file uploads
- Real-time collaboration

**Expected Output:**
- 12 weeks, 3 main phases
- Full portal with all features
- Real-time updates baked into Phase 3

### Scenario 2: Simple Marketing Site + API

**Client Brief Mentions:**
- Landing page + blog + contact form
- Leads captured to database
- Admin dashboard for lead review

**Expected Output:**
- 4–5 weeks, 2 phases
- Phase 1: Public site + form
- Phase 2: Admin dashboard
- Limited real-time features

### Scenario 3: Redesign/Rebuild Existing Product

**NOT** recommended for this skill pack.
- Use gen-00 through gen-06 to document the existing product
- Manually create 07_IMPLEMENTATION_PLAN.md for migration phases
- Use gen-11 to convert to GitHub tasks

---

## Troubleshooting

### Skill Fails or Returns Incomplete Output

- **Check:** Is the client brief complete? (all required sections present)
- **Check:** Are prior skills in the chain generating good output?
- **Action:** Review the failed skill's instructions and re-invoke with corrected input

### Generated Specs Seem Generic

- **This is normal.** The orchestrator creates a baseline based on the brief.
- **Expected:** You then customize/refine manually (edit ai-spec files)
- **Goal:** The orchestrator saves 80% of specification work; you add domain-specific details

### Team Says "This Doesn't Match Our Current Process"

- **ai-spec is flexible.** Edit any file to match your process.
- **Rules to keep:** AGENT_INSTRUCTIONS.md security rules are non-negotiable.
- **Customizable:** Feature phases, timeline, tech stack (if documented in brief)

---

## Files in This Skill Pack

```
project-spec-orchestrator/
├── SKILL.md                  # Master orchestrator skill definition
└── README.md                 # This file

gen-00-project-overview/
├── SKILL.md

gen-01-tech-stack/
├── SKILL.md

gen-02-architecture/
├── SKILL.md

gen-03-database-schema/
├── SKILL.md

gen-04-api-spec/
├── SKILL.md

gen-05-pages-components/
├── SKILL.md

gen-06-features/
├── SKILL.md

gen-07-implementation-plan/
├── SKILL.md

gen-08-third-party-env/
├── SKILL.md

gen-09-ui-design-system/
├── SKILL.md

gen-10-agent-instructions/
├── SKILL.md

gen-11-github-tasks/
├── SKILL.md
```

Each skill folder contains **ONE SKILL.md file** with complete instructions.

---

## Reference: Illustriober Creatives Baseline

This skill pack is modeled after **Illustriober Creatives** (a design + development studio platform):

- **ai-spec example:** `/ai-spec/` in the Illustriober project
- **Tech stack baseline:** Next.js 14 + Express + PostgreSQL + Tailwind + shadcn/ui
- **Feature model:** Dual-purpose (public site + client dashboard)
- **Security baseline:** JWT auth, httpOnly cookies, row-level data isolation

You can use the Illustriober ai-spec/ as a reference or baseline for client projects.

---

## Support & Evolution

**This skill pack is:**
- Production-ready for client projects
- Opinionated (enforces best practices, security, structure)
- Flexible (customizable via brief, manual edits)
- Extensible (add new generator skills as needed)

**Future improvements:**
- Integrate with GitHub API for direct issue creation
- Add more optional skills (mobile app, analytics, advanced integrations)
- Support for other tech stacks (if client requests)

---

**Last Updated:** 2026-04-12  
**Version:** 1.0  
**Status:** Production Ready
