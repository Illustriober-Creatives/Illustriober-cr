<div align="center">

# 🎨 Illustriober Creatives Platform

### Full-Stack Development & Graphic Design Studio Platform

<p>
  <img src="https://img.shields.io/badge/Visibility-Private-red" alt="Private repository" />
  <img src="https://img.shields.io/badge/Monorepo-NPM%20Workspaces-blue" alt="NPM workspaces" />
  <img src="https://img.shields.io/badge/Web-Next.js%2016-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/API-Express%20%2B%20Prisma-2f855a" alt="Express + Prisma" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/DB-PostgreSQL-336791" alt="PostgreSQL" />
</p>

</div>

> [!IMPORTANT]
> This repository is **private and proprietary**. It is for internal studio/client operations only and is not open-source.

## ✨ About Us
**Illustriober Creatives** is a Nairobi-based studio focused on:
- 💻 Full-stack web and mobile application development
- 🎯 UI/UX design
- 🎨 Graphic design (logos, posters, banners, brand identity)
- ☁️ Cloud deployment and DevOps

This platform is the operational foundation for scaling the studio from freelance operations into a structured product and delivery system.

## 🚀 What This Platform Is
This project combines two core systems:
- **Public marketing website**: showcase services, portfolio, tech stack, and capture enquiries
- **Client operations portal (planned/in progress)**: project tracking, communication, tickets, and deliverables

## 🧭 Current Status (April 2026)
- ✅ Public website pages are available: `/`, `/about`, `/services`, `/work`, `/tech-stack`, `/enquiry`
- ✅ Enquiry flow is connected (`apps/web` form → `apps/api` `/api/enquiries`)
- ✅ API health and root docs endpoints are live
- 🟡 Auth routes exist but return `501 Not Implemented` (`/api/auth/register|login|logout`)
- 🟡 Client dashboard/admin modules are defined in specs and Prisma schema, with phased implementation pending

## 🧱 Monorepo Structure
```text
illustriober-cr/
├── apps/
│   ├── web/                 # Next.js (App Router) frontend
│   └── api/                 # Express + Prisma backend
├── packages/
│   └── shared/              # Shared schemas/types (WIP integration)
├── ai-spec/                 # Product, architecture, and roadmap specs
├── DEV_COMMANDS.md          # Local development command cheat sheet
└── package.json             # Root workspace scripts
```

## 🛠 Tech Stack
| Layer | Stack |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide |
| Backend | Express, TypeScript, Prisma, Zod |
| Database | PostgreSQL |
| Monorepo | npm workspaces |
| Shared Package | `@illustriober/shared` |

## ✅ Prerequisites
- Node.js `20+`
- npm `10+`
- PostgreSQL `15+`

## ⚙️ Environment Setup
Create `apps/api/.env`:

```bash
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/illustriober?schema=public
# Optional fallback if using Prisma proxy URL in DATABASE_URL
# DIRECT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/illustriober?schema=public
```

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
# Optional
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## ▶️ Local Development
Install all dependencies:

```bash
npm install
```

Run everything (web + api):

```bash
npm run dev
```

Run only web:

```bash
npm run dev --workspace apps/web
```

Run only api:

```bash
npm run dev --workspace apps/api
```

Build all workspaces:

```bash
npm run build
```

Lint all workspaces:

```bash
npm run lint
```

## 🧪 Useful Commands (Next.js + npm + ports)
Check active dev ports:

```bash
lsof -nP -iTCP -sTCP:LISTEN | rg '3000|4000'
```

Check one specific port:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

Stop a process by PID:

```bash
kill -15 <PID>
# Force stop (only if needed)
kill -9 <PID>
```

Close a port directly:

```bash
kill -15 $(lsof -ti :3000)
kill -15 $(lsof -ti :4000)
```

Prisma commands (API workspace):

```bash
npm run prisma:validate --workspace apps/api
npm run prisma:generate --workspace apps/api
npm run prisma:migrate --workspace apps/api
```

Quick health checks:

```bash
curl -i http://localhost:4000/
curl -i http://localhost:4000/health
curl -I http://localhost:3000/
```

## 🌐 Routes Overview
### Web (public)
- `/`
- `/about`
- `/services`
- `/work`
- `/tech-stack`
- `/enquiry`

### API
- `GET /`
- `GET /health`
- `POST /api/enquiries`
- `POST /api/auth/register` (not implemented)
- `POST /api/auth/login` (not implemented)
- `POST /api/auth/logout` (not implemented)

## 📚 Internal Documentation
- Product overview: [`ai-spec/00_PROJECT_OVERVIEW.md`](./ai-spec/00_PROJECT_OVERVIEW.md)
- Tech stack: [`ai-spec/01_TECH_STACK.md`](./ai-spec/01_TECH_STACK.md)
- Architecture: [`ai-spec/02_ARCHITECTURE.md`](./ai-spec/02_ARCHITECTURE.md)
- Pages/components: [`ai-spec/05_PAGES_AND_COMPONENTS.md`](./ai-spec/05_PAGES_AND_COMPONENTS.md)
- Commands cheat sheet: [`DEV_COMMANDS.md`](./DEV_COMMANDS.md)

## 🔒 License / Usage
All rights reserved. This codebase, design assets, and documentation are proprietary to Illustriober Creatives.
