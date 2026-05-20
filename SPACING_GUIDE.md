# Global Spacing & Layout System

This guide explains the new global spacing utilities and how to use them consistently across all pages.

## Overview

- **Navbar**: Fixed at the top with auto-spacing for main content
- **Main content**: Automatically padded to account for navbar
- **Section spacing**: Predefined size classes for consistent spacing
- **Utility classes**: Fine-grained control for gaps, padding, margins

## Usage

### Page-Level Spacing

Use these classes on your main page wrapper:

```tsx
// Small pages (auth, simple dashboards)
<div className="page-small">
  {children}
</div>

// Medium pages (default for most content)
<div className="page-medium">
  {children}
</div>

// Large pages (hero sections, landing pages)
<div className="page-large">
  {children}
</div>
```

### Section Spacing

Use `SectionWrapper` with spacing variants:

```tsx
// Tight spacing
<SectionWrapper variant="tight" spacing="sm">
  <Container>{content}</Container>
</SectionWrapper>

// Normal spacing (default)
<SectionWrapper variant="normal" spacing="md">
  <Container>{content}</Container>
</SectionWrapper>

// Large spacing
<SectionWrapper variant="large" spacing="lg">
  <Container>{content}</Container>
</SectionWrapper>
```

### Direct Section Classes

Or use spacing classes directly on `<section>`:

```tsx
<section className="section-xs">  {/* 0.5rem - 1.5rem mobile */}
<section className="section-sm">  {/* 1rem - 2rem mobile */}
<section className="section-md">  {/* 1.5rem - 3rem mobile */}
<section className="section-lg">  {/* 2rem - 4rem mobile */}
<section className="section-xl">  {/* 3rem - 6rem mobile */}
```

### Spacing Values

| Size | Desktop | Mobile | Use Case |
|------|---------|--------|----------|
| `xs` | 1rem | 0.5rem | Minimal spacing, lists |
| `sm` | 2rem | 1rem | Sidebar, secondary sections |
| `md` | 3rem | 1.5rem | Default content sections |
| `lg` | 4rem | 2rem | Hero sections, highlights |
| `xl` | 6rem | 3rem | Major page divisions |

### Utility Classes

#### Gap (for flex containers)
```tsx
<div className="flex gap-sm">  {/* 1rem gap */}
<div className="flex gap-md">  {/* 1.5rem gap */}
<div className="flex gap-lg">  {/* 2rem gap */}
```

#### Padding
```tsx
<div className="p-sm">   {/* 1rem padding */}
<div className="p-md">   {/* 1.5rem padding */}
<div className="p-lg">   {/* 2rem padding */}
```

#### Margins
```tsx
<h2 className="mt-md mb-lg">Heading</h2>  {/* 1.5rem top, 2rem bottom */}
<div className="mt-lg">Content</div>    {/* 2rem top margin */}
```

### Content Container Widths

```tsx
<div className="content-narrow">   {/* max-width: 28rem (448px) */}
<div className="content-normal">   {/* max-width: 42rem (672px) */}
<div className="content-wide">     {/* max-width: 56rem (896px) */}
<div className="content-full">     {/* max-width: 100% */}
```

## Examples

### Login/Register Page
```tsx
export default function LoginPage() {
  return (
    <div className="page-small">
      <section className="section-sm">
        <Container>
          <div className="content-normal mx-auto">
            <h1 className="mb-md">Sign In</h1>
            <form className="space-y-4">
              {/* form fields */}
            </form>
          </div>
        </Container>
      </section>
    </div>
  );
}
```

### Admin Dashboard
```tsx
export default function AdminPage() {
  return (
    <div className="page-medium">
      <section className="section-md">
        <Container>
          <div className="flex gap-lg">
            <Sidebar />
            <MainContent />
          </div>
        </Container>
      </section>
    </div>
  );
}
```

### Landing Page with Multiple Sections
```tsx
export default function HomePage() {
  return (
    <main>
      <section className="section-xl">
        <Hero />
      </section>
      <SectionWrapper variant="large" spacing="lg">
        <Features />
      </SectionWrapper>
      <SectionWrapper variant="normal" spacing="md">
        <CaseStudies />
      </SectionWrapper>
    </main>
  );
}
```

## Navbar & Main Content

The navbar is **fixed at the top** and main content is automatically padded:

```css
:root {
  --navbar-height: 5.5rem; /* Desktop */
  --navbar-mobile-height: 4.5rem; /* Mobile */
}

main {
  padding-top: var(--navbar-height);
}
```

**No need to add extra spacing** — it's handled automatically!

## Best Practices

1. **Always use spacing classes** — Never hardcode padding/margin values
2. **Use SectionWrapper for content sections** — Ensures consistency
3. **Use page-* classes for page wrappers** — Accounts for navbar
4. **Responsive by default** — All classes have mobile variants
5. **Consistent across app** — Same spacing everywhere

## Responsive Behavior

All spacing classes reduce on mobile (≤768px). For example:
- `section-md` = 3rem desktop, 1.5rem mobile
- `gap-lg` = 2rem desktop, responsive reduction mobile
- `p-lg` = 2rem (stays same, but content narrows)

## Migration Guide

If updating existing pages:

```tsx
// OLD
<div className="flex flex-col w-full bg-background min-h-[70vh]">
  <section className="relative overflow-hidden bg-background pt-32 pb-8">

// NEW
<div className="page-small">
  <section className="section-sm">
```

This ensures all pages follow the same spacing system and the navbar issue never happens again.
