import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const publicRoutes = [
  {
    path: "/",
    changeFrequency: "weekly" as const,
    priority: 1,
  },
  {
    path: "/about",
    changeFrequency: "monthly" as const,
    priority: 0.8,
  },
  {
    path: "/services",
    changeFrequency: "monthly" as const,
    priority: 0.9,
  },
  {
    path: "/work",
    changeFrequency: "monthly" as const,
    priority: 0.9,
  },
  {
    path: "/tech-stack",
    changeFrequency: "monthly" as const,
    priority: 0.7,
  },
  {
    path: "/enquiry",
    changeFrequency: "weekly" as const,
    priority: 0.8,
  },
  {
    path: "/privacy",
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    path: "/terms",
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    lastModified: new Date(),
  }));
}
