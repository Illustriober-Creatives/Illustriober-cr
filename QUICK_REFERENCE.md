# Quick Reference: Using the Skill Pack

## In 30 Seconds

```bash
# 1. Client provides brief (1-3 markdown files)
# 2. Invoke orchestrator:
Skill: project-spec-orchestrator
Input: /path/to/client-brief/*.md

# 3. Wait ~60 seconds
# 4. Get complete ai-spec/ folder + GitHub tasks
# 5. Team starts development, client views GitHub Projects
```

## One-Liner Summary

**13 specialized skills that transform a client brief into a complete, production-ready project specification (11 files), GitHub project structure, and AI-readable governance rules — in <1 minute.**

---

## The 13 Skills

| Skill | Input | Output | Purpose |
|-------|-------|--------|---------|
| **Orchestrator** | Brief | Chains all 12 | Master controller |
| **gen-00** | Brief | 00_PROJECT_OVERVIEW | Business context |
| **gen-01** | Brief+00 | 01_TECH_STACK | Technology choices |
| **gen-02** | Brief+00+01 | 02_ARCHITECTURE | System design |
| **gen-03** | Brief+00+02 | 03_DATABASE_SCHEMA | Data models |
| **gen-04** | Brief+03+02 | 04_API_SPEC | API contract |
| **gen-05** | Brief+04+00 | 05_PAGES_AND_COMPONENTS | Frontend design |
| **gen-06** | Brief+00+05 | 06_FEATURES | Feature phases |
| **gen-07** | Brief+06+all | 07_IMPLEMENTATION_PLAN | Timeline + milestones |
| **gen-08** | Brief+01 | 08_THIRD_PARTY_AND_ENV | Service integration |
| **gen-09** | Brief+design | 09_UI_DESIGN_SYSTEM | Design language |
| **gen-10** | Brief+all(00-09) | AGENT_INSTRUCTIONS | Governance rules |
| **gen-11** | Brief+07+06 | GITHUB_PROJECT_TASKS | GitHub issues template |

---

## Typical Workflow

```
DAY 1: Brief Gathering
  └─ BA/PM collects client requirements into 1-3 markdown docs

DAY 1: Specification Generation
  └─ Run orchestrator skill (< 1 minute execution)
  └─ Review generated ai-spec/ folder (15 min)
  └─ Make manual adjustments if needed (30 min)

DAY 2: GitHub Setup
  └─ Import milestones & issues from GITHUB_PROJECT_TASKS.md
  └─ Add labels, assign estimated effort

DAY 2: Kickoff
  └─ Team clones repo, reads ai-spec/
  └─ Development starts immediately
  └─ Client has full GitHub project visibility

Week 1: Infra phase
  └─ Database, API scaffolding, deployment setup

Week 2-3: MVP Phase
  └─ Public site, enquiry form, user authentication

Week 4-6: Portal Phase
  └─ Client dashboard, project management

Week 7+: Enhancement Phase
  └─ Real-time features, advanced integrations
```

---

## File Structure After Generation

```
project-root/
├── ai-spec/                      ← Generated folder
│   ├── 00_PROJECT_OVERVIEW.md
│   ├── 01_TECH_STACK.md
│   ├── 02_ARCHITECTURE.md
│   ├── 03_DATABASE_SCHEMA.md
│   ├── 04_API_SPEC.md
│   ├── 05_PAGES_AND_COMPONENTS.md
│   ├── 06_FEATURES.md
│   ├── 07_IMPLEMENTATION_PLAN.md
│   ├── 08_THIRD_PARTY_AND_ENV.md
│   ├── 09_UI_DESIGN_SYSTEM.md
│   ├── AGENT_INSTRUCTIONS.md
│   └── GITHUB_PROJECT_TASKS.md
│
├── apps/
│   ├── web/                      ← Frontend (Next.js)
│   └── api/                      ← Backend (Express)
├── packages/
│   └── shared/                   ← Common types & validation
│
├── package.json                  ← Monorepo root
├── .env.example                  ← From 08_THIRD_PARTY_AND_ENV.md
├── README.md                     ← Repository guide
└── ...other config files
```

---

## What Each File Contains

