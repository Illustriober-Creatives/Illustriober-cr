/**
 * Performance Utilities
 * Helps with optimization recommendations and monitoring
 */

/**
 * Core Web Vitals targets for Lighthouse score >= 90
 */
export const PERFORMANCE_TARGETS = {
  LCP: 2500, // Largest Contentful Paint in ms
  FID: 100, // First Input Delay in ms
  CLS: 0.1, // Cumulative Layout Shift
  TTFB: 600, // Time to First Byte in ms
};

/**
 * Image optimization guidelines
 */
export const imageOptimizationRules = {
  // Use Next.js Image component
  useNextImage: "Always use next/image for images",

  // Responsive images
  sizes:
    'Use sizes prop: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"',

  // Loading strategy
  loading: 'Use loading="lazy" for below-fold images',

  // Formats
  formats: "Serve WebP and AVIF formats (configured in next.config.ts)",
};

/**
 * Code splitting guidelines
 */
export const codeSplittingRules = {
  dynamicImports:
    "Use dynamic imports for large components: dynamic(() => import('Component'))",

  examples: [
    "dynamic(() => import('@/components/HeavyAnalytics'))",
    "dynamic(() => import('@/components/LargeForm'), { loading: () => <div>Loading...</div> })",
  ],
};

/**
 * Font optimization
 */
export const fontOptimization = {
  preload: "Preload critical fonts in layout.tsx",
  subset: "Use font-display: swap to prevent FOUT",
  usage: "Only load fonts needed for critical content",
};
