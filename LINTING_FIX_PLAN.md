# Linting Issues Fix Plan

## Summary
- **Total Issues**: 31 (18 errors, 13 warnings)
- **Strategy**: Fix by category to avoid git conflicts

## Categories

### 1. Unescaped Single Quotes (11 errors)
Replace `'` with `&apos;` or `&#39;` in JSX text:
- `apps/web/src/app/about/page.tsx` (5 errors)
- `apps/web/src/app/enquiry/page.tsx` (5 errors)
- `apps/web/src/app/services/page.tsx` (2 errors)
- `apps/web/src/app/work/page.tsx` (1 error)
- `apps/web/src/components/Navbar.tsx` (1 error)
- `apps/web/src/components/CTASection.tsx` (1 error)

### 2. Unused Variables (7 warnings)
Remove these unused imports/variables:
- `SectionHeader` from enquiry/page.tsx (line 11)
- `SectionHeader` from work/page.tsx (line 8)
- `SectionWrapper` from CTASection.tsx (line 2)
- `Image` from ClientLogosBar.tsx (line 3)
- `useEffect` from ClientLogosBar.tsx (line 4)
- `cn` from Navbar.tsx (line 7)
- `SectionWrapper` from ServicesSection.tsx (line 5)
- `SectionHeader` from ServicesSection.tsx (line 6)
- `ServiceCard` from ServicesSection.tsx (line 7)
- `ValueCard` from WhyUsSection.tsx (line 4)
- `selectedService` and `setSelectedService` from ServicesSection.tsx (line 85)

### 3. Image Element Warning (1 warning)
- Replace `<img>` with Next.js `<Image>` component in ClientLogosBar.tsx

### 4. TypeScript `any` Types (3 errors)
- `analytics.ts` lines 102, 110, 111: Replace `any` with proper types

## Execution Order
1. Fix unescaped entities (files: about, enquiry, services, work, Navbar, CTASection)
2. Remove unused imports/variables
3. Fix `any` types in analytics.ts
4. Run lint to verify all pass
