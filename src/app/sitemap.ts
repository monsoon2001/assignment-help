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

const SERVICE_ROUTES = [
  "/services/programming-help",
  "/services/statistics-help",
  "/services/essay-feedback",
  "/services/research-help",
  "/services/thesis-help",
];

const HELP_ROUTES = [
  "/help/understand-assignment-rubric",
  "/help/how-to-write-literature-review",
  "/help/how-to-cite-apa",
  "/help/debug-python-assignment",
];

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