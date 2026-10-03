export type ResourceBlock =
  | { t: "p"; v: string }
  | { t: "ul"; v: string[] }
  | { t: "ol"; v: string[] }
  | { t: "checklist"; v: string[] }
  | { t: "example"; label: string; v: string[] }
  | { t: "note"; title: string; v: string }
  | { t: "table"; head: string[]; rows: string[][] };

export type ResourceSection = {
  heading: string;
  blocks: ResourceBlock[];
  links?: { label: string; slug: string }[];
};

export type ResourceService = {
  title: string;
  body: string;
  cta: string;
  href: string;
};

export type Resource = {
  slug: string;
  category: string;
  title: string;
  h1: string;
  seoTitle: string;
  description: string;
  ogDescription: string;
  readingMinutes: number;
  intro: string[];
  sections: ResourceSection[];
  takeaways: string[];
  checklist: string[];
  mistakes: string[];
  related: { slug: string; label: string }[];
  subjects: { slug: string; label: string }[];
  service: ResourceService;
  featured?: boolean;
};