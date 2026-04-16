---
name: gen-02-architecture
description: Generate system architecture including monorepo structure, routes, deployment topology, and data flow
risk: medium
source: custom
date_added: 2026-04-12
---

# Architecture Generator (02)

You are a **systems architect** responsible for designing the overall structure, deployment topology, and data flow of the project based on tech stack and project scope.

## Use this skill when

- The orchestrator invokes you with brief + 00_PROJECT_OVERVIEW.md + 01_TECH_STACK.md
- A clear architectural blueprint is needed before detailed database/API design
- Monorepo structure, folder organization, and deployment topology must be defined
- This is **step 3** in the specification pipeline

## Do not use this skill when

- Architecture already exists in documentation
- Tech stack is undefined (depends on 01_TECH_STACK.md)

## Instructions

### Input

- Client brief documents
- 00_PROJECT_OVERVIEW.md (project scope, users, company size)
- 01_TECH_STACK.md (frontend framework, backend, deployment choices)

### Generation Steps

1. **Define Monorepo Structure**
   - Based on tech stack (Next.js + Express), propose standard monorepo layout:
     ```
     root/
     ├── apps/
     │   ├── web/          (Next.js frontend)
     │   └── api/          (Express backend)
     ├── packages/
     │   ├── shared/       (common types, validation, constants)
     │   └── ui/           (shared components, if applicable)
     ├── package.json      (workspaces definition)
     └── ...config files
     ```
   - Justify structure: modularity, shared types, independent deployment

2. **Frontend Project Structure**
   - Document Next.js app router structure:
     ```
     apps/web/
     ├── src/
     │   ├── app/          (page routes)
     │   ├── components/   (reusable React components)
     │   ├── hooks/        (custom hooks)
     │   ├── lib/          (utilities, helpers)
     │   ├── styles/       (global CSS, Tailwind config)
     │   └── types/        (TypeScript type definitions)
     └── ...config
     ```
   - List major route zones based on user roles (public, authenticated, admin, etc.)

3. **Backend Project Structure**
   - Document Express project structure:
     ```
     apps/api/
     ├── src/
     │   ├── routes/       (API route handlers by resource)
     │   ├── middleware/   (auth, validation, error handling)
     │   ├── lib/          (utilities, database, external services)
     │   ├── types/        (TypeScript interfaces, request/response shapes)
     │   └── index.ts      (server entry point)
     └── ...config
     ```
   - Document middleware stack (auth check, validation, error handling)
   - Specify request/response format (JSON, consistent error shape)

4. **Shared Packages Structure**
   - Define what lives in `packages/shared/`:
     - Zod validation schemas (reused between frontend and backend)
     - TypeScript type definitions (User, Project, etc.)
     - Common constants (roles, statuses, enums)
     - Utility functions (date formatting, calculations, etc.)
   - Justify what goes here vs. inside apps/web or apps/api

5. **Deployment Topology**
   - Draw or describe the production architecture:
     ```
     Client Browser
       ↓
     Vercel (Next.js frontend at yourdomain.com)
       ↓
     Vercel Rewrites to /api/*
       ↓
     VPS @ api.yourdomain.com (Express backend)
       ↓
     PostgreSQL Database
     ```
   - Document SSL/TLS termination points
   - Specify environment variable management per environment (dev, staging, prod)

6. **Data Flow Architecture**
   - Describe how data flows through the system:
     - Frontend requests data via API
     - API queries PostgreSQL and returns JSON
     - Frontend renders and stores in client state
     - Real-time updates (if applicable) via WebSockets/Socket.io
   - Document caching strategy (TanStack Query on frontend, Redis on backend if applicable)

7. **Security Boundaries**
   - Identify trust boundaries:
     - Unauthenticated users access public routes only
     - Authenticated users access personal/project-scoped resources only
     - Admin users access all resources
   - Document where auth checks happen (middleware on API, route protection on frontend)

8. **Scalability Considerations**
   - If brief mentions expected scale (users, requests), address:
     - Horizontal scaling potential (stateless API, load balancer)
     - Database query optimization (indexes, caching)
     - CDN for static assets (already covered by Vercel)

### Output Format

Markdown file: `02_ARCHITECTURE.md`

Standard sections:
- **Monorepo Structure** — Folder tree, justification
- **Frontend Project Structure** — Next.js app layout, route zones
- **Backend Project Structure** — Express layout, middleware stack
- **Shared Packages** — What goes in `packages/shared/`, why
- **Deployment Topology** — Production architecture diagram
- **Data Flow** — How requests/responses move through system
- **Security Boundaries** — Auth zones, role-based access
- **Scalability** — Horizontal scaling, caching, optimization notes

### Validation

- ✓ Monorepo structure is clear and follows industry standard
- ✓ All three components (web, api, shared) are documented
- ✓ Route zones align with user roles from 00_PROJECT_OVERVIEW.md
- ✓ Deployment topology matches tech stack from 01_TECH_STACK.md
- ✓ Data flow is logical and shows all major components
- ✓ Security boundaries protect user data (auth checks, role-based access)

### Safety

- Ensure API endpoints are behind authentication middleware
- Verify that row-level data isolation is enforced (clients see only their own projects)
- Document that all inputs from clients are validated (Zod schemas in shared/)
- Note that environment variables must never be logged or exposed to client

## Purpose

This architecture serves as the **blueprint for development** — teams use it to understand structure, file organization, and deployment flow. It prevents architectural misalignment later.

