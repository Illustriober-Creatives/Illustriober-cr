# Project Initialization Skill Pack - Visual Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT BRIEF (Input)                      │
│  - Project name & description                                  │
│  - Target users & features                                     │
│  - Preferred tech (optional)                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  project-spec-orchestrator         │
        │  (Master Controller Skill)         │
        │                                    │
        │  - Chains all 12 generators        │
        │  - Validates consistency           │
        │  - Reports completion              │
        └─────────┬──────────────┬───────────┘
                  │              │
        ┌─────────▼──────┐      └──────────────────────────────┐
        │ Sequential     │                                     │
        │ Execution      │                                     │
        │ with Deps      │                                     │
        │ Checking       │                                     │
        └────────┬───────┘                                     │
                 │                                             │
        ┌────────▼──────────────────────────────────────────────┘
        │
        ├─→ gen-00: Project Overview
        │   └─ Input: Brief
        │   └─ Output: 00_PROJECT_OVERVIEW.md
        │
        ├─→ gen-01: Tech Stack
        │   └─ Input: Brief + 00
        │   └─ Output: 01_TECH_STACK.md
        │
        ├─→ gen-02: Architecture
        │   └─ Input: Brief + 00 + 01
        │   └─ Output: 02_ARCHITECTURE.md
        │
        ├─→ gen-03: Database Schema
        │   └─ Input: Brief + 00 + 02
        │   └─ Output: 03_DATABASE_SCHEMA.md
        │
        ├─→ gen-04: API Spec
        │   └─ Input: Brief + 03 + 02
        │   └─ Output: 04_API_SPEC.md
        │
        ├─→ gen-05: Pages & Components
        │   └─ Input: Brief + 04 + 00
        │   └─ Output: 05_PAGES_AND_COMPONENTS.md
        │
        ├─→ gen-06: Features
        │   └─ Input: Brief + 00 + 05
        │   └─ Output: 06_FEATURES.md
        │
        ├─→ gen-07: Implementation Plan
        │   └─ Input: Brief + 06 + ALL
        │   └─ Output: 07_IMPLEMENTATION_PLAN.md
        │
        ├─→ gen-08: Third-Party & Env
        │   └─ Input: Brief + 01
        │   └─ Output: 08_THIRD_PARTY_AND_ENV.md
        │
        ├─→ gen-09: UI Design System
        │   └─ Input: Brief + design prefs
        │   └─ Output: 09_UI_DESIGN_SYSTEM.md
        │
        ├─→ gen-10: Agent Instructions
        │   └─ Input: Brief + ALL (00–09)
        │   └─ Output: AGENT_INSTRUCTIONS.md
        │
        ├─→ gen-11: GitHub Tasks
        │   └─ Input: Brief + 07 + 06
        │   └─ Output: GITHUB_PROJECT_TASKS.md
        │
        └─ VALIDATION
           ├─ Cross-references ✓
           ├─ Completeness ✓
           ├─ Consistency ✓
           └─ Security Rules ✓
                     │
                     ▼
        ┌────────────────────────────────────┐
        │        OUTPUT FILES (12 Total)     │
        │                                    │
        │  ai-spec/                          │
        │  ├── 00_PROJECT_OVERVIEW.md       │
        │  ├── 01_TECH_STACK.md             │
        │  ├── 02_ARCHITECTURE.md           │
        │  ├── 03_DATABASE_SCHEMA.md        │
        │  ├── 04_API_SPEC.md               │
        │  ├── 05_PAGES_AND_COMPONENTS.md  │
        │  ├── 06_FEATURES.md               │
        │  ├── 07_IMPLEMENTATION_PLAN.md   │
        │  ├── 08_THIRD_PARTY_AND_ENV.md   │
        │  ├── 09_UI_DESIGN_SYSTEM.md      │
        │  ├── AGENT_INSTRUCTIONS.md        │
        │  └── GITHUB_PROJECT_TASKS.md      │
        │                                    │
        └────────────────────────────────────┘
                     │
        ┌────────────┴──────────────┬────────────────┐
        │                           │                │
        ▼                           ▼                ▼
    ┌───────────┐          ┌──────────────┐  ┌──────────────┐
    │ Dev Team  │          │ GitHub       │  │ Client       │
    │ (Read     │          │ Projects     │  │ Portal       │
    │ ai-spec   │          │ (Imported)   │  │ (Transparent)│
    │ to build) │          │              │  │              │
    └───────────┘          └──────────────┘  └──────────────┘

