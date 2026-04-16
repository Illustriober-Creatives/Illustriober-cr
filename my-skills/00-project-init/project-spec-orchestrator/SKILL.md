---
name: project-spec-orchestrator
description: Master orchestrator that chains all project specification generators to create complete ai-spec folder from client brief
risk: medium
source: custom
date_added: 2026-04-12
invokes:
  - gen-00-project-overview
  - gen-01-tech-stack
  - gen-02-architecture
  - gen-03-database-schema
  - gen-04-api-spec
  - gen-05-pages-components
  - gen-06-features
  - gen-07-implementation-plan
  - gen-08-third-party-env
  - gen-09-ui-design-system
  - gen-10-agent-instructions
  - gen-11-github-tasks
---

# Project Specification Orchestrator

You are an **AI project automation orchestrator** responsible for transforming a client brief (markdown documents) into a complete, production-ready project specification suite (11 ai-spec files + GitHub project tasks).

## Use this skill when

- A new client project has been scoped via Claude chat or internal briefing documents
- You need to generate a comprehensive `ai-spec/` folder containing all project specifications
- The client brief includes: project name, description, scope, target audience, key features, preferred tech (if any)
- You're automating the project initialization workflow for standardized delivery
- GitHub project task tracking is required for transparency to the client

## Do not use this skill when

- The client brief is incomplete or missing critical scope information
- Technical decisions have already been made and documented in existing specifications
- This is a continuation/update to an existing project (use individual generator skills instead)
- The brief is still under discussion—wait until client requirements are finalized

## Instructions

### Input Requirements

The orchestrator expects the following inputs:

1. **Client Brief Documents** (markdown): 1–3 documents provided from Claude chat or internal BA notes containing:
   - Project name & company identity
   - Business description & goals
   - Target users/roles
   - Core features & scope
   - Preferred tech stack (if specified)
   - Third-party integrations mentioned
   - Design preferences / branding notes
   - Timeline expectations

