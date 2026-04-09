/**
 * Sitemap Generation
 * Creates sitemap.xml for SEO
 */

const BASE_URL = "https://illustriober.com";

const pages = [
  {
    url: "/",
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    url: "/about",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    url: "/services",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    url: "/work",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    url: "/tech-stack",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    url: "/enquiry",
    changefreq: "weekly",
    priority: "0.8",
  },
];

export function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return sitemap;
}
