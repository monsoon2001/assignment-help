import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-write-a-case-study",
  category: "research",
  title: "How to Write a Case Study: A Step-by-Step Guide",
  h1: "How to Write a Case Study: A Step-by-Step Guide",
  seoTitle: "How to Write a Case Study: Step-by-Step Guide | Acadibo",
  description:
    "How to write a case study: choosing a case, gathering evidence, applying analytical frameworks, and structuring the write-up so the analysis drives the narrative.",
  ogDescription:
    "A method for case study writing, with common analytical frameworks and the structuring habits that separate analysis from description.",
  readingMinutes: 4,
  intro: [
    "A case study examines one real situation in depth. Its value is in the detail: the specific context, the decisions taken, the constraints, and the outcomes. Its difficulty is that depth easily becomes a chronological list of events.",
    "This guide covers selecting a case, structuring the write-up, and using a framework so that your analysis rather than your narration carries the piece.",
  ],
  sections: [
    {
      heading: "What a Case Study Is For",
      blocks: [
        {
          t: "p",
          v: "Case studies are used to illustrate how something works in practice, to test theory against reality, to explore a case that is genuinely unusual or under-studied, and to explain the process behind an outcome.",
        },
        {
          t: "p",
          v: "Be clear which one you are doing. \"Illustrate a process\" and \"test a theory\" call for different structures and different evidence.",
        },
      ],
    },
    {
      heading: "Choosing a Case",
      blocks: [
        {
          t: "ul",
          v: [
            "Relevance — it must connect to your research question or module learning outcomes.",
            "Information availability — can you actually access people, documents, or data?",
            "Boundaries — you need a defined context, not a sprawling organisation or a fifty-year history.",
            "Informative rather than typical, unless your aim is generalisation.",
          ],
        },
        {
          t: "p",
          v: "State your case selection explicitly. Explaining why you chose this case, and what it lets you see, is part of the method — not an aside.",
        },
      ],
    },
    {
      heading: "Gathering Evidence",
      blocks: [
        {
          t: "ul",
          v: [
            "Documents: reports, policy documents, budgets, correspondence, existing evaluations.",
            "Data: operational figures, performance metrics, survey responses.",
            "Interviews: with decision-makers, staff, and users, if your method permits.",
            "Observation: for process studies.",
          ],
        },
        {
          t: "p",
          v: "Record sources as you go, with dates and provenance. For interviews, note the role rather than the name if anonymity is required, and keep consent records. Treat anything you will quote or attribute with care, and follow your institution's data-protection expectations.",
        },
      ],
      links: [{ label: "How to create an academic reference list", slug: "how-to-cite-sources" }],
    },
    {
      heading: "Use an Analytical Framework",
      blocks: [
        {
          t: "p",
          v: "A framework is the lens you apply to your evidence. It is what turns a description into an analysis. Common choices include:",
        },
        {
          t: "ul",
          v: [
            "SWOT — strengths, weaknesses, opportunities, threats, for organisational or strategic cases.",
            "Porter's Five Forces — industry structure and competitive pressure.",
            "PESTLE — political, economic, social, technological, legal, environmental factors.",
            "Change management models (Lewin, Kotter) — for implementation cases.",
            "Clinical or policy frameworks — where your discipline has established ones.",
          ],
        },
        {
          t: "p",
          v: "Choose the framework your assignment expects, or justify your choice. Applying several frameworks superficially is worse than one applied thoroughly.",
        },
      ],
    },
    {
      heading: "Structure",
      blocks: [
        {
          t: "ol",
          v: [
            "Introduction — the situation, the question, and why this case matters.",
            "Background — enough context to understand the case: organisation, sector, timescale.",
            "Method — how you gathered and analysed the evidence, and any limitations.",
            "Findings — what happened and what the evidence shows, organised by theme.",
            "Analysis — the framework applied, and what it reveals.",
            "Conclusion — what this case demonstrates and what it cannot support.",
            "Recommendations — if the brief asks for them.",
          ],
        },
        {
          t: "p",
          v: "Organise the findings and analysis thematically rather than strictly by date. A timeline is usually useful as one dimension, but as the only structure it produces description rather than analysis.",
        },
      ],
    },
    {
      heading: "Analysis Versus Description",
      blocks: [
        {
          t: "example",
          label: "Description",
          v: ["\"In March the team introduced a new triage system. By June waiting times had fallen from 14 to 9 minutes.\""],
        },
        {
          t: "example",
          label: "Analysis",
          v: [
            "\"Waiting times fell by 36% after triage was introduced, but the change did not come from the triage rules themselves. Staff interviews indicate the improvement largely reflects a backlog cleared in the first month; post-June data shows times plateauing at 9 minutes. The system changed who was prioritised, not how quickly anyone was seen — which is why satisfaction rose while throughput gains stalled.\"",
          ],
        },
        {
          t: "p",
          v: "The second version explains the mechanism, connects the parts, and states what the evidence cannot establish.",
        },
      ],
    },
    {
      heading: "Limitations",
      blocks: [
        {
          t: "ul",
          v: [
            "One case cannot support statistical generalisation — say what it can support instead (illustration, mechanism, plausibility).",
            "Access constraints limit who you could interview and which documents you saw.",
            "Respondent accounts may be shaped by what they expected you to want to hear.",
            "Timing effects, and anything that changed mid-study.",
          ],
        },
      ],
    },
    {
      heading: "Common Mistakes",
      blocks: [
        {
          t: "ul",
          v: [
            "Writing it as a narrative story rather than an analysis.",
            "Applying a framework in name only — headings filled with description.",
            "No stated method for how the evidence was gathered.",
            "Over-claiming from a single case.",
            "Unattributed quotations, and identifying individuals where consent was not given.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Choose a case for its information value, and justify the choice.",
    "Use one analytical framework and apply it thoroughly.",
    "Organise thematically, not as a timeline.",
    "State what a single case can and cannot support.",
  ],
  checklist: [
    "I explained why I selected this case",
    "The boundaries of the case are clear",
    "My method for gathering evidence is stated",
    "I used an appropriate analytical framework",
    "My findings are organised thematically",
    "My analysis explains rather than describes",
    "Sources and quotations are cited",
    "Limitations and confidentiality concerns are addressed",
  ],
  mistakes: [
    "Telling the story chronologically and calling it analysis.",
    "Listing a framework without applying it.",
    "Omitting the method section entirely.",
    "Generalising from one case to a population.",
    "Including identifiable detail without consent.",
    "Presenting opinion as if it were a finding.",
  ],
  related: [
    { slug: "how-to-write-a-report", label: "How to Write a Report: Structure, Format & Examples" },
    { slug: "how-to-write-a-literature-review", label: "How to Write a Literature Review" },
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
  ],
  subjects: [
    { slug: "business-studies", label: "Business Studies" },
    { slug: "nursing", label: "Nursing" },
    { slug: "sociology", label: "Sociology" },
    { slug: "psychology", label: "Psychology" },
  ],
  service: {
    title: "Analysing a complex case?",
    body: "Find a helper to work through your framework, evidence, and analysis with you.",
    cta: "Find a Case Study Helper",
    href: "/browse-helpers",
  },
};

export default guide;