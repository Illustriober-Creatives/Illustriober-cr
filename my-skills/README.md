# Vibecoding Skills Library

A curated collection of 73 specialized AI skills organized by development workflow and technology stack for **Illustriober Creatives** projects.

## Overview

This folder contains carefully selected skills from the awesome-skills repository, organized into 15 logical categories that align with the company's tech stack and development workflow. The skills are designed to support full-stack development with:

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker, Kubernetes, Terraform, Vercel

## Folder Structure

```
vibecoding-skills/
├── 00-project-init/          (13 skills) Project specification & setup automation
├── 01-languages-runtime/     (6 skills)  TypeScript, JavaScript, Node.js expertise
├── 02-frontend-web/          (10 skills) React, Next.js, Tailwind, shadcn patterns
├── 03-backend-api/           (6 skills)  API design, GraphQL, backend patterns
├── 04-database-orm/          (10 skills) PostgreSQL, Prisma, SQL optimization
├── 05-testing-qa/            (6 skills)  TDD, E2E, unit testing strategies
├── 06-debugging-performance/ (7 skills)  Debugging, profiling, optimization
├── 07-deployment-devops/     (9 skills)  Docker, K8s, Terraform, CI/CD, Vercel
├── 08-code-quality/          (6 skills)  Code review, refactoring, clean code
├── 09-design-ui/             (0 skills)  UI/UX design (placeholder)
├── 10-security/              (0 skills)  Security & compliance (placeholder)
├── 11-architecture-patterns/ (0 skills)  Architecture decisions (placeholder)
├── 12-integrations-services/ (0 skills)  Third-party integrations (placeholder)
├── 13-advanced-patterns/     (0 skills)  Event sourcing, CQRS, AI patterns (placeholder)
└── 14-documentation-utils/   (0 skills)  Documentation generation (placeholder)
```

## Category Guide

### 00-project-init (13 Skills)
**Purpose**: Automate project specification generation from client briefs

**Skills**:
- `project-spec-orchestrator` - Master controller that chains all spec generators
- `gen-00-project-overview` - Business context & client objectives
- `gen-01-tech-stack` - Technology selection & justification
- `gen-02-architecture` - System architecture & design
- `gen-03-database-schema` - Prisma schema generation
- `gen-04-api-spec` - REST API endpoint specification
- `gen-05-pages-components` - Frontend page & component structure
- `gen-06-features` - Feature prioritization & user stories
- `gen-07-implementation-plan` - Week-by-week timeline
- `gen-08-third-party-env` - Service configuration & environment
- `gen-09-ui-design-system` - Design tokens & component library
- `gen-10-agent-instructions` - AI agent behavior & security rules
- `gen-11-github-tasks` - GitHub project tasks formatting

**Usage**: Invoke `project-spec-orchestrator` with a client brief to generate complete `ai-spec/` folder.

### 01-languages-runtime (6 Skills)
**Purpose**: Expert guidance on TypeScript, JavaScript, and Node.js

**Covers**:
- TypeScript advanced patterns and type safety
- Modern JavaScript (ES2024+) best practices
- Node.js runtime optimization
- Package management and dependency handling

### 02-frontend-web (10 Skills)
**Purpose**: Next.js and React development expertise

**Covers**:
- Next.js 14 (App Router, Server Components, Middleware)
- React component patterns & hooks
- Tailwind CSS styling & responsive design
- shadcn/ui component implementation
- State management (TanStack Query)
- Form handling & validation (Zod)

### 03-backend-api (6 Skills)
**Purpose**: Backend architecture and API design

**Covers**:
- RESTful API design principles
- Express.js routing & middleware
- GraphQL implementation
- Error handling & logging
- API documentation
- Backend security patterns

### 04-database-orm (10 Skills)
**Purpose**: PostgreSQL and Prisma expertise

**Covers**:
- Prisma ORM advanced patterns
- SQL optimization & query performance
- Database schema design
- Migration strategies
- Relationships & data modeling
- Connection pooling & transactions

### 05-testing-qa (6 Skills)
**Purpose**: Testing strategies and quality assurance

**Covers**:
- Test-driven development (TDD)
- End-to-end testing frameworks
- Unit testing patterns
- Integration testing
- Test data management
- Continuous integration testing

