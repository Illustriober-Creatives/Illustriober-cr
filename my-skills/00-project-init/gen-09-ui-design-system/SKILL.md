---
name: gen-09-ui-design-system
description: Generate complete design system with colors, typography, components, and design tokens
risk: low
source: custom
date_added: 2026-04-12
---

# UI Design System Generator (09)

You are a **design system architect** responsible for defining a cohesive design language, component patterns, and visual identity for the entire project.

## Use this skill when

- The orchestrator invokes you with client brief + design preferences
- A unified design system is needed across all pages and components
- Tailwind CSS and shadcn/ui configuration must be specified
- This is **step 7b** in the specification pipeline (can run parallel with features)

## Do not use this skill when

- Client already has established brand guidelines
- Design decisions are deferred to later phases

## Instructions

### Input

- Client brief documents (company branding, color preferences, etc.)
- 00_PROJECT_OVERVIEW.md (company identity)

### Generation Steps

1. **Extract Brand Identity from Brief**
   - Company colors (primary, secondary, accent)
   - Logo style (if described)
   - Industry / brand personality (professional, creative, casual, etc.)
   - Target audience design preferences
   - Any existing brand guidelines or examples

2. **Define Color Palette**
   - **Primary Color** — Main brand color, used for buttons, links, key UI elements
   - **Secondary Color** — Accent color for highlights, secondary actions
   - **Neutral Colors** — Grays for backgrounds, text, borders
   - **Status Colors** — Green (success), Red (error), Yellow (warning), Blue (info)
   - Example palette for a design/dev studio:
     ```
     Primary: #2563EB (blue)
     Secondary: #F59E0B (amber)
     Neutral: Grays (#F3F4F6 to #111827)
     Success: #10B981
     Error: #EF4444
     Warning: #F59E0B
     Info: #3B82F6
     ```

3. **Typography Scale**
   - **Font Family:** Specify for headings, body, code
     - Default recommendation: Inter (sans-serif) for body, Fira Code for code blocks
   - **Font Sizes:** Define scale (H1, H2, H3, Body, Small, Caption)
     - H1: 2.25rem (36px)
     - H2: 1.875rem (30px)
     - H3: 1.5rem (24px)
     - Body: 1rem (16px)
     - Small: 0.875rem (14px)
     - Caption: 0.75rem (12px)
   - **Line Height:** Body (1.6), Headings (1.2), Code (1.5)
   - **Font Weight:** Regular (400), Medium (500), Semibold (600), Bold (700)

4. **Spacing System**
   - Define spacing unit (typically 4px or 8px)
   - Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96px
   - Use consistent spacing for margins, padding, gaps

5. **Component Patterns** (Using shadcn/ui)
   - **Button** — Primary, secondary, ghost, outline variants
   - **Input** — Text, email, password, with validation states
   - **Select** — Dropdown for role selection, status filters
   - **Card** — Container for project, ticket, user info
   - **Modal** — Dialogs for create/edit actions
   - **Toast** — Notifications for success/error
   - **Badge** — Status labels (active, done, blocked)
   - **Avatar** — User profile pictures
   - **Breadcrumb** — Navigation hierarchy
   - **Table** — Data display for lists
   - **Form** — Label, input, validation, submit

6. **Dark/Light Mode** (if applicable)
   - Define how colors adapt in dark mode
   - Recommended: Tailwind's dark mode support
   - Ensure sufficient contrast in both modes (WCAG AA minimum)

7. **Responsive Breakpoints**
   - Mobile (< 640px)
   - Tablet (640px – 1024px)
   - Desktop (> 1024px)
   - Use Tailwind breakpoints (sm, md, lg, xl, 2xl)

8. **Accessibility Guidelines**
   - **Color Contrast:** Always >= 4.5:1 for text, 3:1 for UI components (WCAG AA)
   - **Focus States:** All interactive elements have clear focus indicators
   - **Keyboard Navigation:** Tab order, focus visible
   - **Alt Text:** All images have descriptive alt text
   - **ARIA Labels:** Form fields, buttons, modals have proper labels

9. **Tailwind Configuration**
   - Document Tailwind config (tailwind.config.ts) with custom colors, fonts, spacing
   - Example:
     ```typescript
     module.exports = {
       theme: {
         colors: {
           primary: {...},
           secondary: {...},
         },
         fontFamily: {
           body: ['Inter', 'sans-serif'],
           code: ['Fira Code', 'monospace'],
         },
       }
     }
     ```

10. **Design Tokens Documentation**
    - Create a reference for developers: "Use `bg-primary-500` for main buttons"
    - Document component usage: "Use Button variant='primary' for CTAs, variant='secondary' for options"

### Output Format

Markdown file: `09_UI_DESIGN_SYSTEM.md`

Standard sections:
- **Brand Identity** — Logo, colors, personality, audience
- **Color Palette** — Primary, secondary, neutral, status colors with hex codes
- **Typography** — Font families, sizes, weights, line heights
- **Spacing System** — 4px/8px grid, scale
- **Component Patterns** — Button, Input, Select, Card, Modal, Toast, Badge, Avatar, Breadcrumb, Table, Form
  - For each: variants, sizes, interaction states (hover, active, disabled)
- **Responsive Design** — Breakpoints, mobile-first approach
- **Dark/Light Mode** — Color adaptations if supported
- **Accessibility Guidelines** — Contrast, focus, keyboard nav, alt text
- **Tailwind Configuration** — Config code snippet
- **Design Tokens Reference** — Quick lookup for developers

### Example Component: Button

```markdown
### Button

**Variants:**
- Primary: bg-primary-600, text-white, hover:bg-primary-700
- Secondary: bg-secondary-600, text-white, hover:bg-secondary-700
- Ghost: transparent, text-primary-600, hover:bg-primary-100
- Outline: border-primary-600, text-primary-600, hover:bg-primary-50

**Sizes:**
- Small: px-3 py-1, text-sm
- Medium: px-4 py-2, text-base (default)
- Large: px-6 py-3, text-lg

**States:**
- Hover: Background lightens 100px
- Active: Background lightens 200px
- Disabled: Opacity 50%, cursor not-allowed
- Focus: 2px focus ring in primary color

**Usage:**
```tsx
<Button variant="primary" size="medium">
  Create Project
</Button>
```
```

### Validation

- ✓ Color palette has at least 5 main colors (primary, secondary, neutral x2, accent)
- ✓ All status colors (success, error, warning, info, blocked) are defined
- ✓ Typography has headings (H1–H3), body, small, caption
- ✓ Component patterns cover main UI elements (buttons, forms, data display)
- ✓ Accessibility guidelines are documented (contrast, focus, keyboard)
- ✓ Responsive breakpoints are specified
- ✓ Tailwind config example is provided

### Safety

- Ensure color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI)
- All interactive elements have clear focus indicators
- Icons have alt text or aria labels
- Form labels are associated with inputs (for accessibility)
- Don't rely solely on color to convey meaning (use icons, text, diffs)

## Purpose

This design system is the **visual blueprint** — it ensures consistency across all pages/components and provides developers with a reference for styling decisions.

