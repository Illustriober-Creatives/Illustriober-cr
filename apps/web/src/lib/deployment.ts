/**
 * Deployment Checklist for Phase 1
 * Complete before deploying to production
 */

export const deploymentChecklist = {
  "Pre-Deployment Checks": [
    {
      task: "Run linter",
      command: "npm run lint",
      status: "⏳ Pending",
    },
    {
      task: "Run tests",
      command: "npm run test (if available)",
      status: "⏳ Pending",
    },
    {
      task: "Build production bundle",
      command: "npm run build",
      status: "⏳ Pending",
    },
    {
      task: "Check bundle size",
      command: "npm run analyze (if available)",
      status: "⏳ Pending",
    },
    {
      task: "Verify environment variables",
      command: "Check .env.production is configured",
      status: "⏳ Pending",
    },
    {
      task: "No secrets in code",
      command: "grep -r 'password\\|token\\|key' src/",
      status: "⏳ Pending",
    },
  ],

  "Functionality Tests": [
    "Home page loads and renders all sections",
    "Navigation works on mobile and desktop",
    "All pages are accessible from navbar",
    "Enquiry form validates and submits",
    "Links point to correct destinations",
    "No console errors",
    "Images load correctly",
    "Responsive design on mobile/tablet/desktop",
  ],

  "SEO Verification": [
    "Meta tags present on all pages",
    "Open Graph tags configured",
    "Sitemap.xml is accessible",
    "Robots.txt is configured",
    "Structured data (JSON-LD) validates",
    "Canonical URLs are set",
    "Mobile-friendly test passes",
  ],

  "Performance Checks": [
    "Lighthouse score >= 90 for Performance",
    "Lighthouse score >= 90 for SEO",
    "Lighthouse score >= 90 for Accessibility",
    "Lighthouse score >= 90 for Best Practices",
    "Page load time < 3 seconds",
    "CLS < 0.1",
    "LCP < 2.5s",
  ],

  "Vercel Deployment": [
    "Connect GitHub repository to Vercel",
    "Configure environment variables in Vercel",
    "Set domain to illustriober.com",
    "Enable automatic deployments from main branch",
    "Configure custom domain SSL certificate",
    "Test preview deployment",
    "Monitor error tracking",
    "Set up log aggregation",
  ],

  "Post-Deployment": [
    "Visit https://illustriober.com",
    "Test all forms work end-to-end",
    "Verify enquiry emails are sent (Resend + ENQUIRY_* env on API)",
    "Smoke-test /login → /dashboard and sign out",
    "Check analytics are tracking",
    "Run Lighthouse audit on production",
    "Monitor error logs for 24 hours",
    "Test from different networks/devices",
    "Verify social sharing (OG tags)",
  ],
};

/**
 * Deployment commands
 */
export const deploymentCommands = {
  // Local testing
  lint: "npm run lint",
  build: "npm run build",
  test: "npm run test",

  // Vercel deployment
  deployPreview: "vercel --prod=false",
  deployProduction: "vercel --prod",
};

/**
 * Environment variables needed for production
 */
export const requiredEnvVars = {
  web: [
    "NEXT_PUBLIC_API_URL",
    "API_PROXY_URL (Vercel → VPS API base, no trailing slash)",
    "NEXT_PUBLIC_PLAUSIBLE_DOMAIN (optional)",
    "NEXT_PUBLIC_GA_ID (optional)",
  ],
  api: [
    "DATABASE_URL",
    "NODE_ENV=production",
    "CORS_ORIGIN=https://illustriober.com",
    "JWT_SECRET (for auth)",
    "JWT_REFRESH_SECRET",
    "RESEND_API_KEY (for emails)",
  ],
};
