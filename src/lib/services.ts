export type ServiceItem = {
  slug: string;
  name: string;
  desc: string;
};

export type ServiceGroup = {
  id: string;
  title: string;
  icon: string;
  description: string;
  services: ServiceItem[];
};

// Single source of truth for /services and the header mega-menu, so the
// navbar can never drift from the page it mirrors.
export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: "writing-editing",
    title: "Writing & Editing",
    icon: "edit_note",
    description: "Guided support for drafting, polishing, and structuring written work across subjects.",
    services: [
      { slug: "essay-writing", name: "Essay Writing", desc: "Thesis-driven essays guided from outline to final draft — structure, argument, and clarity." },
      { slug: "report-writing", name: "Report Writing", desc: "Well-organized academic, lab, and business reports with clear sections and findings." },
      { slug: "proofreading", name: "Proofreading", desc: "Correction of grammar, spelling, punctuation, and sentence flow before you submit." },
      { slug: "editing", name: "Editing", desc: "Deeper revision of clarity, tone, structure, and the strength of your argument." },
      { slug: "paraphrasing", name: "Paraphrasing", desc: "Rewriting content into your own words while keeping the meaning intact and avoiding plagiarism." },
      { slug: "mla-apa-formatting", name: "MLA & APA Formatting", desc: "Proper formatting and citation style applied consistently across your document." },
      { slug: "citation-referencing", name: "Citation & Referencing", desc: "Accurate in-text citations and reference lists in MLA, APA, Chicago, Harvard, or IEEE." },
    ],
  },
  {
    id: "research-advanced-projects",
    title: "Research & Advanced Projects",
    icon: "menu_book",
    description: "Long-form and research-heavy projects, guided chapter by chapter.",
    services: [
      { slug: "thesis-dissertation", name: "Thesis & Dissertation", desc: "Chapter-by-chapter guidance for structure, argument, and academic writing." },
      { slug: "case-study", name: "Case Study", desc: "Analysis and write-up of real-world scenarios with frameworks and evidence." },
      { slug: "literature-review", name: "Literature Review", desc: "Synthesizing sources into a coherent, critical review of the field." },
      { slug: "research-proposal", name: "Research Proposal", desc: "Framing aims, research questions, and methodology for approval." },
      { slug: "lab-report", name: "Lab Report", desc: "Scientific write-ups — methods, results, analysis, and discussion." },
    ],
  },
  {
    id: "technical-data-help",
    title: "Technical & Data Help",
    icon: "functions",
    description: "Support for quantitative coursework and technical assignments.",
    services: [
      { slug: "math-statistics-help", name: "Math & Statistics Help", desc: "Problem solving, derivations, and statistical analysis explained step by step." },
      { slug: "programming-help", name: "Programming Help", desc: "Guidance on algorithms, projects, and debugging across languages." },
      { slug: "data-analysis", name: "Data Analysis", desc: "Analysis and visualization using Excel, SPSS, R, or Python." },
    ],
  },
  {
    id: "career-presentation",
    title: "Career & Presentation",
    icon: "business_center",
    description: "Positioning support for applications, plans, and presentations.",
    services: [
      { slug: "business-plan", name: "Business Plan", desc: "Structuring plans with market analysis, financials, and a clear strategy." },
      { slug: "personal-statement", name: "Personal Statement", desc: "Admission and application essays that tell your story effectively." },
      { slug: "presentation-slides", name: "Presentation & Slides", desc: "Deck design and narrative structure for confident presentations." },
    ],
  },
];

export const GUIDE_BY_SERVICE: Record<string, string> = {
  "Essay Writing": "/resources/writing/how-to-write-an-essay",
  "Report Writing": "/resources/research/how-to-write-a-report",
  Proofreading: "/resources/writing/how-to-proofread-an-essay",
  Editing: "/resources/writing/how-to-write-a-conclusion",
  Paraphrasing: "/resources/writing/how-to-paraphrase",
  "MLA & APA Formatting": "/resources/citations/mla-citation-guide",
  "Citation & Referencing": "/resources/citations/how-to-cite-sources",
  "Thesis & Dissertation": "/resources/projects/how-to-write-a-research-paper",
  "Case Study": "/resources/research/how-to-write-a-case-study",
  "Literature Review": "/resources/research/how-to-write-a-literature-review",
  "Research Proposal": "/resources/projects/how-to-write-a-research-paper",
  "Lab Report": "/resources/research/how-to-write-a-lab-report",
  "Math & Statistics Help": "/resources/technical/how-to-analyze-data",
  "Programming Help": "/resources/technical/how-to-approach-a-programming-assignment",
  "Data Analysis": "/resources/technical/how-to-analyze-data",
  "Personal Statement": "/resources/presentations/how-to-write-a-personal-statement",
  "Presentation & Slides": "/resources/presentations/how-to-make-a-presentation",
};

export type ServicePage = ServiceItem & { group: ServiceGroup };

/** Every service that gets its own page under /services/<slug>. */
export const SERVICE_PAGES: ServicePage[] = SERVICE_GROUPS.flatMap((group) =>
  group.services.map((service) => ({ ...service, group })),
);

export function getServicePage(slug: string): ServicePage | undefined {
  return SERVICE_PAGES.find((service) => service.slug === slug);
}
