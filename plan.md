Read [](file:///Users/apple/Claude/Personal/illustriober-cr/ai-spec/07_IMPLEMENTATION_PLAN.md#1-1), lines 1 to 150

Read [](file:///Users/apple/Claude/Personal/illustriober-cr/ai-spec/04_API_SPEC.md#1-1), lines 1 to 100

Read [](file:///Users/apple/Claude/Personal/illustriober-cr/ai-spec/03_DATABASE_SCHEMA.md#1-1), lines 1 to 100

Read skill [vercel-deploy](file:///Users/apple/.claude/skills/vercel-deploy/SKILL.md?vscodeLinkType%3Dskill)

Read skill [figma](file:///Users/apple/.claude/skills/figma/SKILL.md?vscodeLinkType%3Dskill)

Read [](file:///Users/apple/Claude/Personal/illustriober-cr/ai-spec/05_PAGES_AND_COMPONENTS.md#1-1), lines 1 to 150

Read [](file:///Users/apple/Claude/Personal/illustriober-cr/ai-spec/06_FEATURES.md#1-1), lines 1 to 100

Now I'll create a comprehensive Phase 1 plan with all skill references incorporated: 

Created memory file [](file:///Users/apple/Library/Application%20Support/Code/User/workspaceStorage/2b5271177bdd0ab7415f35511e8e0511/GitHub.copilot-chat/memory-tool/memories/OWM1ZjQzNzMtNWZhYy00OWQxLWE0YTEtYmU2NzNkY2Y5Nzcw/phase1_plan.md)

## **Phase 1 Detailed Implementation Plan — Public Marketing Website**

I've created a comprehensive Phase 1 plan referencing all available skills. Here's the strategic overview:

---

### **📋 Skills Applied**

| Skill | Application | Trigger Point |
|-------|-------------|---------------|
| **vercel-deploy** | Final deployment to production (Day 9-10) | After all testing passes |
| **figma** | (Optional) If you have Figma designs for pages | Component implementation sprint |

---

### **🎯 Phase 1 Scope (10 Business Days)**

**Goal:** Live, publicly accessible marketing site (illustriober.com) with working enquiry form

**Deliverables:**
- ✅ All 6 public pages (Home, About, Services, Work, Tech Stack, Enquiry)
- ✅ 11+ reusable components with responsive design
- ✅ Working enquiry form → email confirmation → DB storage
- ✅ Auth foundation ready (login/logout/forgot-password)
- ✅ Deployed to Vercel with Lighthouse ≥ 90
- ✅ SEO-optimized (meta tags, sitemap, robots.txt)

---

### **📊 Three Parallel Tracks (Optimized for Team)**

#### **Track A: Frontend Pages & Components** (Days 1–6)
4 sprints focusing on UI/UX:
- **Sprint A1:** Core components (Navbar, Footer, Cards, Button) — 2 days
- **Sprint A2:** Home page sections (Hero, Services, Testimonials, etc.) — 2 days
- **Sprint A3:** Additional pages (About, Services, Work, Tech Stack, Enquiry) — 2 days
- **Sprint A4:** Navigation integration & mobile polish — 1 day

#### **Track B: API & Backend** (Days 2–5)
Backend for enquiry form and auth:
- **Sprint B1:** Enquiry endpoints + rate limiting + email service (Resend) — 2 days
- **Sprint B2:** JWT token service + password hashing — 1 day
- **Sprint B3:** Full auth implementation (login/logout/forgot-password/invite) — 1 day
- **Sprint B4:** Auth middleware (authenticate, authorize) — 1 day

#### **Track C: Deployment & Optimization** (Days 6–10)
Final polish before launch:
- **Sprint C1:** SEO (meta tags, sitemap, structured data) — 1 day
- **Sprint C2:** Performance optimization (images, code splitting, caching) — 2 days
- **Sprint C3:** Analytics setup (Plausible/GA) — 1 day
- **Sprint C4:** Testing, final review, and **Vercel deployment** — 2 days

**Critical Path:** A1 → (A2 + B1) → A3 → A4 → C1 → C2 → C4 ≈ 10 days

---

### **🏗️ Component Building Roadmap**

**Track A1 Core Components (Day 1–2):**
```
✓ Button             (already built in Phase 0)
+ Navbar             (responsive, mobile hamburger)
+ Footer             (links, social, copyright)
+ ServiceCard        (icon, title, description)
+ ValueCard          (for "Why Us" section)
+ PortfolioCard      (image, title, tags)
+ TechStackCard      (logo, name, proficiency)
+ Section Wrapper    (consistent spacing, typography)
```

**Track A2 Home Page Sections (Day 2–3):**
```
✓ HeroSection        (already built)
+ ClientLogosBar     (scrolling logos)
+ AboutSnippet       (company statement + stats)
+ ServicesSection    (tabbed service details)
+ WhyUsSection       (4-6 value prop cards)
+ TestimonialsSection (carousel with quotes)
+ PortfolioTeaser    (3 featured projects)
+ CTASection         (full-width banner)
+ StatsBar           (animated counters on scroll)
```

**Track A3 Pages (Day 4–5):**
```
/about               (Hero, Story, Values, Team, CTA)
/services            (Hero, Cards, Process, FAQ, CTA)
/work                (Portfolio grid with filters)
/work/[slug]         (Project details with gallery)
/tech-stack          (Tech categories with logos)
/enquiry             (Form with validation)
```

---

### **🔌 API Endpoints (Track B)**

**Enquiry System (B1):**
```
POST /api/enquiries          (public, rate-limited)
  → Validate (Zod)
  → Store in DB
  → Send confirmation email (Resend)
  → Send admin notification
```

**Authentication (B2-B3):**
```
POST   /api/auth/login              (email + password)
POST   /api/auth/logout             (revoke token)
POST   /api/auth/refresh            (new access token)
POST   /api/auth/forgot-password    (reset email)
POST   /api/auth/reset-password     (validate token + new password)
POST   /api/auth/accept-invite      (client activation)
GET    /api/auth/me                 (current user, needs auth)
```

**Middleware:**
```
authenticate()         (extract token, verify, attach userId)
authorize(role)        (role check: ADMIN vs CLIENT)
rateLimit()           (3 enquiries/IP/hour)
errorHandler()        (centralized error responses)
```

---

### **📦 Database Schema (Already Ready)**

The Prisma schema from Phase 0 already includes:
- ✅ `User` model (email, passwordHash, role, tokens)
- ✅ `Enquiry` model (client info, project details, status)
- ✅ `Project`, `Milestone`, `Ticket`, `File` models
- ✅ Enums: Role, EnquiryStatus, ProjectStatus, etc.

**Phase 1 Tasks:**
1. Run Prisma migration for initial setup
2. Add `resetToken`, `resetTokenExpiresAt` if needed
3. Add `inviteToken`, `inviteTokenExpiresAt` if needed

---

### **✅ Performance & SEO (Track C)**

**Sprint C1 (SEO):**
- Meta tags (title, description, OG tags) on all pages
- JSON-LD schema (Organization, Services)
- `robots.txt` and `sitemap.xml`
- Canonical URLs

**Sprint C2 (Performance):**
- Images with `next/image` (lazy load, WebP, blur placeholder)
- Code splitting (dynamic imports for heavy components)
- Font optimization (preload Google Fonts)
- Caching headers on Vercel
- **Target:** Lighthouse Score ≥ 90 all categories

**Sprint C3 (Analytics):**
- Plausible or Google Analytics
- Track page views, CTA clicks, form submissions
- Custom events (enquiry submitted, newsletter signup)

---

### **🚀 Deployment (Using vercel-deploy Skill)**

**Sprint C4 (Days 9–10):**

1. **Pre-deployment Checks:**
   - `npm run build` passes ✅
   - `npm run lint` passes ✅
   - All env vars configured
   - No secrets in code

2. **Deploy to Vercel:**
   ```bash
   vercel deploy                    # Preview
   # Test preview for 10+ minutes
   vercel deploy --prod             # Production
   ```

3. **Post-deployment:**
   - Visit illustriober.com
   - Test all forms and links
   - Run Lighthouse from live site
   - Monitor error tracking

---

### **📅 Daily Schedule Example**

```
Day 1 (Mon)     → A1: Core components, B1 start
Day 2 (Tue)     → A2: Home sections, B1 complete
Day 3 (Wed)     → A3: Pages start, B2-B3 auth
Day 4 (Thu)     → A3: Pages complete, B3-B4 middleware
Day 5 (Fri)     → A4: Integration & polish, B4 complete
Day 6 (Mon)     → C1: SEO setup
Day 7 (Tue)     → C2: Performance optimization
Day 8 (Wed)     → C3: Analytics, final testing
Day 9 (Thu)     → C4: Deploy to preview, test
Day 10 (Fri)    → C4: Deploy to production, smoke tests
```

---

### **🔑 Key Architecture Decisions**

1. **Static Data First** — Portfolio, clients, testimonials hardcoded (JSON or constants). CMS in Phase 3.
2. **Form Validation** — Zod on both client (React) and server (Express).
3. **Email Service** — Resend for enquiry confirmations + password reset emails.
4. **Rate Limiting** — Simple in-memory for MVP (3/IP/hour).
5. **Auth Strategy** — JWT in httpOnly cookies, 15-min access token, 30-day refresh token.
6. **Component Library** — Reusable components with consistent design system (orange #f97316).
7. **No PageBuilder** — Hardcoded pages for speed & consistency.
8. **No Real-time Features** — WebSockets in Phase 2+ (tickets, messages).

---

### **📋 Phase 1 Success Criteria**

- [ ] All pages live and accessible from illustriober.com
- [ ] Enquiry form submits successfully, emails sent
- [ ] Lighthouse score ≥ 90 (Performance, SEO, Accessibility, Best Practices)
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] No console errors or broken links
- [ ] SEO audit passes (meta tags, sitemap, structured data)
- [ ] Auth skeleton ready for Phase 2 full implementation
- [ ] Documentation updated for team
- [ ] GitHub repo with clean commit history

---

**Ready to start building? I can break this down further into individual sprints or start with Sprint A1 (Core Components) first!** 🚀