# Lighthouse Accessibility Contrast Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the real Lighthouse/axe "insufficient color contrast" accessibility failures found on `/` (22/23, contrast is the only failing audit) and confirm the two `/about` findings are browser-extension noise, not app bugs.

**Architecture:** Introduce one new accessible design token (`--accent-ink`) for orange text-on-light usage, swap the failing hex text colors over to it, bump one under-contrast footer opacity, and remove a duplicated hidden text node in `HeroTypewriter` that axe is anchoring the contrast failure to. No layout, spacing, or component-structure changes.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS 4 (arbitrary-value utilities + `@theme`/CSS custom properties in `globals.css`), no frontend test suite (per `CLAUDE.md`) — verification is a throwaway Node contrast-ratio script plus a visual check.

**Spec:** This plan is driven directly by the four Lighthouse/DevTools screenshots the user supplied (homepage Accessibility panel, 22/23 with the CONTRAST rule failing; `/about` panel showing "Uses deprecated APIs" and a CSP entry in the Issues panel) — no separate written spec file.

## Global Constraints

- Do not touch spacing/layout — this branch is contrast-only, kept separate from the in-flight `fix/hero-gap-spacing` work.
- Reuse the existing brand hue (orange) rather than switching to black/green for the failing text — swap to a **darker shade of the same orange**, not a different color family.
- Every changed color pair must be verified ≥ 4.5:1 (normal text) or ≥ 3:1 (large text, ≥24px/18pt or ≥18.66px bold) using the WCAG relative-luminance formula — not eyeballed.
- Do not fabricate a fix for the `/about` deprecated-API and CSP findings if investigation shows they originate outside our code (see Task 5) — report findings honestly instead of writing speculative code.

---

## Root-cause summary (already investigated, do not re-derive)

Read `apps/web/src/app/globals.css:9-70`, `apps/web/src/app/page.tsx`, `apps/web/src/components/Footer.tsx`, and `apps/web/src/components/motion/HeroTypewriter.tsx` before starting — the failing elements map to exactly three causes:

1. **`text-[#F39314]` used as a *text* color** (not background/border/decoration) on light backgrounds. Measured contrast against `#F4EFE5` is **2.04:1** — fails even the 3:1 large-text floor, let alone 4.5:1 for the `text-xs font-bold` eyebrow labels and numerals. Occurs in:
   - `apps/web/src/app/page.tsx` — lines 38, 39 (×2 in the map), 62, 64 (×4 in the map): "How we help" / "A visible process" eyebrows and the `01`–`04` numerals.
   - `apps/web/src/app/about/page.tsx:26` — `<em className="font-normal text-[#F39314]">clear.</em>`
   - `apps/web/src/app/work/page.tsx:16` — `<em className="font-normal text-[#F39314]">useful.</em>`
   (Uses of `#F39314` as `bg-`, `border-`, `hover:border-`, or `decoration-` are NOT contrast violations and must not be touched.)

2. **Footer copyright line opacity.** `apps/web/src/components/Footer.tsx:25` — `text-[#F4EFE5]/45` on `bg-[#171717]`. Effective blended color contrast is **4.07:1**, just under the 4.5:1 floor for `text-xs`. The nav description line right above it (`/65`) already passes (7.3:1+) and is untouched.

3. **`HeroTypewriter` duplicate hidden text node.** `apps/web/src/components/motion/HeroTypewriter.tsx:101` and `:109` each render a visually-hidden `<span className="sr-only">` holding the real copy, immediately followed by an `aria-hidden="true"` sibling with the animated visible markup. Axe/Lighthouse is anchoring one of its contrast failures to this pattern (verified: only one `sr-only` span and only one instance of the flagged `bg-[#F4EFE5] text-[#171717]` div exist in the rendered homepage HTML — confirmed via `curl` of the live page, so this is not a repeat-render artifact). The fix is structural, not a color change: collapse the sr-only/aria-hidden pair into a single `aria-label` on the parent `<h1>`, which removes the extra text node axe is evaluating.

---

## Task 1: Add an accessible `--accent-ink` token

**Files:**
- Modify: `apps/web/src/app/globals.css:9-70`

