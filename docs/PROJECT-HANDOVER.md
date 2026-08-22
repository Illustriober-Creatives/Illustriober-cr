# Illustriober Creatives — Project Handover

## Project snapshot

Illustriober Creatives is a Nairobi-based digital product studio. The public site should make the studio feel considered, capable, and easy to start a conversation with—even while the portfolio is still growing.

The product is a Next.js web app in `apps/web`, with a separate API workspace. The current visual language is warm editorial minimalism: a soft cream canvas, near-black type, deep green surfaces, and a bright orange accent. The site uses a display serif for large statements, a clean sans serif for interface copy, generous whitespace, rounded cards, and restrained motion.

## What the site is trying to communicate

- We design and build useful software, not just attractive screens.
- We can own the whole product or join at the layer where help is needed: product direction, design, frontend, backend, mobile, automation, or custom technical setups.
- We work transparently, explain decisions, and leave clients with a product their team can own.
- The tone should feel direct, calm, warm, and quietly confident—not loud, generic, or over-engineered.
- Until a larger public portfolio exists, concept studies, the build log, process, capabilities, and public GitHub activity should provide credible evidence of how we work.

## Design preferences

### Layout

- Use a consistent content rail. Hero and section text should align with the navbar’s inner content edges.
- Keep text inside the rail even when decorative images or shadows intentionally bleed beyond it.
- Use safe gutters on every viewport. Never allow horizontal scrolling or clipped text.
- Prefer a clear editorial hierarchy: short eyebrow, one strong statement, a concise supporting paragraph, then one primary CTA and one quieter secondary action.
- Keep cards and enquiry panels contained, centered, and responsive with visible space above and below.
- Desktop compositions may be asymmetric, but the reading order must remain obvious on tablet and mobile.

### Type and copy

- Large headlines should be confident and readable, with intentional line breaks and no accidental orphan words.
- Rotating hero words must share the same baseline, have room for descenders, and never be clipped by a fixed-height wrapper.
- Keep rotating phrases short enough to scan quickly. Remove phrases that feel awkward, negative, or too long for the composition.
- Body copy should explain the value plainly in one or two lines where possible. Avoid agency filler and unexplained jargon.
- Use sentence case for most copy. Use uppercase tracking only for small labels and eyebrows.
- Keep copy honest: do not imply shipped client work, scale, or outcomes that have not been verified.

### Colour and surfaces

- Cream: `#F4EFE5` for the page canvas.
- Near black: `#171717` for primary type and buttons.
- Deep green: `#1F4D3D` for trust-building feature sections.
- Orange: `#F39314` / `#F7AD45` for accents, active details, and calls to action.
- Off-white: `#FFFDF8` for cards and the navbar.
- Maintain strong text contrast. Colour should support hierarchy, not carry meaning alone.

### Motion

- Motion should explain a change or add a sense of craft, not compete with the message.
- Use transform and opacity for transitions; avoid layout-shifting animations.
- Rotating headline phrases may loop, but must remain readable, interruptible where practical, and disabled or simplified for `prefers-reduced-motion`.
- Keep hover states subtle and useful. Never make essential content visible only on hover.
- Respect users who reduce motion and avoid autoplay patterns that make content impossible to read.

## Preferred implementation instructions for future agents

1. Inspect the existing page, related components, and repository instructions before editing.
2. Use GitNexus impact analysis before changing a function, component, class, or shared symbol. Report the blast radius and warn if risk is HIGH or CRITICAL.
3. Reuse existing components, tokens, assets, and patterns before introducing new dependencies or parallel systems.
4. Make the smallest focused change that solves the visual or product problem. Do not rewrite unrelated pages.
5. Design mobile-first and verify at a narrow mobile width, a tablet width, and a wide desktop width.
6. Preserve user-owned work in the working tree. Never reset, discard, or overwrite unrelated edits.
7. Keep accessibility in the implementation: semantic headings, useful image alt text, keyboard-visible focus, touch-sized controls, and reduced-motion handling.
8. Run the relevant tests and the web build/typecheck after implementation.
9. Run GitNexus change detection before committing and review the affected symbols and flows.
10. Inspect the final diff and status, then commit only intended files with a conventional commit message. Push only when explicitly requested.

## Expected output from an agent

Every implementation handoff should include:

- What changed and why it solves the requested problem.
- Exact files changed, with links where possible.
- The branch name and commit hash/message.
- Validation commands and whether tests/build passed.
- Any warnings, assumptions, or remaining limitations.
- Whether the branch was pushed or intentionally left local.
- A concise visual QA note covering mobile, tablet, and desktop behavior.

For design work, include the copy or interaction decision behind the change—not just a list of CSS edits. If a requested idea would create privacy, accessibility, performance, or credibility risk, flag it and propose a safer version.

## Current working agreement

- The user prefers autonomous, implementation-focused progress with a clear final report.
- Commits are welcome when requested; do not push without explicit permission.
- The user values polished, direct, market-aware design and will review visual previews personally.
- Keep the public site useful and credible before the studio has a large shipped-work archive.

## Smooth glide branch note

- Branch/worktree: use `feat/smooth-glide` at `/tmp/illustriober-smooth-glide` for the scroll-motion exploration before merging into `feat/redesign`.
- Direction already discussed with the user: build a signature-feeling scroll experience inspired by Rich Energy / MarketGenie, with Lenis-style smooth scrolling, restrained section reveals, hero handoff motion, and responsive/reduced-motion fallbacks.
- Safety constraint: a previous dependency install attempt froze WSL. Lenis is now added as the only new runtime package for `apps/web`; avoid broad root `npm install` unless explicitly needed. If validation needs local modules, use one narrow package fetch/install at a time and verify the process completes before continuing.
- Do not add heavy scroll-jacking or multiple pinned sections. The desired feel is convincing glide over native content, not a page that fights the user's scroll.
