# Illustriober Creatives — Master Roadmap

This plan focuses on scaling the Illustriober Creatives platform from a marketing site into a full-featured client portal.

## 📍 Project State (April 2026)

| Milestone | Status | Details |
| :--- | :--- | :--- |
| **0: Foundation** | ✅ Done | Monorepo set up, Next.js, Express, Prisma. |
| **1: Public Site** | ✅ Done | Portfolio, services, enquiry form (Resend integration). |
| **2: Authentication** | 🚧 In Progress | JWT access/refresh, `/login`, `/register`, Auth context. |
| **3: Client Portal** | 📅 Next | Dashboard, projects, milestones, ticket management. |
| **4: Real-time** | 📅 Backlog | Live comments, notifications via Socket.io. |
| **5: Files & Polish** | 📅 Backlog | Cloudinary uploads, SEO fine-tuning, PWA. |

---

## 🚀 Active Phase: Auth & Portal Shell

**Goal:** Secure the platform and provide a foundation for client-specific data.

- [x] Implement JWT access + refresh token strategy.
- [x] Configure httpOnly cookies for secure session management.
- [x] Build `AuthContext` and protect routes using Next.js Middleware.
- [ ] **Verify Production Secrets:** Ensure `JWT_SECRET` and `CORS_ORIGIN` are active on VPS.
- [ ] **Registration Policy:** Implement role-based access for `ADMIN` vs `CLIENT`.

## ⏭️ Upcoming: Full Client Portal (The Core)

**Goal:** Allow Harmon to manage clients and projects directly from the platform.

1. **Client Management:** Admin panel to list/create/edit clients and project assignments.
2. **Project Milestones:** Visual progress tracker for active client projects.
3. **Ticket System:** Submission and tracking of bugs and feature requests.
4. **Collaboration:** Comment threads on projects and tickets.

---

## 🛠 Tech Stack Recap

- **Apps:** Next.js 15 (Web) & Express (API)
- **Database:** PostgreSQL via Prisma ORM
- **Infrastructure:** Vercel (Frontend) & VPS (Backend/DB)
- **Deployment:** GitHub Actions + PM2

> [!TIP]
> Refer to `ai-spec/` for detailed architectural and design specifications.
