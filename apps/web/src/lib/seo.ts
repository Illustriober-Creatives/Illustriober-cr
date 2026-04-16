import type { Metadata } from "next";

export const siteConfig = {
  name: "Illustriober Creatives",
  shortName: "Illustriober",
  url: "https://illustriober.com",
  locale: "en_US",
  twitterHandle: "@illustriober",
  defaultTitle: "Illustriober Creatives | Full-Stack Web & Mobile Development Studio",
  defaultDescription:
    "Premium creative studio specializing in full-stack web development, mobile apps, UI/UX design, and cloud deployment. We build remarkable digital experiences.",
  defaultKeywords: [
    "web development agency",
    "mobile app development",
    "UI UX design studio",
    "full-stack development",
    "Next.js agency",
    "React development",
  ],
} as const;

type MetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
};

export function absoluteUrl(path = "/") {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+/, "")}`;
  return new URL(normalized, siteConfig.url).toString();
}

export function getRobots(noIndex = false): NonNullable<Metadata["robots"]> {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export function createMetadata({
  title,
  description = siteConfig.defaultDescription,
  path = "/",
  keywords = getDefaultKeywords(),
  noIndex = false,
  type = "website",
}: MetadataInput = {}): Metadata {
  const canonical = absoluteUrl(path);
  const resolvedTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.defaultTitle;
  const image = absoluteUrl("/opengraph-image");

  return {
    title: resolvedTitle,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: getRobots(noIndex),
    openGraph: {
      title: resolvedTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} social preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      creator: siteConfig.twitterHandle,
      title: resolvedTitle,
      description,
      images: [image],
    },
  };
}

export function getDefaultKeywords() {
  return [...siteConfig.defaultKeywords];
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    logo: absoluteUrl("/favicon.ico"),
    description: siteConfig.defaultDescription,
    email: "hello@illustriober.com",
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.defaultDescription,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