```

## Skill Dependencies (DAG - Directed Acyclic Graph)

```
                    Brief
                      │
                      ▼
                    gen-00
                    (Overview)
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
      gen-01       gen-05        gen-09
    (Tech Stack) (Pages)      (Design)
        │             │
        │             ▼
        │           gen-06
        │          (Features)
        │             │
        ▼             ▼
      gen-02       gen-07
    (Architecture) (Timeline)
        │          /  /  \
        ▼         /  /    \
      gen-03    /  /       \
      (Database)  /         \
        │        /           \
        ▼       /             ▼
      gen-04   /            gen-08
      (API)   /           (Services)
        │    /
        │   /            gen-10
        │  /            (Agent Rules)
        │ /              /
        ▼▼              /
      ─────────────────/
              │
              ▼
            gen-11
         (GitHub Tasks)
```

## File Flow Example

### Input Phase
```
my-client-brief/
├── overview.md          ← Company, goals, features
├── target-users.md      ← User roles, personas
└── timeline.md          ← Launch expectations
```

### Processing Phase
```
orchestrator
  │
  ├─→ Read: brief files
  ├─→ Invoke gen-00, wait ✓
  ├─→ Invoke gen-01, wait ✓
  ├─→ Invoke gen-02, wait ✓
  ├─→ ... (continue through gen-11) ...
  └─→ Validate all outputs
```

### Output Phase
```
ai-spec/
├── 00_PROJECT_OVERVIEW.md       (Business context)
├── 01_TECH_STACK.md             (Technology)
├── 02_ARCHITECTURE.md           (System design)
├── 03_DATABASE_SCHEMA.md        (Data models)
├── 04_API_SPEC.md               (Backend contract)
├── 05_PAGES_AND_COMPONENTS.md  (Frontend structure)
├── 06_FEATURES.md               (Phased roadmap)
├── 07_IMPLEMENTATION_PLAN.md   (Week-by-week timeline)
├── 08_THIRD_PARTY_AND_ENV.md   (Integrations & config)
├── 09_UI_DESIGN_SYSTEM.md      (Visual language)
├── AGENT_INSTRUCTIONS.md        (Governance rules)
└── GITHUB_PROJECT_TASKS.md      (Issue tracker template)
```

## Execution Timeline

```
Timeline for Orchestrator to Generate Complete Spec:

gen-00  gen-01  gen-02  gen-03  gen-04  gen-05  gen-06  gen-07  gen-08  gen-09  gen-10  gen-11
  │       │       │       │       │       │       │       │       │       │       │       │
  └──┬────┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴──
     │        │       │       │       │       │       │       │       │       │       │
  2-3s      3-5s    4-6s    3-5s    4-6s    3-5s    3-5s    5-7s    3-4s    3-5s   5-8s   4-6s
   │        │       │       │       │       │       │       │       │       │       │       │
   └─────────────────────────────────────────────────────────────────────────────────────┘
                              Total: ~50-60 seconds

(Each skill runs sequentially, waiting for prior output)
```

## Validation Checkpoints

```
After all 12 skills complete:

Check 1: Structural
├─ 11 ai-spec files exist? ✓
├─ GitHub tasks file exists? ✓
└─ All markdown formatted correctly? ✓

Check 2: Cross-References
├─ Tech stack (01) referenced in architecture (02)? ✓
├─ Database models (03) match API endpoints (04)? ✓
├─ API endpoints (04) referenced in frontend pages (05)? ✓
├─ Features (06) map to GitHub tasks (11)? ✓
└─ Timeline (07) aligns with features (06)? ✓

