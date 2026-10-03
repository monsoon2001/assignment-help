import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-cite-sources",
  category: "citations",
  title: "How to Cite Sources in Academic Writing",
  h1: "How to Cite Sources in Academic Writing",
  seoTitle: "How to Cite Sources in Academic Writing | Acadibo",
  description:
    "When to cite, how to choose between in-text citations and footnotes, how to build a reference list, and how to cite sources you found in a secondary source.",
  ogDescription:
    "The rules for when to cite, how to signal the source in your sentence, and how to avoid the citation mistakes that cost marks.",
  readingMinutes: 4,
  featured: true,
  intro: [
    "Citation serves two purposes: it credits the person whose idea you used, and it lets a reader find and check that idea. Getting it right is mostly about knowing when a claim needs support and which style your course requires.",
    "This guide covers when to cite, the mechanics of in-text citation, how to reference indirect sources, and how to avoid common mistakes.",
  ],
  sections: [
    {
      heading: "When You Need to Cite",
      blocks: [
        {
          t: "p",
          v: "Cite whenever the idea, information, or wording is not yours, or not general knowledge. That covers:",
        },
        {
          t: "ul",
          v: [
            "Someone else's argument, conclusion, or interpretation.",
            "Any statistic, figure, date, or definition you did not produce.",
            "Direct quotations and distinctive phrasings.",
            "Data, images, tables, and charts from any source.",
            "Another author's theory, framework, or terminology.",
            "Facts that a reader could not verify from general knowledge.",
          ],
        },
        {
          t: "p",
          v: "If you are unsure whether to cite, cite. A superfluous citation is a small cost; a missing one can be treated as misappropriation.",
        },
      ],
    },
    {
      heading: "In-Text Citations: Narrative and Parenthetical",
      blocks: [
        {
          t: "p",
          v: "Most styles offer two forms. Narrative citation puts the author in your sentence; parenthetical citation puts the reference in brackets.",
        },
        {
          t: "example",
          label: "APA 7th edition",
          v: [
            "Narrative: Turabian (2018) argues that citation is a form of attribution.",
            "Parenthetical: Citation is a form of attribution (Turabian, 2018).",
            "Multiple authors: (Ahmed & Bianchi, 2022) — or (Ahmed & Bianchi, 2022, p. 44) for a page.",
            "Three or more authors: use et al. from the first citation in APA 7th.",
          ],
        },
        {
          t: "p",
          v: "Use the same form consistently unless you are making a point about a specific author's wording. Read your style guide on this — the required form differs.",
        },
      ],
    },
    {
      heading: "Citation Verbs",
      blocks: [
        {
          t: "p",
          v: "The verb you choose tells the reader how to read the source, and it affects tone. Using \"proves\" for work that only suggests will get your marks cut.",
        },
        {
          t: "table",
          head: ["Strength", "Verbs"],
          rows: [
            ["Strong", "demonstrates, establishes, proves, confirms"],
            ["Neutral", "shows, indicates, finds, suggests, reports"],
            ["Tentative", "suggests, may indicate, appears to, is consistent with"],
            ["Attacking the source", "claims, asserts, argues (often neutral; use critically in disciplines where it implies doubt)"],
            ["Citing", "cites, refers to, quotes"],
          ],
        },
        {
          t: "p",
          v: "\"Argues\" is neutral in most disciplines but implies scepticism in some philosophy and humanities marking schemes. Match your subject's conventions.",
        },
      ],
    },
    {
      heading: "Citing an Indirect Source",
      blocks: [
        {
          t: "p",
          v: "If you have read a claim only as quoted in another work, do not pretend you consulted the original. Cite what you actually read, and make the chain visible.",
        },
        {
          t: "example",
          label: "APA 7th edition",
          v: [
            "\"Green (2019) reports that retrieval practice improves retention by 30–40% (as cited in Ahmed & Bianchi, 2022, p. 112).\"",
            "Then in the reference list: include Ahmed & Bianchi (2022), the work you read. Include Green (2019) only if you have read it.",
          ],
        },
        {
          t: "p",
          v: "In MLA and Chicago, the pattern is similar: cite the source you consulted and name the original author in the prose or a note.",
        },
      ],
    },
    {
      heading: "Building the Reference List",
      blocks: [
        {
          t: "ol",
          v: [
            "Compile entries as you cite, at the moment of use — not afterwards from memory.",
            "Capture full details: all authors, full title, publication or journal name, year, volume, issue, pages, DOI or URL, publisher location where the style requires it.",
            "Enter them into a reference manager (Zotero, Mendeley) or a correctly formatted template from the start.",
            "Cross-check both directions: every in-text citation has an entry, and every entry is cited.",
          ],
        },
        {
          t: "p",
          v: "Most missing-reference problems are capture problems, not formatting problems. Recording the details as you read removes nearly all of them.",
        },
      ],
      links: [{ label: "APA citation guide", slug: "apa-citation-guide" }],
    },
    {
      heading: "Quotations",
      blocks: [
        {
          t: "ul",
          v: [
            "Copy quotations exactly, including internal punctuation and capitalisation.",
            "Cite the page, or the paragraph for sources without page numbers.",
            "Quote sparingly. If you quote more than a sentence or two, introduce it and follow it with analysis.",
            "Do not quote words you could paraphrase more effectively.",
          ],
        },
      ],
      links: [{ label: "How to paraphrase without changing the meaning", slug: "how-to-paraphrase" }],
    },
    {
      heading: "Common Mistakes",
      blocks: [
        {
          t: "ul",
          v: [
            "Mixing two citation styles in one document.",
            "Citing a source you found in a search-result snippet.",
            "Listing references you never cited in the text.",
            "Using \"et al.\" where the style requires all authors.",
            "Changing the original page number instead of citing \"p. 44\" for a reprint.",
            "Copying a reference from a database's export and then reformatting it by hand.",
          ],
        },
      ],
      links: [{ label: "How to avoid plagiarism in academic writing", slug: "how-to-avoid-plagiarism" }],
    },
  ],
  takeaways: [
    "Cite anything that is not yours and not general knowledge.",
    "Choose citation verbs that match how strong the evidence actually is.",
    "For indirect sources, cite what you read and use \"as cited in\".",
    "Capture reference details as you cite, then check the list in both directions.",
  ],
  checklist: [
    "I know which style my course requires and have used it consistently",
    "Every borrowed idea, figure, and quotation has a citation",
    "Direct quotations are exact and include a page number",
    "Citation verbs match the strength of the evidence",
    "Indirect sources use \"as cited in\" correctly",
    "Every in-text citation appears in the reference list",
    "Every reference is cited in the text",
    "All entries follow one style's punctuation and capitalisation rules",
  ],
  mistakes: [
    "Omitting a citation because the idea is widely known.",
    "Citing only what appeared in a search snippet.",
    "Mixing APA and MLA conventions.",
    "Using \"proves\" where the source only suggests.",
    "Including uncited works in the bibliography.",
    "Memorising reference formats instead of using a template or reference manager.",
  ],
  related: [
    { slug: "apa-citation-guide", label: "APA Citation Guide" },
    { slug: "mla-citation-guide", label: "MLA Citation Guide" },
    { slug: "how-to-avoid-plagiarism", label: "How to Avoid Plagiarism in Academic Writing" },
    { slug: "how-to-paraphrase", label: "How to Paraphrase Without Changing the Meaning" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "english-literature", label: "English Literature" },
    { slug: "history", label: "History" },
  ],
  service: {
    title: "Getting your references right?",
    body: "Find a helper to check in-text citations, reference entries, and consistency across your document.",
    cta: "Find a Citation Helper",
    href: "/browse-helpers",
  },
};

export default guide;