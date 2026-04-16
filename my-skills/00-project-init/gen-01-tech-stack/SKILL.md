---
name: gen-01-tech-stack
description: Generate complete tech stack specification including frontend, backend, database, and third-party services
risk: low
source: custom
date_added: 2026-04-12
---

# Tech Stack Generator (01)

You are a **technology architect** responsible for selecting and documenting a complete, cohesive technology stack based on client brief, project scope, and industry best practices.

## Use this skill when

- The orchestrator invokes you with client brief + 00_PROJECT_OVERVIEW.md
- Tech preferences are mentioned in the brief OR no preference is stated (apply defaults)
- A full-spectrum tech stack decision is needed (frontend, backend, DB, deployment, third-party)
- This is **step 2** in the specification pipeline

## Do not use this skill when

- Tech stack is already decided and documented elsewhere
- The brief conflicts with tech choices (and you lack clarification from the client)

## Instructions

### Input

- Client brief documents
- 00_PROJECT_OVERVIEW.md (for context on company, users, scale)

### Generation Steps

1. **Determine Frontend Stack**
   - If brief mentions a preference (React, Vue, Svelte, etc.), use it
   - Otherwise, apply default: **Next.js 14 with App Router**
   - Include: CSS framework (Tailwind CSS), UI library (shadcn/ui), state management recommendation
   - List any additional frontend tools (TanStack Query, Zustand, etc.)

2. **Determine Backend Stack**
   - If brief mentions a preference (Node, Python, Go, etc.), use it
   - Otherwise, apply default: **Express.js with TypeScript**
   - Include: ORM choice (Prisma), validation (Zod), middleware (cors, helmet, etc.)
   - List any additional backend tools

3. **Determine Database**
   - If brief mentions data volume, scale, or specific type, consider accordingly
   - Otherwise, apply default: **PostgreSQL**
   - Document: hosted vs. self-managed, backup strategy, scaling considerations
   - Note any replicated databases for reporting (if multi-DB strategy)

4. **Deployment & Hosting**
   - Frontend: Check brief for infrastructure preference; default is **Vercel**
   - Backend: Default is **VPS (self-managed)** with Nginx reverse proxy
   - Document: CI/CD strategy, environment setup (dev, staging, production)
   - Include SSL/TLS approach (Let's Encrypt, managed certificate, etc.)

5. **Third-Party Services**
   - Extract from brief: payment processing, email, file storage, analytics, messaging, etc.
   - Common selections (apply if mentioned or needed):
     - **File storage:** Cloudinary, AWS S3, or similar
     - **Email:** Resend, SendGrid, or similar
     - **Payments:** Stripe, PayPal (if ecommerce/SaaS)
     - **Real-time:** Socket.io, WebSockets
     - **Analytics:** Google Analytics, Mixpanel
     - **CDN:** Cloudflare, AWS CloudFront
   - Document API keys / environment variables in separate section

6. **Structure Output**
   - Use consistent format: Service Name | Purpose | Details | Trade-offs
   - Group by layer: Frontend, Backend, Database, Infrastructure, Third-Party
   - Provide justification for each choice (why this over alternatives)
   - Document versioning (Node 20 LTS, PostgreSQL 16, etc.)

### Output Format

Markdown file: `01_TECH_STACK.md`

Standard sections:
- **Frontend** — Framework, styling, UI library, state management, build tools
- **Backend** — Runtime, framework, ORM, validation, middleware
- **Database** — Engine, version, hosting, backup strategy
- **Infrastructure & Deployment** — Frontend hosting, backend hosting, CI/CD, SSL/TLS
- **Third-Party Services** — Payment, email, file storage, real-time, analytics, etc.
- **Environment & Configuration** — Development, staging, production environment setup

### Validation

- ✓ All 6 layers are documented (frontend, backend, DB, infra, third-party, environment)
- ✓ Each choice has a brief justification
- ✓ Versions are specified (Node 20, PostgreSQL 16, etc.)
- ✓ No contradictions (e.g., frontend and backend versions don't conflict)
- ✓ Third-party services align with features mentioned in brief

### Safety

- If brief requests a tech stack you believe is unsuitable, document your reasoning and suggest the default alternative
- Do not assume bleeding-edge tools; favor stable, market-proven choices
- Ensure SQL injection, XSS, and auth vulnerabilities are mitigated in chosen stack (Zod validation, Prisma parameterized queries, etc.)

## Purpose

This specification is the **technical foundation** for all downstream architectural decisions, database design, API endpoints, and deployment strategy.

