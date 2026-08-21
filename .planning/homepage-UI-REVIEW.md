# Homepage UI Review — 6-Pillar Audit

**Target:** `apps/web/src/app/page.tsx` + all homepage components  
**Focus:** Text density · Visual hierarchy · Missing product visualizations  
**Date:** 2026-07-09  
**Reviewer:** GSD UI Review (executed manually — gsd-core workflow ref not resolved)

---

## Grading Scale
| Score | Meaning |
|-------|---------|
| 4 | Excellent — no action needed |
| 3 | Good — minor improvements |
| 2 | Needs work — significant gaps |
| 1 | Critical — blocking visual credibility |

---

## Pillar 1 — Visual Hierarchy  **Score: 2/4**

### Findings
- **Flat section weighting**: Every section (AboutSnippet, StatsBar, ServicesSection, WhyUsSection) has identical visual weight — same padding, same glass-card treatment, same font scale. Nothing reads as primary.
- **Stats appear three times**: `HeroSection` has 3 stats inline → `StatsBar` has 4 animated stats → `AboutSnippet` has another 3 stats grid. This devalues all of them and confuses what the page is actually saying.
- **No visual anchor in the hero**: The hero is purely typographic (headline + paragraph + CTAs + inline stats). There is no image, mockup, or visual artifact to anchor the eye below the fold. Sites like mattmurphy.ai and bridgemind.ai use a large product/system visual here.
- **ServicesSection** leads with a 3-line description paragraph before the service grid — buries the scannable grid below a text block.

### Fixes
- Remove `StatsBar` entirely (stats are already in Hero)
- Remove duplicate stats from `AboutSnippet`
- Add a large product visualization (app mockup / workflow diagram) as the hero's right/bottom visual anchor
- Give `HeroSection` a 2-column layout: left = copy, right = product visual

---

## Pillar 2 — Typography  **Score: 3/4**

### Findings
- Font system is solid: `font-display` (Fraunces) for headings, regular for body. Tracking-tighter on large heads is correct.
- **Inconsistent scale**: Hero h1 is `9xl` → ServicesSection h2 is `7xl` → WhyUsSection uses `SectionHeader` at an unknown scale. The step-down is inconsistent — some sections feel equally loud as the hero.
- **Paragraph text overuse**: `AboutSnippet` has 2 paragraphs of 30+ words each. `WhyUsSection` has 6 cards each with a 20-word description. `ServicesSection` has 8 cards each with a description + details. Total word count on the page is ~800 words — far too high for a premium studio homepage (benchmark: 150–250 words).
- `text-[10px]` uppercase tracking labels are well-executed and should be kept as the primary micro-copy system.

### Fixes
- Cut body text by ~70% — use 10px uppercase labels + large visual elements instead of paragraphs
- Standardize section headline scale: Hero `9xl` → Section `5xl` → Sub-section `2xl`
- Remove or condense `AboutSnippet` paragraphs to a single 12-word statement

---

## Pillar 3 — Color & Contrast  **Score: 3/4**

### Findings
- Accent/foreground/background system is consistent and well-defined
- `text-foreground/40` and `/50` on body copy may be too light in light mode (accessibility concern — check 4.5:1 WCAG AA)
- `bg-accent/5` background blobs are elegant and not overused
- `glass-card` treatment is applied identically across all sections — loses differentiation between primary and secondary content

### Fixes
- Audit contrast ratios on `/40` and `/50` foreground text
- Vary glass-card treatment: some sections should be solid (no glass) to create visual breathing room

---

## Pillar 4 — Spacing & Layout  **Score: 2/4**

### Findings
- **9 sections, 0 visual breaks**: Every section uses the same `section-padding` class. The page feels like one continuous uniform scroll with no pacing variation.
- **No asymmetric layouts**: Everything is centered or symmetric grid. Premium studios (Framer, Linear, Vercel marketing) use alternating left/right layouts, large-offset grids, and pinned elements to create visual interest.
- **ServicesSection** 4-column grid at `lg` breakpoint creates very narrow cards with too much text per card at that density.
- Hero stats row at `mt-32` creates unnecessary push — the stats aren't earning that space since they're repeated below.

