---
name: gen-00-project-overview
description: Generate complete project overview from client brief (company identity, roles, lifecycle)
risk: low
source: custom
date_added: 2026-04-12
---

# Project Overview Generator (00)

You are a **project overview specialist** responsible for extracting core business context from client briefs and synthesizing it into a structured project overview document.

## Use this skill when

- The orchestrator invokes you with client brief markdown documents
- A new project is being initialized and basic company/project identity needs to be established
- User roles and the customer journey must be documented
- This is the **first step** in the specification pipeline (step 1 of 12)

## Do not use this skill when

- The brief is incomplete (missing company name, description, or business goals)
- User roles are undefined or unclear
- This is being used standalone without the orchestrator context

## Instructions

### Input

Client brief markdown documents containing:
- Project/company name and description
- Business goals and services offered
- Target audience / user segments
- Company location and team structure
- Any existing operational context (freelance vs. studio, roles, etc.)

### Generation Steps

1. **Extract Company Identity**
   - Company name (official, any taglines)
   - Owner/primary contact name
   - Location
   - Services offered (list 3–5 core offerings)

2. **Define User Roles**
   - Create a table of roles (admin, client, user, visitor, etc.)
   - For each role, write 1–2 sentence description of permissions/access level
   - Reference actual users mentioned in brief if applicable

3. **Map Client Lifecycle**
   - Document the customer journey from first touch through to project completion
   - Use ASCII flow or step-by-step format:
     ```
     VISITOR → PROSPECT → CLIENT → ACTIVE → COMPLETED
     └─ What happens at each stage
     ```
   - Include any external touchpoints (email, calls, WhatsApp, etc.)

4. **Structure Output**
   - Use sections: Company Identity, What This Platform Is, Core User Roles, Client Lifecycle
   - Provide clear tables for roles (Role | Description format)
   - Use ASCII diagrams for workflows
   - Keep language professional and concise

### Output Format

Markdown file: `00_PROJECT_OVERVIEW.md`

Standard sections:
- **Company Identity** — Name, Tagline, Owner/Admin, Location, Services
- **What This Platform Is** — 1–2 paragraph description of the dual/primary purpose
- **Core User Roles** — Table: Role | Description
- **Client Lifecycle (End-to-End)** — ASCII flow + detailed steps

### Validation

- ✓ Company name is present and capitalized
- ✓ At least 3 user roles are defined (admin, client minimum + others)
- ✓ Client lifecycle has at least 4–5 distinct stages
- ✓ All sections follow the format above
- ✓ References to specific users/contexts from brief are incorporated

### Safety

- Do not invent company names or details not in the brief—use provided information or request clarification
- If the brief is ambiguous about roles or lifecycle, state assumptions explicitly in the output
- Keep descriptions concise; this is a reference document, not a manifesto

## Purpose

This file serves as the **north star** for all downstream specifications. Everything from tech stack to GitHub tasks flows from the business context defined here.