**Interfaces:**
- Produces: CSS custom property `--accent-ink` (hex `#A64A00`), available via `var(--accent-ink)`, defined identically in both the `:root` block and the `.light, .dark` block (this codebase currently gives light/dark the same palette — match that existing pattern, don't introduce a new light/dark split).

- [ ] **Step 1: Verify the candidate color numerically**

Run this from the repo root (no package needed, plain Node):

```bash
node -e '
function lum(hex) {
  const [r,g,b] = [0,1,2].map(i => parseInt(hex.slice(1+i*2,3+i*2),16)/255)
    .map(c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4));
  return 0.2126*r + 0.7152*g + 0.0722*b;
}
function ratio(a,b) {
  const [l1,l2] = [lum(a), lum(b)].sort((x,y)=>y-x);
  return (l1+0.05)/(l2+0.05);
}
console.log("F39314 vs F4EFE5 (current, must be failing):", ratio("#F39314","#F4EFE5").toFixed(2));
console.log("A64A00 vs F4EFE5 (new, must be >= 4.5):", ratio("#A64A00","#F4EFE5").toFixed(2));
console.log("A64A00 vs FFFDF8 (new, surface bg, must be >= 4.5):", ratio("#A64A00","#FFFDF8").toFixed(2));
'
```

Expected: `2.04`, `5.09`, `5.74` — confirming the current color fails and the replacement passes with margin on both light backgrounds the site uses.

- [ ] **Step 2: Add the token**

In `apps/web/src/app/globals.css`, in the `:root` block (around line 13, right after `--accent`):

```css
  --accent: #D96800;
  --accent-ink: #A64A00;
```

And in the `.light, .dark` block (around line 53, same position):

```css
  --accent: #D96800;
  --accent-ink: #A64A00;
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "style(web): add accessible accent-ink token for orange text on light bg"
```

---

## Task 2: Replace failing orange text usages with `--accent-ink`

**Files:**
- Modify: `apps/web/src/app/page.tsx:38-39,62,64`
- Modify: `apps/web/src/app/about/page.tsx:26`
- Modify: `apps/web/src/app/work/page.tsx:16`

**Interfaces:**
- Consumes: `--accent-ink` from Task 1 (must already be defined in `globals.css`).

- [ ] **Step 1: `apps/web/src/app/page.tsx` — "How we help" eyebrow (line 38)**

Change:
```tsx
<p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F39314]">How we help</p>
```
to:
```tsx
<p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-ink)]">How we help</p>
```

- [ ] **Step 2: `apps/web/src/app/page.tsx` — `01/02/03` numerals (line 39)**

Change:
```tsx
<p className="text-xs font-bold text-[#F39314]">{number}</p>
```
to:
```tsx
<p className="text-xs font-bold text-[var(--accent-ink)]">{number}</p>
```
(This is inside the `.map(...)` on line 39 — there is exactly one such `<p>` in that line; do not touch the `hover:border-[#F39314]` on the same line, that's a border and stays as-is.)

- [ ] **Step 3: `apps/web/src/app/page.tsx` — "A visible process" eyebrow (line 62)**

Change:
```tsx
<p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F39314]">A visible process</p>
```
to:
```tsx
<p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-ink)]">A visible process</p>
```

- [ ] **Step 4: `apps/web/src/app/page.tsx` — `01`–`04` numerals in the process list (line 64)**

Change:
```tsx
<p className="text-xs font-bold text-[#F39314]">{number}</p>
```
to:
```tsx
<p className="text-xs font-bold text-[var(--accent-ink)]">{number}</p>
```
(Same caveat as Step 2: leave `hover:border-[#F39314]` alone.)

- [ ] **Step 5: `apps/web/src/app/about/page.tsx:26`**

Change:
```tsx
<h1 className="max-w-4xl font-display text-6xl leading-[0.87] tracking-[-0.055em] md:text-8xl">We make the complicated feel <em className="font-normal text-[#F39314]">clear.</em></h1>
```
to:
```tsx
<h1 className="max-w-4xl font-display text-6xl leading-[0.87] tracking-[-0.055em] md:text-8xl">We make the complicated feel <em className="font-normal text-[var(--accent-ink)]">clear.</em></h1>
```

- [ ] **Step 6: `apps/web/src/app/work/page.tsx:16`**

Change:
```tsx
<h1 className="max-w-4xl font-display text-5xl leading-[0.9] tracking-[-0.05em] md:text-7xl">Ideas made <em className="font-normal text-[#F39314]">useful.</em></h1>
```
to:
```tsx
<h1 className="max-w-4xl font-display text-5xl leading-[0.9] tracking-[-0.05em] md:text-7xl">Ideas made <em className="font-normal text-[var(--accent-ink)]">useful.</em></h1>
```

- [ ] **Step 7: Confirm no other foreground uses were missed**

```bash
grep -rn "text-\[#F39314\]" apps/web/src --include="*.tsx"
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/about/page.tsx apps/web/src/app/work/page.tsx
git commit -m "fix(web): swap orange text color to accessible accent-ink for WCAG contrast"
```

---

## Task 3: Fix footer copyright line contrast

**Files:**
- Modify: `apps/web/src/components/Footer.tsx:25`

- [ ] **Step 1: Verify the fix numerically**

```bash
node -e '
function lum(hex) {
  const [r,g,b] = [0,1,2].map(i => parseInt(hex.slice(1+i*2,3+i*2),16)/255)
    .map(c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4));
  return 0.2126*r + 0.7152*g + 0.0722*b;
}
function ratio(a,b) {
  const [l1,l2] = [lum(a), lum(b)].sort((x,y)=>y-x);
  return (l1+0.05)/(l2+0.05);
}
function blend(fgHex, bgHex, alpha) {
  const f = [0,1,2].map(i => parseInt(fgHex.slice(1+i*2,3+i*2),16));
  const b = [0,1,2].map(i => parseInt(bgHex.slice(1+i*2,3+i*2),16));
  const mix = f.map((c,i) => Math.round(alpha*c + (1-alpha)*b[i]));
  return "#" + mix.map(c => c.toString(16).padStart(2,"0")).join("");
}
console.log("current /45:", ratio(blend("#F4EFE5","#171717",0.45), "#171717").toFixed(2));
console.log("new /60:", ratio(blend("#F4EFE5","#171717",0.60), "#171717").toFixed(2));
'
```

Expected: `4.07` (current, fails 4.5) then `6.31` (new, passes).

- [ ] **Step 2: Edit `Footer.tsx`**

Change:
```tsx
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-5 text-xs text-[#F4EFE5]/45">
```
to:
```tsx
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-5 text-xs text-[#F4EFE5]/60">
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/Footer.tsx
git commit -m "fix(web): raise footer copyright opacity for WCAG contrast"
```

---

## Task 4: Remove the duplicate hidden text node in `HeroTypewriter`

**Files:**
- Modify: `apps/web/src/components/motion/HeroTypewriter.tsx:97-117`

**Interfaces:**
- Produces: identical screen-reader-announced text as before ("Reliable software, shaped around your business." / "It all starts with useful software."), now delivered via `aria-label` on the `<h1>` instead of a separate `sr-only` text node. Visible rendering (the `aria-hidden` animated spans) is unchanged.

- [ ] **Step 1: Edit the `return` block**

Current (`apps/web/src/components/motion/HeroTypewriter.tsx:97-117`):

```tsx
  return (
    <div className={`${styles.shell} ${variant === "services" ? styles.services : ""}`}>
      {variant === "services" ? (
        <h1 className="font-display text-[clamp(2.975rem,calc(6vw-2px),6.075rem)] leading-[1.02] tracking-normal">
          <span className="sr-only">Reliable software, shaped around your business.</span>
          <span className={styles.servicesLine} aria-hidden="true">
            <span className={styles.servicesOpening}>{rotatingWord} software, shaped</span>
            <span className={styles.servicesTail}>around your business.</span>
          </span>
        </h1>
      ) : (
        <h1 className="max-w-4xl font-display tracking-normal lg:max-w-none">
          <span className="sr-only">It all starts with useful software.</span>
          <span className={styles.line} aria-hidden="true">
            <span className={`${styles.firstLine} text-xl sm:text-2xl md:text-3xl`}>It all starts</span>
            <span className={`${styles.purposeLine} text-5xl leading-[0.86] sm:text-6xl md:text-7xl lg:text-[clamp(5rem,calc(7vw-4px),7.5rem)]`}>
              with {rotatingWord}
            </span>
          </span>
        </h1>
      )}
```

Replace with:

```tsx
  return (
    <div className={`${styles.shell} ${variant === "services" ? styles.services : ""}`}>
      {variant === "services" ? (
        <h1
          aria-label="Reliable software, shaped around your business."
          className="font-display text-[clamp(2.975rem,calc(6vw-2px),6.075rem)] leading-[1.02] tracking-normal"
        >
          <span className={styles.servicesLine} aria-hidden="true">
            <span className={styles.servicesOpening}>{rotatingWord} software, shaped</span>
            <span className={styles.servicesTail}>around your business.</span>
          </span>
        </h1>
      ) : (
        <h1
          aria-label="It all starts with useful software."
          className="max-w-4xl font-display tracking-normal lg:max-w-none"
        >
          <span className={styles.line} aria-hidden="true">
            <span className={`${styles.firstLine} text-xl sm:text-2xl md:text-3xl`}>It all starts</span>
            <span className={`${styles.purposeLine} text-5xl leading-[0.86] sm:text-6xl md:text-7xl lg:text-[clamp(5rem,calc(7vw-4px),7.5rem)]`}>
              with {rotatingWord}
            </span>
          </span>
        </h1>
      )}
```

(Nothing below this block — the motion-control `<button>` — changes.)

- [ ] **Step 2: Confirm no leftover `sr-only` in this file**

```bash
grep -n "sr-only" apps/web/src/components/motion/HeroTypewriter.tsx
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/motion/HeroTypewriter.tsx
git commit -m "fix(web): use aria-label instead of sr-only span in HeroTypewriter"
```

---

## Task 5: Verify the fix in a real browser + rule out the `/about` findings as extension noise

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

```bash
npm run dev --workspace apps/web
```

- [ ] **Step 2: Re-run Lighthouse's Accessibility audit on `http://localhost:3000/` in an Incognito Chrome window with all extensions disabled**

This is the critical control: the `/about` screenshot's "Shared Storage API is deprecated" warning names its source explicitly as `/scripts/contentscript.js` from extension id `nkbihfbeogaeaoehiefnkodbefgpgknn` — that id is the MetaMask extension, not app code. Confirm:
- `grep -rn "SharedStorage\|sharedStorage" apps/web/src` returns nothing (it won't — this isn't our API surface at all).
- The homepage Accessibility score is now the maximum (previously 22/23 with only CONTRAST failing).
- The `/about` "Uses deprecated APIs" and CSP Issues-panel entries disappear once extensions are disabled. If they persist with extensions off, that's new information — stop and re-investigate rather than assuming it's still extension noise.

- [ ] **Step 3: Manual visual check**

Open `/`, `/about`, and `/work` and confirm the orange eyebrow labels, numerals, and "clear."/"useful." emphasis words still read as a clear brand orange (not muddy or brown) at the new `#A64A00` — this is a deliberate darkening, so the goal is "still obviously orange, no longer a contrast failure," not identical to the original hex.

- [ ] **Step 4: Report findings**

No code change results from this task. State plainly to the user: the deprecated-API warning and the CSP Issues-panel entry on `/about` trace to the MetaMask browser extension injecting `contentscript.js` into the page, not to anything in this repository — recommend they re-run Lighthouse in Incognito (extensions off) to get a clean report, and that no fix is needed here for those two items unless the Incognito run shows otherwise.

---

## Self-review notes

- **Coverage:** All 6 distinct failing elements from the 3 homepage screenshots are covered — 4× `text-[#F39314]` eyebrow/numeral instances (Task 2, plus the 2 more of the same pattern further down the page caught by the same fix), the `HeroTypewriter` sr-only div (Task 4), and the footer copyright line (Task 3). The 2 `/about` findings are explicitly handled as a verification/reporting task (Task 5), not silently dropped.
- **No placeholders:** every step has the literal before/after code.
- **Scope discipline:** `bg-[#F39314]`, `border-[#F39314]`, `decoration-[#F39314]` are explicitly called out as unchanged in the root-cause summary and Task 2 steps, since a blind find-and-replace on `F39314` would wrongly touch those too.
