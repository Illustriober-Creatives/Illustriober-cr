# PROJECT: Homepage Visual Redesign

**Studio:** Illustriober Creatives  
**Repo:** illustriober-cr  
**Started:** 2026-07-09  
**Goal:** Reduce homepage text density by ~70%, replace text blocks with product visualizations and interactive workflow diagrams. Align with premium studio benchmarks (mattmurphy.ai, bridgemind.ai).

---

## Problem Statement

The homepage has ~680 words across 9 sections. Premium tech studio benchmarks average 120–200 words — everything else is visual. The current page tells instead of shows. There are no product mockups, workflow diagrams, or simulated app interfaces. Every section uses the same text-heavy card grid pattern.

## Design Direction

**From:** Brochure-style — describe what we do in paragraphs  
**To:** Visual-first — show the product, the workflow, and the outcome

**References:**
- mattmurphy.ai — minimal copy, large product visual in hero, process flow as illustration
- bridgemind.ai — animated app mockup center-stage, copy in 6-8 word headlines only

**Design samples provided by client:**
- `02___Studio_Dark___engineerfirst__mono_accents.html` — Dark studio aesthetic, engineer-first, mono accents
- `03___Visualfirst_Gallery___themable_via_Tweaks.html` — Visual-first gallery layout, themable

## Key Decisions
- Existing design system (Tailwind, glass-card, font-display, accent) is KEPT — no brand change
- Remove redundant stat repetitions (stats appear 3× currently)  
- Hero gets a 2-column layout with an SVG dashboard mockup on the right
- AboutSnippet paragraphs replaced by a 5-step animated workflow component
- ServicesSection: icon + title only, description revealed on hover only
- WhyUsSection: replaced by a tabbed "How We Work" simulator
- StatsBar removed (redundant with hero stats)
- No new dependencies — pure Tailwind + SVG + CSS animations

## Success Criteria
- Total homepage word count: ≤ 200 words (down from ~680)
- Hero has a visible product/UI mockup
- A workflow visualization exists (≥ 3 steps shown)
- All 6 UI-REVIEW pillars score ≥ 3/4 post-implementation