2. **Reference Specification** (optional): Existing `ai-spec/` folder for consistency reference (e.g., from Illustriober Creatives' baseline)

### Execution Sequence

Execute the following generator skills in **strict order**. Each skill's output becomes input to the next.

#### Phase 1: Foundation
1. **Invoke gen-00-project-overview**
   - Input: Client brief documents
   - Output: `00_PROJECT_OVERVIEW.md` (company identity, user roles, lifecycle)
   - Wait for completion before proceeding

2. **Invoke gen-01-tech-stack**
   - Input: Client brief + 00_PROJECT_OVERVIEW.md
   - Output: `01_TECH_STACK.md` (frontend, backend, database, third-party services)
   - Wait for completion before proceeding

3. **Invoke gen-02-architecture**
   - Input: Client brief + 00_PROJECT_OVERVIEW.md + 01_TECH_STACK.md
   - Output: `02_ARCHITECTURE.md` (monorepo structure, routes, deployment)
   - Wait for completion before proceeding

#### Phase 2: Data & API
4. **Invoke gen-03-database-schema**
   - Input: Client brief + all prior outputs
   - Output: `03_DATABASE_SCHEMA.md` (Prisma models, enums, relationships)
   - Wait for completion before proceeding

5. **Invoke gen-04-api-spec**
   - Input: Client brief + all prior outputs
   - Output: `04_API_SPEC.md` (REST endpoints, auth requirements, error handling)
   - Wait for completion before proceeding

#### Phase 3: UI & Frontend
6. **Invoke gen-05-pages-components**
   - Input: Client brief + all prior outputs
   - Output: `05_PAGES_AND_COMPONENTS.md` (pages, components, layouts)
   - Wait for completion before proceeding

7. **Invoke gen-09-ui-design-system** *(out-of-order for early design clarity)*
   - Input: Client brief + design preferences
   - Output: `09_UI_DESIGN_SYSTEM.md` (colors, typography, patterns)
   - Parallel with step 6 if design is specified in brief

#### Phase 4: Features & Planning
8. **Invoke gen-06-features**
   - Input: Client brief + all prior outputs
   - Output: `06_FEATURES.md` (phased feature list with priorities)
   - Wait for completion before proceeding

9. **Invoke gen-07-implementation-plan**
   - Input: Client brief + all prior outputs (especially 06_FEATURES.md)
   - Output: `07_IMPLEMENTATION_PLAN.md` (week-by-week milestones & tasks)
   - Wait for completion before proceeding

#### Phase 5: Configuration & Governance
10. **Invoke gen-08-third-party-env**
    - Input: Client brief + 01_TECH_STACK.md
    - Output: `08_THIRD_PARTY_AND_ENV.md` (service configs, env variables)
    - Parallel with phase 4 if independent

11. **Invoke gen-10-agent-instructions**
    - Input: ALL prior outputs (00–09)
    - Output: `AGENT_INSTRUCTIONS.md` (security rules, naming, build order, strictness)
    - Aggregate governance rules from all specifications

#### Phase 6: GitHub & Deliverables
12. **Invoke gen-11-github-tasks**
    - Input: Client brief + 07_IMPLEMENTATION_PLAN.md + 06_FEATURES.md
    - Output: `GITHUB_PROJECT_TASKS.md` (milestone/issue structure for GitHub Projects)
    - Final output

### Validation & Consistency Checks

After all skills complete, perform the following validations:

- **Cross-file references:** Verify that tech stack in `01_TECH_STACK.md` is referenced consistently in `02_ARCHITECTURE.md` and `08_THIRD_PARTY_AND_ENV.md`
- **Database alignment:** Check that API endpoints in `04_API_SPEC.md` have corresponding database models in `03_DATABASE_SCHEMA.md`
- **Feature completeness:** Ensure all features mentioned in client brief appear in `06_FEATURES.md`
- **Milestone sequencing:** Validate that `07_IMPLEMENTATION_PLAN.md` phases align with `06_FEATURES.md` feature priorities
- **Role-based access:** Verify that user roles in `00_PROJECT_OVERVIEW.md` are referenced in API auth (04) and GitHub tasks (11)
- **GitHub issue mapping:** Check that every task in `07_IMPLEMENTATION_PLAN.md` has a corresponding GitHub issue in `11_GITHUB_TASKS.md`

If validation fails, **return detailed error report specifying which cross-references are broken**.

### Output Structure

Upon completion, the orchestrator produces:

```
ai-spec/
├── 00_PROJECT_OVERVIEW.md
├── 01_TECH_STACK.md
├── 02_ARCHITECTURE.md
├── 03_DATABASE_SCHEMA.md
├── 04_API_SPEC.md
├── 05_PAGES_AND_COMPONENTS.md
├── 06_FEATURES.md
├── 07_IMPLEMENTATION_PLAN.md
├── 08_THIRD_PARTY_AND_ENV.md
├── 09_UI_DESIGN_SYSTEM.md
├── 10_AGENT_INSTRUCTIONS.md (output from gen-10)
└── 11_GITHUB_PROJECT_TASKS.md (output from gen-11)
```

All files are formatted as markdown with consistent structure and cross-references.

## Safety

- **Do not skip validation steps.** Inconsistent specifications lead to architectural misalignment during development.
- **Preserve security rules.** The agent instructions generated in step 11 must include JWT auth, data isolation, and input validation—non-negotiable.
- **Honor the build sequence.** The 7-step implementation plan is the source of truth for development order. Deviations must be justified in notes.
- **Verify all data flows.** Database models must match API request/response shapes; do not allow orphaned endpoints or fields.
- **Test with reference spec.** If a reference `ai-spec/` folder exists (e.g., Illustriober baseline), compare outputs for consistency in style and completeness.

## Purpose

This skill transforms unstructured client briefs into a **complete, AI-ready project blueprint** that:

1. **Specifies everything** — no ambiguity on tech, architecture, database, API, pages, features, or timeline
2. **Enables parallel development** — teams can work on different components (web, api, shared packages) simultaneously because specs are clear and consistent
3. **Ensures governance** — agent instructions embed security rules, naming conventions, and strictness rules so future AI agents building the project follow proven practices
4. **Provides client transparency** — GitHub project tasks can be immediately imported to track progress against milestones
5. **Scales the studio** — standardized process means new projects follow the same automation flow, reducing manual overhead

## Capabilities

### Core Capability: Orchestration
- Chain 12 specialist generator skills in dependency-correct sequence
- Pass outputs between skills automatically
- Wait for skill completion before proceeding to next
- Handle failures gracefully (report which skill failed and why)

### Consistency Assurance
- Track all generated files and outputs
- Validate cross-references (tech stack used consistently, API matches DB, etc.)
- Report validation results with specific file/section pointers
- Suggest corrections if inconsistencies detected

### Error Reporting
- If a generator skill returns incomplete or malformed output, reject it and report the specific error to the user
- Provide regeneration instructions (which skill to re-run with adjusted input)
- Do not proceed to next skill if prior skill failed

### Client Brief Interpretation
- Extract project name, company identity, scope, roles, features from brief documents
- Infer tech stack preferences if not explicitly stated (apply Illustriober defaults: Next.js, Express, PostgreSQL)
- Identify third-party services mentioned (Stripe, Slack, etc.) and flag for gen-08

### Output Validation
- Ensure all 11 files are generated
- Verify each file has proper markdown sections and structure
- Check for broken references between files
- Provide summary report: file count, validation passes/fails, ready-for-development status

