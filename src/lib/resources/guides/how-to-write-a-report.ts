import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-write-a-report",
  category: "research",
  title: "How to Write a Report: Structure, Format & Examples",
  h1: "How to Write a Report: Structure, Format & Examples",
  seoTitle: "How to Write a Report: Structure & Format | Acadivo",
  description:
    "Learn the standard structure of an academic report, how it differs from an essay, what each section should contain, and how to format the finished document.",
  ogDescription:
    "The standard report structure section by section, how a report differs from an essay, and a formatting checklist.",
  readingMinutes: 3,
  featured: true,
  intro: [
    "A report presents information for a defined purpose and audience. An essay argues a case. Confusing the two is why so many reports read like long essays, or why an essay submitted in report format loses marks.",
    "This guide covers the standard structure used across most academic and professional reports, what belongs in each section, and how to format the final document.",
  ],
  sections: [
    {
      heading: "Report or Essay?",
      blocks: [
        {
          t: "table",
          head: ["", "Report", "Essay"],
          rows: [
            ["Purpose", "Inform or advise", "Persuade"],
            ["Structure", "Fixed sections with headings", "Flowing argument with few headings"],
            ["Voice", "Impersonal, precise", "Can be more personal"],
            ["Recommendation", "Expected and often required", "Usually absent"],
            ["Tense", "Past for what was done, present for findings", "Mostly present"],
          ],
        },
        {
          t: "p",
          v: "A technical or workplace report almost always ends with a recommendation. If your brief asks the reader to decide something, leaving out the recommendation is the single most common way to lose marks.",
        },
      ],
    },
    {
      heading: "Standard Structure",
      blocks: [
        {
          t: "ol",
          v: [
            "Title page — title, your name, the recipient or module, date. Some institutions want an abstract on this page.",
            "Table of contents — required for anything over roughly 2,000 words. Use automatic heading styles, not manual formatting.",
            "Executive summary or abstract — around 200–300 words, written last, covering the problem, approach, key findings, and recommendation.",
            "Introduction — purpose of the report, scope, and any background the reader needs. Not a history of the topic.",
            "Methodology — how the information was gathered: data, interviews, sources, equipment, timeframe.",
            "Findings / results — the data, organised and presented. Interpretation is minimal here.",
            "Analysis or discussion — what the findings mean, compared against the objectives and against published work.",
            "Conclusion — answers the brief directly.",
            "Recommendations — what you suggest doing, with justification and, where relevant, costs or risks.",
            "Appendices and references.",
          ],
        },
      ],
    },
    {
      heading: "Executive Summary: Write It Last",
      blocks: [
        {
          t: "p",
          v: "Many readers will only read the executive summary, so it has to stand alone. Write it after everything else and keep it factual.",
        },
        {
          t: "example",
          label: "Structure",
          v: [
            "Purpose: one sentence on what the report addresses.",
            "Approach: one sentence on method.",
            "Key findings: two to four sentences, most important first.",
            "Recommendation: one or two sentences.",
          ],
        },
        {
          t: "p",
          v: "Do not include anything in the summary that is not in the report. If you discover a new conclusion while writing the summary, something has gone wrong earlier.",
        },
      ],
    },
    {
      heading: "Present Data Clearly",
      blocks: [
        {
          t: "ul",
          v: [
            "Give every table, figure, and chart a number, a title, and units.",
            "Write a caption sentence under each one stating the main finding, not just what is plotted.",
            "Do not make readers do arithmetic: state totals and differences, not just raw values.",
            "Use consistent decimal places and units throughout.",
            "Reference every table and figure in the text.",
          ],
        },
        {
          t: "p",
          v: "A table of raw results belongs in an appendix; the body should carry only the rows that support your argument.",
        },
      ],
    },
    {
      heading: "Formatting",
      blocks: [
        {
          t: "checklist",
          v: [
            "Font and size match your module or workplace template.",
            "Consistent heading sizes; use built-in heading styles so the contents page generates itself.",
            "Page numbers, ideally in a footer.",
            "Figure and table numbering consistent and referenced.",
            "Margins and line spacing as specified.",
            "References formatted in the required style.",
          ],
        },
        {
          t: "p",
          v: "When in doubt, ask for a template. Formatting requirements are almost always available from your instructor or organisation, and guessing wastes marks.",
        },
      ],
    },
    {
      heading: "Common Mistakes",
      blocks: [
        {
          t: "ul",
          v: [
            "Writing an argument instead of reporting: reports should be more neutral in tone.",
            "Mixing findings with analysis, so it is unclear what the data showed versus what you think it means.",
            "Leaving out the recommendation section.",
            "An introduction that repeats the whole assignment brief back.",
            "Tables and figures that are never referred to in the text.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Reports inform and recommend; essays argue.",
    "Use the standard section order — methodology, findings, analysis, conclusion, recommendations.",
    "Write the executive summary last, once the findings are settled.",
    "Format using built-in heading styles so the contents page and numbering work automatically.",
  ],
  checklist: [
    "I used a template or confirmed the formatting rules",
    "Every required section is present",
    "The executive summary reflects the actual findings",
    "My recommendations follow directly from the analysis",
    "All tables and figures are numbered and referenced in the text",
    "Tense and tone are consistent",
    "Page numbers and references are in place",
  ],
  mistakes: [
    "Writing it as an essay with no recommendation.",
    "Putting analysis in the findings section.",
    "Submitting without a contents page on a longer report.",
    "Using manual spacing and font sizes instead of heading styles.",
    "Including tables the reader must interpret unaided.",
    "Copying the assignment brief into the introduction verbatim.",
  ],
  related: [
    { slug: "how-to-write-a-lab-report", label: "How to Write a Lab Report" },
    { slug: "how-to-write-a-case-study", label: "How to Write a Case Study" },
    { slug: "how-to-write-a-research-paper", label: "How to Write a Research Paper" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "business-studies", label: "Business Studies" },
    { slug: "nursing", label: "Nursing" },
  ],
  service: {
    title: "Need help structuring your report?",
    body: "Find a helper to work through sections, findings, and recommendations with you before you submit.",
    cta: "Find a Report Helper",
    href: "/browse-helpers",
  },
};

export default guide;