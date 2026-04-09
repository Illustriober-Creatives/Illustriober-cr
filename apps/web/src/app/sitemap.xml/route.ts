import { generateSitemap } from "@/lib/sitemap";

export async function GET() {
  const sitemap = generateSitemap();

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