Check 3: Completeness
├─ All brief requirements captured? ✓
├─ Auth/security in agent instructions (10)? ✓
├─ Data isolation rules enforced? ✓
└─ GitHub issues actionable & specific? ✓

Check 4: Security
├─ JWT/auth rules present? ✓
├─ Data isolation enforced? ✓
├─ Input validation required? ✓
├─ SQL injection prevention documented? ✓
└─ Rate limiting recommended? ✓

If ALL PASS → Output "READY FOR DEVELOPMENT"
```

## Team Handoff

```
      ai-spec/ Folder
          │
    ┌─────┼─────┬──────────┐
    │     │     │          │
    ▼     ▼     ▼          ▼
  Dev   PM   Client    DevOps
  │     │    │         │
  │     │    │         └─→ Deployment (02_ARCHITECTURE.md)
  │     │    │              Environment setup (08_..._ENV.md)
  │     │    │
  │     │    └─→ GitHub Projects (from 11_GITHUB_TASKS.md)
  │     │         Milestone review
  │     │
  │     └─→ Feature tracking (06_FEATURES.md)
  │          Timeline review (07_IMPLEMENTATION_PLAN.md)
  │
  └─→ Implementation
       Database (03_DATABASE_SCHEMA.md)
       API design (04_API_SPEC.md)
       Frontend pages (05_PAGES_AND_COMPONENTS.md)
       Design system (09_UI_DESIGN_SYSTEM.md)
       Rules (AGENT_INSTRUCTIONS.md)
```

## Customization Points

```
After generation, teams can customize:

├─ Technology choices (01_TECH_STACK.md)
│  └─ E.g., swap React for Vue, MySQL for PostgreSQL
│
├─ Architecture decisions (02_ARCHITECTURE.md)
│  └─ E.g., monorepo vs. multi-repo, serverless vs. VPS
│
├─ Feature phases (06_FEATURES.md)
│  └─ E.g., move Phase 3 features to Phase 2, add new features
│
├─ Timeline (07_IMPLEMENTATION_PLAN.md)
│  └─ E.g., accelerate from 12 weeks to 8 weeks
│
├─ Design system (09_UI_DESIGN_SYSTEM.md)
│  └─ E.g., swap colors, fonts, component patterns
│
└─ Governance (AGENT_INSTRUCTIONS.md)
   └─ E.g., add domain-specific rules, stricter/looser standards

NOTE: Security rules (10_AGENT_INSTRUCTIONS.md) are NON-NEGOTIABLE
      (auth, data isolation, validation, injection prevention)
```

## Integration with AI Agents

```
AI Agent Workflow:

1. Orchestrator calls gen-00
   └─ gen-00 generates 00_PROJECT_OVERVIEW.md

2. Orchestrator calls gen-01 with result from gen-00
   └─ gen-01 generates 01_TECH_STACK.md

3. Orchestrator calls gen-02 with results from gen-00 + gen-01
   └─ gen-02 generates 02_ARCHITECTURE.md

... (continue through gen-11) ...

After all complete:
- Orchestrator validates all 12 outputs
- Returns "READY" or error report
- Development AI agent reads ai-spec/ as instructions
- Developer reads AGENT_INSTRUCTIONS.md for rules
- Team uses GitHub Projects from gen-11 output
```

## Success Metrics

```
When skill pack execution completes successfully:

✅ Input
   ├─ Client brief received
   └─ Tech preferences identified (if any)

✅ Processing
   ├─ All 12 skills executed without error
   ├─ No circular dependencies
   ├─ All outputs validated

✅ Output
   ├─ 11 ai-spec files generated
   ├─ GITHUB_PROJECT_TASKS.md generated
   ├─ All internal cross-references consistent
   ├─ Features map to GitHub issues
   ├─ Timeline matches implementation plan

✅ Delivery
   ├─ Team can start development immediately
   ├─ Client can view GitHub project
   ├─ AI agents can read AGENT_INSTRUCTIONS.md
   ├─ No ambiguity in specs
   └─ Project delivery timeline clear
```

---

**This architecture transforms ad-hoc project planning into a systematic, repeatable, AI-friendly process.**
