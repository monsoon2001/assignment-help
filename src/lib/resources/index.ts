import type { Resource } from "./types";

import howToWriteAnEssay from "./guides/how-to-write-an-essay";
import howToWriteAThesisStatement from "./guides/how-to-write-a-thesis-statement";
import howToWriteAnIntroduction from "./guides/how-to-write-an-introduction";
import howToWriteAConclusion from "./guides/how-to-write-a-conclusion";
import howToWriteAReport from "./guides/how-to-write-a-report";
import howToWriteALiteratureReview from "./guides/how-to-write-a-literature-review";
import howToWriteAResearchPaper from "./guides/how-to-write-a-research-paper";
import howToWriteALabReport from "./guides/how-to-write-a-lab-report";
import howToWriteACaseStudy from "./guides/how-to-write-a-case-study";
import howToCiteSources from "./guides/how-to-cite-sources";
import apaCitationGuide from "./guides/apa-citation-guide";
import mlaCitationGuide from "./guides/mla-citation-guide";
import howToAvoidPlagiarism from "./guides/how-to-avoid-plagiarism";
import howToParaphrase from "./guides/how-to-paraphrase";
import howToProofreadAnEssay from "./guides/how-to-proofread-an-essay";
import howToMakeAPresentation from "./guides/how-to-make-a-presentation";
import howToWriteAPersonalStatement from "./guides/how-to-write-a-personal-statement";
import howToApproachAProgrammingAssignment from "./guides/how-to-approach-a-programming-assignment";
import howToAnalyzeData from "./guides/how-to-analyze-data";
import howToInterpretStatisticalResults from "./guides/how-to-interpret-statistical-results";

export type ResourceCategory = {
  slug: string;
  name: string;
  icon: string;
  description: string;
};

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    slug: "writing",
    name: "Writing & Essays",
    icon: "edit_note",
    description: "Essays, paragraphs, paraphrasing, and proofreading fundamentals.",
  },
  {
    slug: "research",
    name: "Reports & Research",
    icon: "assignment",
    description: "Reports, lab write-ups, literature reviews, and case studies.",
  },
  {
    slug: "citations",
    name: "Citations & Referencing",
    icon: "format_quote",
    description: "Citation styles, reference lists, and originality.",
  },
  {
    slug: "projects",
    name: "Academic Projects",
    icon: "folder_open",
    description: "Longer research projects and formal academic writing.",
  },
  {
    slug: "technical",
    name: "Technical & Data",
    icon: "functions",
    description: "Programming assignments, data analysis, and statistics writing.",
  },
  {
    slug: "presentations",
    name: "Presentations & Applications",
    icon: "slideshow",
    description: "Decks, slide structure, and application essays.",
  },
];

const GUIDE_LIST: Resource[] = [
  howToWriteAnEssay,
  howToWriteAReport,
  howToWriteALiteratureReview,
  howToWriteAResearchPaper,
  howToWriteALabReport,
  howToWriteACaseStudy,
  howToCiteSources,
  apaCitationGuide,
  mlaCitationGuide,
  howToAvoidPlagiarism,
  howToParaphrase,
  howToProofreadAnEssay,
  howToMakeAPresentation,
  howToWriteAPersonalStatement,
  howToApproachAProgrammingAssignment,
  howToAnalyzeData,
  howToInterpretStatisticalResults,
  howToWriteAThesisStatement,
  howToWriteAnIntroduction,
  howToWriteAConclusion,
];

export const ALL_RESOURCES: Resource[] = GUIDE_LIST;

export const RESOURCE_BY_SLUG = new Map(ALL_RESOURCES.map((r) => [r.slug, r]));

export const FEATURED_RESOURCES = ALL_RESOURCES.filter((r) => r.featured);

export const CATEGORY_BY_SLUG = new Map(RESOURCE_CATEGORIES.map((c) => [c.slug, c]));

export function resourcePath(resource: Pick<Resource, "slug" | "category">): string {
  return `/resources/${resource.category}/${resource.slug}`;
}

export function guidesByCategory(category: string): Resource[] {
  return ALL_RESOURCES.filter((r) => r.category === category);
}

export function getResource(category: string, slug: string): Resource | undefined {
  const resource = RESOURCE_BY_SLUG.get(slug);
  return resource && resource.category === category ? resource : undefined;
}

export function relatedResources(resource: Resource): Resource[] {
  return resource.related
    .map((rel) => RESOURCE_BY_SLUG.get(rel.slug))
    .filter((r): r is Resource => Boolean(r));
}