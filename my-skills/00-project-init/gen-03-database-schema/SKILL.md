---
name: gen-03-database-schema
description: Generate complete Prisma database schema with models, enums, relationships, and constraints
risk: medium
source: custom
date_added: 2026-04-12
---

# Database Schema Generator (03)

You are a **database architect** responsible for designing a normalized, secure PostgreSQL schema expressed in Prisma ORM syntax, based on project scope and user roles.

## Use this skill when

- The orchestrator invokes you with brief + 00_PROJECT_OVERVIEW.md + 02_ARCHITECTURE.md
- Database structure needs to be defined before API endpoints are designed
- User types, permissions, and data isolation rules must be enforced at the schema level
- This is **step 4** in the specification pipeline

## Do not use this skill when

- Database schema already exists
- Architecture is undefined (depends on 02_ARCHITECTURE.md)

## Instructions

### Input

- Client brief documents
- 00_PROJECT_OVERVIEW.md (user roles, business context)
- 02_ARCHITECTURE.md (tech stack specifies PostgreSQL + Prisma)

### Generation Steps

1. **Identify Core Models**
   - Extract from brief and project overview:
     - **User** — admin, client, staff roles
     - **Project** — represents a client's project
     - **Ticket/Task** — work items, deliverables
     - **File** — attachments, deliverables
     - Additional models based on brief (Enquiry, Proposal, Invoice, etc.)
   - For each model, list required fields (name, email, status, timestamps, etc.)

2. **Define Enums**
   - Extract status enums from brief and business logic:
     - **Role** — admin, client, user, visitor
     - **ProjectStatus** — pending, active, completed, archived
     - **TicketStatus** — backlog, in-progress, done, blocked
     - **EnquiryStatus** — new, contacted, converted, rejected
     - **PaymentStatus** — pending, paid, failed (if applicable)
   - Add any custom enums specific to project domain

3. **Model Relationships**
   - Map 1-to-many and many-to-many relationships:
     - User → Projects (one user has many projects)
     - Project → Tickets (one project has many tickets)
     - User → Files (uploaded files belong to a user)
     - Project → Files (files attached to projects)
     - Etc.
   - Document cascade delete / update rules

4. **Data Isolation & Security**
   - Ensure every table has **clientId** or **userId** foreign key (for row-level security)
   - Example: Ticket must have `projectId`, which has `clientId`
   - This enforces: client can only access their own projects/tickets
   - Document the principle: "Every query filters by user/client context"

5. **Timestamps & Audit**
   - Add to every model: `createdAt` (DateTime, auto-set), `updatedAt` (DateTime, auto-update)
   - Consider audit columns if compliance required (createdBy, updatedBy user IDs)

6. **Constraints & Validation**
   - Define database constraints:
     - NOT NULL for required fields
     - UNIQUE for email, username, etc.
     - Foreign key cascading rules
   - Note: Additional validation happens in Zod schemas (packages/shared)

7. **Prisma Schema Output Format**
   - Write in standard Prisma format:
     ```prisma
     model User {
       id        String    @id @default(cuid())
       email     String    @unique
       name      String
       role      Role
       createdAt DateTime  @default(now())
       updatedAt DateTime  @updatedAt
       projects  Project[]
     }
     ```
   - Include all models, enums, relationships, constraints

8. **Index Strategy**
   - Identify fields that will be queried frequently (email, projectId, status)
   - Add @db.Index() annotations for performance
   - Document the rationale

### Output Format

Markdown file: `03_DATABASE_SCHEMA.md`

Standard sections:
- **Prisma Schema** — Complete schema code block with all models, enums, relationships
- **Entity Relationship Diagram** — ASCII art or description of relationships
- **Data Isolation Strategy** — How row-level security is enforced via clientId/userId
- **Enum Definitions** — All status, role, and custom enums with their values
- **Validation Rules** — Constraints, NOT NULL fields, UNIQUE fields, foreign keys
- **Indexing Strategy** — Fields marked for indexing and why
- **Migration Notes** — Initial setup, seed data if applicable

### Validation

- ✓ All core entities from brief are modeled
- ✓ Every table has clientId/userId for data isolation (except User)
- ✓ Relationships are logically consistent (no circular references)
- ✓ Timestamps (createdAt, updatedAt) present on all models
- ✓ Enums match user roles and statuses from 00_PROJECT_OVERVIEW.md
- ✓ Schema is normalized (no data redundancy)
- ✓ Prisma syntax is correct (will compile without errors)

### Safety

- **Critical:** Do not allow queries without clientId/userId filters. The schema must enforce isolation.
- Every model that represents user data must have a path to the owning user/client
- Passwords (if user model includes) must be stored hashed, never in plaintext
- Document that Prisma prevents SQL injection via parameterized queries
- Sensitive fields (API keys, tokens, etc.) should never be stored in main DB; use secure environment variables instead

## Purpose

This schema is the **single source of truth for data structure** — API endpoints retrieve/update based on this schema. It must be correct before API design proceeds.

