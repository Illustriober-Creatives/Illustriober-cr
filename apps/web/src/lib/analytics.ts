/**
 * Analytics Utilities
 * Setup for Plausible or Google Analytics
 * 
 * Install: npm install next-plausible
 * or: npm install @react-google-analytics/core
 */

/**
 * Plausible Analytics Configuration
 * Privacy-focused analytics without cookies
 * Add to environment: NEXT_PUBLIC_PLAUSIBLE_DOMAIN=illustriober.com
 */
export function initPlausible() {
  // Implementation instructions:
  // 1. Add script to layout.tsx: <PlausibleProvider domain="illustriober.com">
  // 2. Custom events: import { usePlausible } from 'next-plausible'
  // 3. Track: plausible('custom_event', { props: { key: value } })

  return {
    provider: "Plausible Analytics",
    script: `
import PlausibleProvider from 'next-plausible'

export default function Layout({ children }) {
  return (
    <PlausibleProvider domain="illustriober.com">
      {children}
    </PlausibleProvider>
  )
}
    `,
  };
}

/**
 * Google Analytics Configuration
 */
export function initGoogleAnalytics() {
  // Implementation instructions:
  // 1. Add NEXT_PUBLIC_GA_ID to .env
  // 2. Install: npm install @react-google-analytics/core
  // 3. Add script to layout.tsx
  // 4. Track custom events via gtag

  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

  return {
    provider: "Google Analytics 4",
    measurementId: gaId,
    setup: `
// Add to layout.tsx:
import Script from 'next/script'

<Script
  strategy="afterInteractive"
  src="https://www.googletagmanager.com/gtag/js?id=${gaId}"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  }
</Script>
    `,
  };
}

/**
 * Custom Events to Track
 */
export const analyticsEvents = {
  // Page views (automatic)
  PAGE_VIEW: "page_view",

  // Form events
  FORM_START: "form_start",
  FORM_SUBMIT: "form_submit",
  FORM_ERROR: "form_error",

  // CTA clicks
  CTA_CLICK: "cta_click",
  PROJECT_CLICK: "project_click",
  CONTACT_CLICK: "contact_click",

  // Engagement
  SCROLL_DEPTH: "scroll_depth",
  TIME_ON_PAGE: "time_on_page",
  VIDEO_PLAY: "video_play",

  // Conversions
  ENQUIRY_SUBMITTED: "enquiry_submitted",
  NEWSLETTER_SIGNUP: "newsletter_signup",
  DOWNLOAD: "download",
};

/**
 * Plausible custom event example
 */
export function trackCustomEvent(eventName: string, props?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(eventName, { props });
  }
}

declare global {
  interface Window {
    plausible?: (event: string, options?: unknown) => void;
    gtag?: (...args: unknown[]) => void;
  }
}
