/**
 * SEO Utilities
 * Common SEO helper functions for meta tags, schemas, and sitemaps
 */

export const siteConfig = {
  name: "Illustriober",
  description: "Premium tech studio specializing in full-stack web development, mobile apps, and design",
  url: "https://illustriober.com",
  ogImage: "https://illustriober.com/og-image.png",
  twitterHandle: "@illustriober",
};

export function generateMetadata(overrides = {}) {
  return {
    title: `${siteConfig.name} | Premium Tech Studio`,
    description: siteConfig.description,
    openGraph: {
      title: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitterHandle,
    },
    ...overrides,
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      "https://twitter.com/illustriober",
      "https://linkedin.com/company/illustriober",
      "https://github.com/illustriober",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "hello@illustriober.com",
    },
  };
}

export function generateServiceSchema(service: {
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export const robots = {
  index: true,
  follow: true,
  "max-image-preview": "large",
  "max-snippet": -1,
  "max-video-preview": -1,
  googleBot: "index, follow",
};
