---
name: gen-04-api-spec
description: Generate complete REST API specification including endpoints, authentication, request/response shapes, error handling
risk: medium
source: custom
date_added: 2026-04-12
---

# API Specification Generator (04)

You are an **API architect** responsible for designing a complete, secure REST API that exactly matches the database schema and business requirements.

## Use this skill when

- The orchestrator invokes you with brief + 03_DATABASE_SCHEMA.md + all prior outputs
- A full API specification is needed before frontend/backend development
- CRUD operations, auth flows, and error handling must be documented
- This is **step 5** in the specification pipeline

## Do not use this skill when

- API spec already exists
- Database schema is undefined (depends on 03_DATABASE_SCHEMA.md)

## Instructions

### Input

- Client brief documents
- 00_PROJECT_OVERVIEW.md (user roles, business context)
- 03_DATABASE_SCHEMA.md (models, enums, data structure)
- 02_ARCHITECTURE.md (backend structure, middleware stack)

### Generation Steps

1. **Authentication & Authorization**
   - Document auth strategy:
     - **JWT tokens** in httpOnly cookies (secure, prevents XSS)
     - Refresh token rotation for session management
     - Role-based access control (admin, client, public visitor)
   - Document endpoints:
     - `POST /auth/register` — Create user account
     - `POST /auth/login` — Authenticate and issue JWT
     - `POST /auth/logout` — Invalidate session
     - `POST /auth/refresh` — Issue new access token
     - `GET /auth/me` — Get current user context
   - Document rate limiting on auth endpoints

2. **Resource Endpoints by Type**
   - For each major resource (User, Project, Ticket, etc.), document:
     - **GET** endpoints (list, with pagination; get single item)
     - **POST** endpoints (create new resource)
     - **PUT/PATCH** endpoints (update resource)
     - **DELETE** endpoints (soft delete or hard delete, with reasoning)
   - Example structure per resource:
     ```
     GET    /api/projects           (list all projects for auth user)
     POST   /api/projects           (create new project)
     GET    /api/projects/:id       (get project details)
     PUT    /api/projects/:id       (update project)
     DELETE /api/projects/:id       (delete project)
     ```

3. **Request/Response Shapes**
   - For each endpoint, document:
     - **Request body** (if POST/PUT): JSON schema with required/optional fields
     - **Response body** (success 200/201): Full resource representation
     - **Error responses** (400, 401, 403, 404, 500): Standard error object:
       ```json
       {
         "error": "string (machine-readable code)",
         "message": "string (human-readable)",
         "statusCode": "number"
       }
       ```
   - Use Zod schemas (packages/shared) as single source of truth for validation

4. **Data Isolation Rules**
   - For every endpoint that accesses user-scoped data:
     - Validate that `req.user.id` matches the resource owner or `req.user.role === 'admin'`
     - Do not return data from other users/clients
   - Document the principle: "All queries automatically scoped to authenticated user's context"
   - Example: `GET /api/projects` returns only projects where `project.clientId === req.user.id`

5. **Common Middleware Stack**
   - Document middleware applied to all/most routes:
     - Authentication check (verify JWT in httpOnly cookie)
     - Request validation (Zod schemas)
     - Error handling (catch exceptions, return standardized error object)
     - Logging (log requests/responses for debugging)
     - Rate limiting (prevent abuse)

6. **Special Endpoint Categories**

   **Public (no auth required):**
   - `GET /`  — Health check
   - `POST /api/enquiries` — Submit new enquiry (public intake form)
   - `GET /api/public/portfolio` — Public portfolio data

   **Admin-only:**
   - `GET /api/admin/users` — List all users
   - `GET /api/admin/enquiries` — Review enquiries
   - `PUT /api/admin/projects/:id/status` — Manage project status

   **Authenticated (client-scoped):**
   - `GET /api/projects` — My projects
   - `GET /api/projects/:id/tickets` — Project's tickets
   - All project/ticket operations

7. **Error Handling Strategy**
   - Document standard error codes and when they're returned:
     - **400 Bad Request** — Invalid input (validation failed)
     - **401 Unauthorized** — Missing/invalid auth token
     - **403 Forbidden** — User lacks permission (e.g., client accessing another client's project)
     - **404 Not Found** — Resource doesn't exist
     - **429 Too Many Requests** — Rate limit exceeded
     - **500 Internal Server Error** — Unexpected server error
   - Note: Never expose stack traces to clients; log internally for debugging

8. **Pagination & Filtering**
   - Document standard query parameters for list endpoints:
     - `?page=1&limit=20` — Pagination
     - `?status=active` — Filter by status
     - `?sort=-createdAt` — Sort by field
   - Document cursor-based pagination if applicable for large datasets

9. **File Upload Strategy**
   - If brief mentions file uploads:
     - Document multipart/form-data endpoint: `POST /api/files`
     - Integration with Cloudinary or S3 for storage
     - File validation (size, type, virus scan if applicable)
     - Return file URL/ID for references

10. **WebSocket/Real-time (if applicable)**
    - If real-time features mentioned (messaging, live updates):
      - Document Socket.io endpoints for events
      - Namespaces/rooms for data isolation
      - Event types (project-updated, ticket-created, etc.)

### Output Format

Markdown file: `04_API_SPEC.md`

Standard sections:
- **Authentication & Authorization** — JWT strategy, role-based access, auth endpoints
- **API Resource Endpoints** — Grouped by resource type (Projects, Tickets, Users, etc.)
  - For each: GET list, POST create, GET detail, PUT update, DELETE
  - Request/response shapes with JSON examples
- **Data Isolation & Scoping** — How user context is enforced
- **Middleware Stack** — Auth, validation, error handling, logging, rate limiting
- **Error Handling** — Standard error codes and response format
- **Pagination & Filtering** — Query parameters, examples
- **File Uploads** — If applicable
- **Real-time Events** — If applicable (Socket.io events)

### Validation

- ✓ Every resource model from 03 has CRUD endpoints
- ✓ All endpoints include auth requirements (public, authenticated, admin-only)
- ✓ Request/response shapes match Prisma schema
- ✓ Data isolation rules are enforced on all user-scoped endpoints
- ✓ Error codes are documented and consistent
- ✓ Pagination parameters are standard
- ✓ No hardcoded secrets or credentials in spec

### Safety

- **Critical:** Document data isolation. Every endpoint touching user data must filter by `req.user.id`
- Validate all input with Zod schemas before touching database
- Never return sensitive fields (password hashes, API keys, tokens) in responses
- Implement rate limiting on auth endpoints (login, register) to prevent brute force
- Use HTTPS only (enforced by deployment topology)
- Document CORS policy (if frontend is on different domain than API)
- Encrypt sensitive fields in transit (HTTPS) and at rest (DB encryption)

## Purpose

This specification is the **contract between frontend and backend** — developers build against this spec, and API responses must match. It prevents frontend/backend misalignment.

