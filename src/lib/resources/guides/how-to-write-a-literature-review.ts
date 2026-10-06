import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-write-a-literature-review",
  category: "research",
  title: "How to Write a Literature Review",
  h1: "How to Write a Literature Review",
  seoTitle: "How to Write a Literature Review | Acadivo",
  description:
    "How to write a literature review: searching the field, organising sources thematically, writing a critical synthesis rather than a summary, and structuring your critique.",
  ogDescription:
    "A method for reviewing a field: search strategies, thematic organisation, critical synthesis, and the structure of a literature review chapter.",
  readingMinutes: 4,
  featured: true,
  intro: [
    "A literature review shows what is already known about a topic, what is debated, and where the gap your research will address sits. It is not a list of summaries, and it is not a search-results dump.",
    "The hardest skill is synthesis: grouping sources by idea rather than by author, and comparing them instead of describing them one after another. This guide covers searching, organising, structuring, and writing.",
  ],
  sections: [
    {
      heading: "What a Literature Review Does",
      blocks: [
        {
          t: "ul",
          v: [
            "Establishes the current state of knowledge on your topic.",
            "Identifies disagreements, limitations, and unanswered questions.",
            "Justifies your research question by showing the gap.",
            "Positions your methodology against what others have used.",
          ],
        },
        {
          t: "p",
          v: "As a standalone assignment it is usually asked for as a critical review of a specific body of literature. As a chapter it must feed directly into the methodology and discussion that follow.",
        },
      ],
      links: [{ label: "How to write a strong thesis statement", slug: "how-to-write-a-thesis-statement" }],
    },
    {
      heading: "Searching the Literature",
      blocks: [
        {
          t: "ol",
          v: [
            "Start with a recent review article or systematic review on your topic. It gives you the field's map and its vocabulary.",
            "Mine its reference list — this is the fastest way to find the works your subject actually treats as important.",
            "Use each key author's name to search backward (their older work) and forward (who has cited them recently).",
            "Search databases appropriate to your discipline, using controlled keywords and subject-specific terms rather than plain language.",
            "Record every search you run, with terms, database, date, and results. Some courses require this as part of your method.",
          ],
        },
        {
          t: "note",
          title: "Include grey literature",
          v: "Government reports, institutional publications, and working papers often contain the most recent findings and are frequently missed if you search only peer-reviewed journals. Use them critically — they have not been peer reviewed.",
        },
      ],
    },
    {
      heading: "Organising Sources",
      blocks: [
        {
          t: "p",
          v: "The most common structural error is organising by author or by date, which produces a sequence of summaries: Smith says this. Jones says that. The result tells the reader nothing about the ideas.",
        },
        {
          t: "p",
          v: "Organise thematically instead. Group sources by the claim, approach, or finding they share, then use within-group comparison. A matrix helps:",
        },
        {
          t: "table",
          head: ["Study", "Method", "Sample / data", "Key finding", "Limitation"],
          rows: [
            ["Ahmed 2021", "Survey", "n = 240 students", "Moderate positive correlation", "Self-reported data; single institution"],
            ["Bianchi 2022", "Meta-analysis", "18 studies", "Effect smaller than 2021 estimate", "High heterogeneity between studies"],
            ["Chen 2023", "Longitudinal", "n = 90, 3 years", "Effect not sustained", "Attrition of 22%"],
          ],
        },
        {
          t: "p",
          v: "Once grouped this way, the review writes itself: what the studies agree on, where they conflict, why they differ, and what is still unknown.",
        },
      ],
    },
    {
      heading: "Synthesis vs Summary",
      blocks: [
        {
          t: "p",
          v: "Summary restates one source. Synthesis relates several sources to each other and draws a conclusion none of them states alone.",
        },
        {
          t: "example",
          label: "Summary",
          v: [
            "\"Ahmed (2021) surveyed 240 students and found a moderate positive correlation between X and Y.\"",
          ],
        },
        {
          t: "example",
          label: "Synthesis",
          v: [
            "\"Ahmed's moderate correlation is not supported by the wider evidence: Bianchi's meta-analysis of 18 studies estimates a smaller effect, and Chen's longitudinal data suggests the relationship decays within two years. The discrepancy appears to track study design rather than population — cross-sectional work consistently overstates effects here, because it cannot separate causation from selection.\"",
          ],
        },
        {
          t: "p",
          v: "The second version advances the reader's understanding. That is what a review is for.",
        },
      ],
    },
    {
      heading: "Evaluating Sources",
      blocks: [
        {
          t: "ul",
          v: [
            "Method appropriate to the question? Correlational data cannot establish causation.",
            "Sample size, representativeness, and recruitment.",
            "Recency — matters more in fast-moving fields than in foundational ones.",
            "Peer review status, and whether claims exceed what the data support.",
            "Who funded the work, and whether that shapes the questions asked.",
          ],
        },
        {
          t: "p",
          v: "Be fair. Critique limitations to show how the study should be read, not to dismiss work you did not need.",
        },
      ],
    },
    {
      heading: "Structure",
      blocks: [
        {
          t: "ol",
          v: [
            "Introduction — scope: what field, what period, what question.",
            "Thematic sections — organised by idea, debate, or approach.",
            "Synthesis section — agreements, contradictions, and why they exist.",
            "Gaps and critique — what is missing, methodologically or theoretically.",
            "Conclusion — what your review establishes and what it leads to.",
          ],
        },
        {
          t: "p",
          v: "Keep the conclusion brief. Its job is to hand over to the rest of the paper, not to argue a new case.",
        },
      ],
    },
    {
      heading: "Common Mistakes",
      blocks: [
        {
          t: "ul",
          v: [
            "One paragraph per author, in date order.",
            "Describing what a study says with no evaluation.",
            "Listing reviews instead of reading primary sources.",
            "Searching only one database, or only Google Scholar.",
            "Citing secondary sources when the original is available.",
            "A gap you have not actually demonstrated — make sure the literature genuinely has not answered your question.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Organise by theme, not by author or year.",
    "Synthesis compares sources and explains disagreements; summary just restates.",
    "Start from review articles, then mine their reference lists.",
    "End with gaps that your own research genuinely addresses.",
  ],
  checklist: [
    "My scope and time period are stated clearly",
    "I searched more than one database, or justified why one was sufficient",
    "I read primary sources where available, not only summaries",
    "Sources are grouped by theme or debate",
    "I compare sources rather than describing them sequentially",
    "I evaluated methods and limitations, not just conclusions",
    "Grey literature was considered where relevant",
    "My stated gap is genuinely unaddressed in the literature",
    "Citations and reference list are complete",
  ],
  mistakes: [
    "Structuring by author, producing a list of summaries.",
    "Treating every source as equally reliable.",
    "Citing a review when the primary study is available.",
    "Claiming a gap without searching thoroughly for it.",
    "Using only sources you could access freely.",
    "Failing to distinguish correlation from causation in your synthesis.",
  ],
  related: [
    { slug: "how-to-write-a-research-paper", label: "How to Write a Research Paper" },
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
    { slug: "how-to-write-a-report", label: "How to Write a Report: Structure, Format & Examples" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "psychology", label: "Psychology" },
    { slug: "sociology", label: "Sociology" },
    { slug: "nursing", label: "Nursing" },
  ],
  service: {
    title: "Reviewing a large amount of literature?",
    body: "Find a helper to help you organise sources, build a synthesis, and structure the review.",
    cta: "Find a Literature Review Helper",
    href: "/browse-helpers",
  },
};

export default guide;