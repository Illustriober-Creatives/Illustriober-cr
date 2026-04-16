---
name: gen-08-third-party-env
description: Generate complete third-party service integrations and environment variable configuration
risk: low
source: custom
date_added: 2026-04-12
---

# Third-Party & Environment Generator (08)

You are an **integration specialist** responsible for documenting all external service dependencies, API keys, configuration, and environment variable setup for development, staging, and production.

## Use this skill when

- The orchestrator invokes you with brief + 01_TECH_STACK.md
- All external services (payment, email, storage, etc.) must be listed and configured
- Environment variable strategy and secrets management must be documented
- This is **step 9** in the specification pipeline (can be parallel with Phase 4 features)

## Do not use this skill when

- Tech stack is undefined (depends on 01_TECH_STACK.md)

## Instructions

### Input

- Client brief documents
- 01_TECH_STACK.md (third-party services already listed here)

### Generation Steps

1. **Extract Third-Party Services from Tech Stack**
   - Review 01_TECH_STACK.md and pull all mentioned services
   - Common services: Cloudinary (files), Resend (email), Stripe (payments), Socket.io (real-time), etc.
   - For each service, document:
     - **Service Name** — Official name
     - **Purpose** — What it does (e.g., "Image storage and optimization")
     - **Free/Paid Tiers** — Cost implications
     - **Why This Service** — Why chosen over alternatives
     - **Setup Steps** — Do we need to create an account, add credentials, etc.

2. **Services Typically Needed**

   **File Storage:**
   - **Cloudinary** (default for Illustriober)
     - Purpose: Image/file uploads, optimization, CDN delivery
     - Setup: Create Cloudinary account, get API key and secret
     - Env vars: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

   **Email Service:**
   - **Resend** (default for Illustriober) or SendGrid
     - Purpose: Transactional emails (enquiry notifications, password resets, etc.)
     - Setup: Create Resend account, generate API key
     - Env vars: RESEND_API_KEY

   **Real-Time (if applicable):**
   - **Socket.io** (built into Express)
     - Purpose: Real-time updates on project/ticket changes
     - Setup: Already in tech stack (Express + Socket.io)
     - Env vars: SOCKET_IO_ORIGIN (frontend URL)

   **Payments (if applicable):**
   - **Stripe**
     - Purpose: Payment processing for invoices or premium features
     - Setup: Create Stripe account, get public/secret keys
     - Env vars: NEXT_PUBLIC_STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

   **Hosting & Deployment:**
   - **Vercel** (frontend)
     - Setup: Connect GitHub repo, deploy on push
     - Env vars: (managed by Vercel dashboard)
   - **VPS** (backend) + **GitHub Actions** (CI/CD)
     - Setup: Provision server, configure GitHub Actions workflow

   **Analytics (optional):**
   - **Google Analytics** or similar
     - Purpose: Track user behavior, page views
     - Env vars: NEXT_PUBLIC_GA_ID

3. **Environment Variable Strategy**

   **Categories:**
   - **Public (client-accessible):** NEXT_PUBLIC_* prefix
     - Example: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   - **Secret (server-only):** No prefix, accessed only in Node.js code
     - Example: CLOUDINARY_API_SECRET, RESEND_API_KEY, DATABASE_URL
   - **Sensitive (never logged):** Passwords, tokens, keys — handle with care

   **Per Environment:**
   - **Development (.env.local):** Use local/fake credentials or development accounts
   - **Staging (.env.staging):** Real services but staging/test accounts
   - **Production (.env.production):** Real services with real production accounts

4. **Database Configuration**
   - **Connection String:** DATABASE_URL (PostgreSQL)
   - Format: postgresql://user:password@host:5432/dbname
   - Separate strings for dev, staging, production
   - Document SSL/TLS requirement (enforced in production)

5. **Security Best Practices**
   - Never commit .env files to git (use .env.example with placeholder values)
   - Rotate secrets regularly
   - Use service-specific API keys (not master credentials)
   - Document where secrets are stored (GitHub Secrets for CI/CD, env vars in VPS)
   - Log access to secrets but never log values

6. **Integration Points**
   - For each service, document where it's integrated:
     - Cloudinary: `libs/cloudinary.ts` in backend
     - Resend: `libs/email.ts` in backend
     - Stripe: `routes/payments.ts` in API, payment components in frontend
     - Socket.io: `server.ts` in API, hooks in frontend

7. **Setup Checklist**
   - Create checklist for developer to follow when setting up project locally
   - Example:
     ```
     [ ] Clone repo
     [ ] npm install
     [ ] Create .env.local with placeholders
     [ ] Sign up for Cloudinary, generate keys
     [ ] Sign up for Resend, generate key
     [ ] Set DATABASE_URL to local PostgreSQL
     [ ] Run `npm run dev`
     ```

### Output Format

Markdown file: `08_THIRD_PARTY_AND_ENV.md`

Standard sections:
- **Third-Party Services** — Table: Service | Purpose | Cost | Setup Complexity
- **Environment Variables** — Table: Var Name | Type | Purpose | Environment(s)
- **Service Integration Points** — For each service: where it's used in code
- **Configuration by Environment** — Dev, staging, production differences
- **Security & Secrets Management** — How to handle sensitive values
- **Setup Checklist** — Step-by-step for developer onboarding
- **.env.example Template** — Sample file with placeholder values

### Example Services Section

```markdown
## Third-Party Services

| Service | Purpose | Free Tier | Cost/mo (Paid) | Setup |
|---------|---------|-----------|---|---|
| Cloudinary | Image storage & CDN | Yes (80MB) | $10–200+ | Create account, grab keys |
| Resend | Transactional email | Yes (100/day) | $20+ | Create account, generate API key |
| Stripe | Payment processing | No (test mode) | 2.9% + $0.30 | Create account, get keys |
| Socket.io | Real-time updates | Built-in | Included | Already in Express |
| Vercel | Frontend hosting | Yes | $20+ | Connect GitHub, auto-deploy |

## Environment Variables

| Variable | Type | Purpose | Dev | Staging | Prod |
|----------|------|---------|-----|---------|------|
| DATABASE_URL | Secret | PostgreSQL connection | local | staging DB | prod DB |
| NEXT_PUBLIC_API_BASE_URL | Public | API endpoint URL | http://localhost:3001 | https://api.staging.com | https://api.domain.com |
| CLOUDINARY_CLOUD_NAME | Public | Cloudinary account | test_account | prod_account | prod_account |
| CLOUDINARY_API_KEY | Secret | Cloudinary API key | test_key | prod_key | prod_key |
| CLOUDINARY_API_SECRET | Secret | Cloudinary API secret | test_secret | prod_secret | prod_secret |
| RESEND_API_KEY | Secret | Resend email API | test_key | prod_key | prod_key |
```

### Validation

- ✓ All services mentioned in 01_TECH_STACK.md are documented
- ✓ All API keys/secrets have corresponding env vars
- ✓ Env var names follow convention (NEXT_PUBLIC_* for public)
- ✓ Setup steps are clear and actionable
- ✓ Security practices are documented
- ✓ .env.example is complete and safe to commit

### Safety

- **Critical:** Never log or expose secret env vars
- Use service-specific API keys (not master credentials)
- Rotate secrets quarterly or on team membership changes
- Document who has access to production secrets (usually team lead only)
- Each developer gets their own dev/staging accounts (not shared)
- Production secrets stored in GitHub Secrets or VPS env files (encrypted)

## Purpose

This document is the **configuration blueprint** — developers reference it during setup and deployment to ensure all external services are properly integrated.