### Fixes
- Introduce layout variation: Hero (full-bleed), then alternating (left-heavy / right-heavy), then full-bleed CTA
- ServicesSection: switch to horizontal scrolling tabs or 3-column grid with icons only (no text)
- Remove hero stats row (deduplication)

---

## Pillar 5 — Component Consistency  **Score: 3/4**

### Findings
- `SectionWrapper`, `Container`, `SectionHeader` are well-abstracted and used consistently
- `glass-card` is the universal card — good, but means cards in portfolio, services, and why-us all look identical
- `Button` component variants (`primary`, `secondary`) are used consistently
- `ClientLogosBar` uses text names instead of actual SVG logos — currently renders as text which is unconvincing as a social proof element

### Fixes
- Add a `feature-card` variant to differentiate workflow/visual cards from service cards
- `ClientLogosBar` should show actual logo SVGs or use placeholder shapes, not company names as text

---

## Pillar 6 — Content Density  **Score: 1/4** ⚠️ CRITICAL

### Findings
This is the primary problem area. The homepage reads like a brochure, not a premium studio landing page.

**Word count audit (approximate):**
- HeroSection: ~35 words body copy
- AboutSnippet: ~80 words (2 full paragraphs)  
- StatsBar: labels only — fine
- ServicesSection: ~240 words (8 × 30-word descriptions)
- WhyUsSection: ~180 words (6 × 30-word descriptions)
- PortfolioTeaser: ~15 words
- TestimonialsSection: ~90 words (3 testimonials)
- CTASection: ~40 words
- **Total: ~680 words**

**Benchmark:** Premium tech studio homepages (Linear, Vercel, Framer) average 120–200 words. Everything else is visual.

**Missing visuals that should replace text:**
1. **Product mockup in hero** — shows the client portal / dashboard instead of describing it
2. **Process flow diagram** — shows Discovery → Design → Build → Deploy visually instead of the AboutSnippet paragraphs  
3. **Service glyphs** — large icon + title only for services, no description text
4. **Workflow simulator** in the "Why Us" section — an interactive or animated card showing how work happens
5. **Real portfolio screenshots** — project cards should be image-first, not text-first

### Fixes (priority order)
1. Remove `AboutSnippet` paragraphs → replace with a 5-step visual workflow
2. Remove service descriptions (8 × ~30 words = 240 words) → icon + title + hover state only
3. Remove `WhyUsSection` description text → replace with a visual comparison or workflow mockup
4. Remove `StatsBar` (redundant) and hero stats row → consolidate to one location
5. Add hero product mockup (SVG or animated component showing project dashboard)

---

## Summary Scorecard

| Pillar | Score | Status |
|--------|-------|--------|
| Visual Hierarchy | 2/4 | Needs work |
| Typography | 3/4 | Good |
| Color & Contrast | 3/4 | Good |
| Spacing & Layout | 2/4 | Needs work |
| Component Consistency | 3/4 | Good |
| Content Density | 1/4 | **CRITICAL** |
| **Overall** | **14/24** | **2.3 / 4.0** |

---

## Remediation Plan

### Phase A — Remove (no new code needed)
- [ ] Delete `StatsBar` from `page.tsx`
- [ ] Remove hero stats row from `HeroSection`
- [ ] Remove 2 paragraphs from `AboutSnippet` → single 12-word bold statement
- [ ] Remove service card description/details text from `ServicesSection`
- [ ] Remove value prop description text from `WhyUsSection`

### Phase B — Replace with visuals
- [ ] Add `WorkflowVisual` component (5-step animated flow: Idea → Spec → Build → Ship → Support)
- [ ] Add `DashboardMockup` SVG component for hero right-column  
- [ ] Restyle `ServicesSection` as icon+title grid with hover reveal (no description by default)
- [ ] Replace `WhyUsSection` text cards with `ProcessSimulator` (animated tab showing work stages)

### Phase C — Layout restructure
- [ ] Hero → 2-column: left copy / right mockup
- [ ] Introduce layout rhythm: full-bleed → left-heavy → right-heavy → full-bleed CTA
- [ ] `ClientLogosBar` → use SVG placeholder logos

---

*Review complete. Proceed with Phase A (removals) first — highest impact, zero risk.*
