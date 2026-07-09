# ROADMAP: Homepage Visual Redesign

## Phase 1 — Remove & Tighten Copy  ✅ PLANNED
Remove redundant sections and cut all paragraph/description text.

**Deliverables:**
- Remove `StatsBar` from `page.tsx`
- Remove hero stats row + paragraph from `HeroSection`
- Gut `AboutSnippet` to a single bold statement (≤12 words)
- Remove description text from all 8 `ServicesSection` cards
- Remove description text from all 6 `WhyUsSection` cards
- Remove `CTASection` body paragraph

**Files:** HeroSection.tsx, AboutSnippet.tsx, ServicesSection.tsx, WhyUsSection.tsx, CTASection.tsx, page.tsx

---

## Phase 2 — Hero 2-Column + Dashboard Mockup  ✅ PLANNED
Restructure hero as left-copy / right-visual. Build SVG dashboard mockup.

**Deliverables:**
- New `DashboardMockup` component (SVG of client portal — project card, ticket status, milestone tracker)
- Restructure `HeroSection` to 2-column layout (left: headline+CTA, right: mockup)
- Mockup uses existing accent colors, glass-card aesthetic

**Files:** HeroSection.tsx, new `DashboardMockup.tsx`

---

## Phase 3 — Workflow Visualization  ✅ PLANNED
Replace `AboutSnippet` + `StatsBar` with an animated 5-step process flow.

**Deliverables:**
- New `WorkflowVisual` component: Discovery → Spec → Design → Build → Ship
- Each step: large numeral + icon + 3-word label + connector line
- Animated: steps illuminate sequentially on scroll-into-view
- Replaces `AboutSnippet` in page order

**Files:** new `WorkflowVisual.tsx`, page.tsx (replace AboutSnippet + StatsBar)

---

## Phase 4 — Services Visual Refresh  ✅ PLANNED
Services grid becomes icon-first, description hidden by default (hover reveal).

**Deliverables:**
- `ServicesSection` refactored: full-card hover reveals detail text (CSS only)
- Default state: large icon + service title + number only
- Optional: add a `ServicesMockup` showing a simulated project interface panel

**Files:** ServicesSection.tsx

---

## Phase 5 — How We Work Simulator  ✅ PLANNED
Replace `WhyUsSection` with a tabbed process simulator.

**Deliverables:**
- New `ProcessSimulator` component: 4 tabs (Brief → Plan → Execute → Ship)
- Each tab shows a mock interface panel relevant to that stage
- Replaces WhyUsSection entirely

**Files:** new `ProcessSimulator.tsx`, WhyUsSection.tsx (gutted or replaced), page.tsx

---

## Phase 6 — Commit, Push, PR
All changes committed and pushed to `claude/homepage-visual-redesign` branch, PR opened.
