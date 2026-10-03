import type { MetadataRoute } from "next";
import { SUBJECT_CONTENT } from "@/lib/subject-content";
import { ALL_RESOURCES, RESOURCE_CATEGORIES, resourcePath } from "@/lib/resources";

const BASE_URL = "https://acadibo.com";

const STATIC_ROUTES = [
  "",
  "/about",
  "/browse-helpers",
  "/contact",
  "/faq",
  "/how-it-works",
  "/privacy",
  "/refund-policy",
  "/services",
  "/subjects",
  "/terms",
];

// Only routes with a page.tsx. Several /services/* directories were removed
// when the unimplemented quality-check services were dropped.
const SERVICE_ROUTES = ["/services/programming-help"];

// Only /help/debug-python-assignment has a page. The other three were empty
// leftovers duplicating topics now covered by /resources/*, which would have
// been duplicate content competing with the canonical guides.
const HELP_ROUTES = ["/help/debug-python-assignment"];

export default function sitemap(): MetadataRoute.Sitemap {
  const subjectRoutes = SUBJECT_CONTENT.map((s) => `/subjects/${s.slug}`);
  const categoryRoutes = RESOURCE_CATEGORIES.map((c) => `/resources/${c.slug}`);
  const resourceRoutes = ALL_RESOURCES.map(resourcePath);
  const lastModified = new Date();

  const allRoutes = [
    ...STATIC_ROUTES,
    ...subjectRoutes,
    ...SERVICE_ROUTES,
    ...HELP_ROUTES,
    ...categoryRoutes,
    ...resourceRoutes,
  ];

  return allRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" || route === "/browse-helpers" ? ("daily" as const) : ("weekly" as const),
    priority: route === ""
      ? 1
      : route === "/resources"
        ? 0.9
        : route.startsWith("/subjects/") || route.startsWith("/resources/")
          ? 0.8
          : 0.6,
  }));
}