| File | Sections | Key Info |
|------|----------|----------|
| **00_PROJECT_OVERVIEW** | Company, Roles, Lifecycle | Why this project exists |
| **01_TECH_STACK** | Frontend, Backend, DB, Services | What we're building with |
| **02_ARCHITECTURE** | Monorepo, Routes, Deployment, Data Flow | How components fit together |
| **03_DATABASE_SCHEMA** | Models, Enums, Relationships, Isolation | Where data lives |
| **04_API_SPEC** | Endpoints, Auth, Request/Response, Errors | API contract |
| **05_PAGES_AND_COMPONENTS** | Routes, Pages, Components, Hierarchy | Frontend structure |
| **06_FEATURES** | Phases, Priorities, Acceptance Criteria | What gets built when |
| **07_IMPLEMENTATION_PLAN** | Milestones, Week-by-week, Tasks, Risks | Timeline & sequencing |
| **08_THIRD_PARTY_AND_ENV** | Services, API Keys, Environment Setup | Configuration |
| **09_UI_DESIGN_SYSTEM** | Colors, Typography, Components, Accessibility | Visual language |
| **AGENT_INSTRUCTIONS** | Security, Naming, Build Rules, Testing, TypeScript | How to code correctly |
| **GITHUB_PROJECT_TASKS** | Milestones, Issues, Labels, Acceptance Criteria | Team tracking |

---

## Key Features

### ✅ Complete
- Nothing is missing or ambiguous
- All files cross-referenced and consistent
- From business requirements → technical blueprint → GitHub tracking

### ✅ Secure
- JWT auth, httpOnly cookies
- Row-level data isolation (clientId filtering)
- SQL injection, XSS, CSRF protections
- Rate limiting, input validation required

### ✅ Proven
- Based on Illustriober Creatives baseline (production project)
- Customizable (tech stack, features, timeline adjustable via brief)
- Enforces best practices (TypeScript strict, error handling, testing)

### ✅ Traceable
- GitHub-ready issues with acceptance criteria
- Every feature maps to a task
- Client transparency built-in

### ✅ AI-Ready
- Written for AI agents (clear rules, examples, expected outputs)
- AGENT_INSTRUCTIONS.md provides governance
- Specifications testable and verifiable

---

## Common Use Cases

### Scenario A: SaaS Project (12 weeks)
- Multi-tenant platform
- Phase 1: Public site (2 weeks)
- Phase 2: Auth + portal (4 weeks)
- Phase 3: Real-time + advanced (3 weeks)

### Scenario B: Simple Marketing Site + API (6 weeks)
- Landing page + enquiry form
- Admin dashboard
- Limited third-party integration

### Scenario C: Native App + Backend (16 weeks)
- Mobile-first design
- Backend API
- Extended Phase 3 for polish

**Orchestrator generates appropriate specs for any scenario** based on brief.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Orchestrator fails | Check brief completeness (all sections present) |
| Generated specs seem generic | Normal—customize ai-spec files manually |
| Tech stack doesn't match our preference | Edit 01_TECH_STACK.md; other files auto-update |
| Timeline too aggressive | Edit 07_IMPLEMENTATION_PLAN.md phases & weeks |
| Missing a feature | Add to 06_FEATURES.md, re-gen 07 & 11 |
| GitHub issues format wrong | Edit GITHUB_PROJECT_TASKS.md and import manually |

---

## Success Criteria

✅ Generation completes without errors
✅ All 12 files present in ai-spec/
✅ Cross-references validated
✅ Security rules (auth, isolation, validation) present
✅ GitHub project structure complete
✅ Team can start development immediately
✅ Client understands timeline & deliverables

---

## Files to Share

| Audience | Files |
|----------|-------|
| **Dev Team** | All 11 ai-spec files (source of truth) |
| **Client** | GitHub project + 00, 06, 07 (business context) |
| **PM/BA** | 06_FEATURES.md + 07_IMPLEMENTATION_PLAN.md |
| **DevOps** | 02_ARCHITECTURE.md + 08_THIRD_PARTY_AND_ENV.md |
| **Designer** | 05_PAGES_AND_COMPONENTS.md + 09_UI_DESIGN_SYSTEM.md |
| **QA** | AGENT_INSTRUCTIONS.md + 11_GITHUB_PROJECT_TASKS.md |

---