### 06-debugging-performance (7 Skills)
**Purpose**: Performance optimization and debugging

**Covers**:
- JavaScript profiling & memory leaks
- Network performance optimization
- Bundle analysis & code splitting
- Database query optimization
- Production debugging
- Performance monitoring tools

### 07-deployment-devops (9 Skills)
**Purpose**: Deployment infrastructure and CI/CD

**Covers**:
- Docker containerization
- Kubernetes orchestration
- Terraform infrastructure-as-code
- GitHub Actions CI/CD
- Vercel deployment (frontend)
- VPS & Linux server management
- Container registry management
- Monitoring & logging

### 08-code-quality (6 Skills)
**Purpose**: Code review and maintainability

**Covers**:
- Code review best practices
- Refactoring techniques
- Clean code principles
- Design patterns
- Code complexity reduction
- Linting & formatting standards

### 09-14: Placeholder Categories
**Status**: Currently empty, reserved for future skills

These categories are reserved for specialized domains:
- **09-design-ui**: UI/UX design system skills
- **10-security**: Security auditing and compliance
- **11-architecture-patterns**: Microservices, monorepo patterns
- **12-integrations-services**: Stripe, SendGrid, Cloudinary
- **13-advanced-patterns**: Event sourcing, CQRS, event-driven architecture
- **14-documentation-utils**: Auto-documentation generation tools

As new relevant skills are discovered, they can be moved into these categories.

## Quick Start

**To use a skill in Copilot Chat**:

1. Open the skill's `SKILL.md` file
2. Reference it in your Copilot Chat prompt:
   ```
   @skill 02-frontend-web/next-js-patterns
   How should I structure this page layout?
   ```

**To invoke the project spec orchestrator**:

```
@skill 00-project-init/project-spec-orchestrator

Client Brief:
E-commerce platform for handmade crafts marketplace, need user authentication,
product listings, shopping cart, and seller dashboard.
```

## Statistics

| Category | Skills | Status |
|----------|--------|--------|
| Project Initialization | 13 | ✅ Active |
| Languages & Runtime | 6 | ✅ Active |
| Frontend Web | 10 | ✅ Active |
| Backend API | 6 | ✅ Active |
| Database & ORM | 10 | ✅ Active |
| Testing & QA | 6 | ✅ Active |
| Debugging & Performance | 7 | ✅ Active |
| Deployment & DevOps | 9 | ✅ Active |
| Code Quality | 6 | ✅ Active |
| Design & UI | 0 | 🔲 Placeholder |
| Security | 0 | 🔲 Placeholder |
| Architecture Patterns | 0 | 🔲 Placeholder |
| Integrations & Services | 0 | 🔲 Placeholder |
| Advanced Patterns | 0 | 🔲 Placeholder |
| Documentation Utils | 0 | 🔲 Placeholder |
| **TOTAL** | **73** | ✅ Ready |

## Tech Stack Alignment

All curated skills directly support Illustriober Creatives' tech stack:

- ✅ **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- ✅ **Backend**: Express.js, TypeScript, RESTful APIs
- ✅ **Database**: PostgreSQL, Prisma ORM
- ✅ **Testing**: Unit, integration, and E2E testing
- ✅ **Deployment**: Docker, Kubernetes, Terraform, Vercel, GitHub Actions
- ✅ **Code Quality**: Clean code, refactoring, design patterns
- ✅ **Performance**: Optimization, debugging, profiling

## Cleanup History

**Original State**: 1,324+ skills from awesome-skills fork (95% unused)
**Final State**: 73 curated skills + 13 project initialization skills = 86 total active resources
**Removed**: 1,324 unnecessary awesome-skills directories

This curation ensures fast skill discovery, reduced context noise, and technology-focused recommendations.

## Notes

- Skills are organized by development workflow phase (init → code → test → deploy)
- Each skill has its own `SKILL.md` documentation file
- Skills can reference and chain with other skills
- Empty placeholder categories can be expanded as needed
- Use Copilot's `@skill` mentions to reference skills in chat conversations

---

**Last Updated**: 2024
**Total Active Skills**: 73 (across 9 populated categories)
**Status**: ✅ Production Ready