## Skill Pack Location

```
my-skills/
├── project-spec-orchestrator/      ← Start here
│   ├── SKILL.md                    ← Master logic
│   └── README.md                   ← Usage guide
│
├── gen-00-project-overview/
├── gen-01-tech-stack/
├── gen-02-architecture/
├── gen-03-database-schema/
├── gen-04-api-spec/
├── gen-05-pages-components/
├── gen-06-features/
├── gen-07-implementation-plan/
├── gen-08-third-party-env/
├── gen-09-ui-design-system/
├── gen-10-agent-instructions/
└── gen-11-github-tasks/

Each skill = 1 SKILL.md file
Total = 13 skills with ~2,400 lines of documentation
```

---

## Next: Sample Usage

**Brief Input:**
```markdown
# AI Code Review Tool SaaS

A platform for distributed teams to collaborate on code reviews.

- Multi-tenant (teams)
- GitHub integration
- Real-time commenting, AI suggestions
- Pricing tiers
- Timeline: MVP in 10 weeks
```

**Orchestrator Output (60 seconds later):**
- ✅ 00_PROJECT_OVERVIEW.md (team roles, lifecycle)
- ✅ 01_TECH_STACK.md (Next.js, Express, PostgreSQL, GitHub API)
- ✅ 02_ARCHITECTURE.md (multi-tenant design, GitHub sync)
- ✅ 03_DATABASE_SCHEMA.md (Team, Repo, Review, Comment models)
- ✅ 04_API_SPEC.md (GitHub webhook receivers, review endpoints)
- ✅ 05_PAGES_AND_COMPONENTS.md (dashboard, review page, settings)
- ✅ 06_FEATURES.md (Phase 1: public + auth, Phase 2: reviews, Phase 3: AI)
- ✅ 07_IMPLEMENTATION_PLAN.md (12-week timeline with milestones)
- ✅ 08_THIRD_PARTY_AND_ENV.md (GitHub API, OpenAI for suggestions)
- ✅ 09_UI_DESIGN_SYSTEM.md (Tailwind config, components)
- ✅ AGENT_INSTRUCTIONS.md (data isolation, API token handling)
- ✅ GITHUB_PROJECT_TASKS.md (80+ issues, 12 milestones)

**Team starts immediately** with complete blueprint.

---

**Ready to use?**  
→ See [SKILL_PACK_SUMMARY.md](SKILL_PACK_SUMMARY.md) for full guide  
→ See [SKILL_PACK_ARCHITECTURE.md](SKILL_PACK_ARCHITECTURE.md) for visual diagrams  
→ Open [project-spec-orchestrator/README.md](my-skills/project-spec-orchestrator/README.md) for detailed instructions

Google Search Console
This is the one external setup I would treat as mandatory.

Add a Domain property for your domain.
Verify ownership using a DNS record in Cloudflare.
Submit your sitemap: https://yourdomain.com/sitemap.xml.
Use URL Inspection on /, /about, /services, etc., then request indexing for important pages.
Official docs:

Add property
Verify ownership
URL Inspection / request indexing
Sitemaps
What You Do Not Need

You do not need to manually submit every page to Google if your sitemap is live.
You do not need extra SEO tools before launch.
Cloudflare and Vercel alone do not guarantee indexing; they only make the site reachable.
What Happens After Deploy
Once deployed on the real domain, this should work:

robots.txt will be available
sitemap.xml will be available
canonicals/meta tags will be live
bots can crawl public pages
private pages like login/dashboard should stay out of the index
What does not happen instantly:

Google does not index immediately
search snippets can take days or weeks to settle
ranking takes longer than indexing
Recommended Minimum Launch Checklist

Deploy to the final production domain
Confirm only one canonical domain wins (www or non-www) and redirect the other
Check https://yourdomain.com/robots.txt
Check https://yourdomain.com/sitemap.xml
Add domain to Search Console
Verify via Cloudflare DNS
Submit sitemap
Request indexing for the homepage and 3–5 core pages
Optional But Worth Doing

Bing Webmaster Tools
GA4 for traffic measurement
Rich Results Test for schema validation: Rich Results Test
If you want, I can give you a step-by-step exact setup for your current Cloudflare + Vercel domain, including which DNS records to create and what to click in Search Console.