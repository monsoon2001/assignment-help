import type { Resource } from "../types";

const guide: Resource = {
  slug: "mla-citation-guide",
  category: "citations",
  title: "MLA Citation Guide: In-Text Citations & Works Cited",
  h1: "MLA Citation Guide: In-Text Citations & Works Cited",
  seoTitle: "MLA Citation Guide: In-Text Citations & Works Cited | Acadibo",
  description:
    "An MLA 9th edition citation guide: parenthetical citations, Works Cited entries for books, articles, and websites, and how to cite with page numbers.",
  ogDescription:
    "MLA 9th edition in-text citations and Works Cited entries for books, journals, and web sources, plus the container and access-date rules.",
  readingMinutes: 3,
  intro: [
    "MLA 9th edition is used mainly in the humanities — English, history, philosophy, and languages. Where APA leads with author and date, MLA leads with author and page, and its reference list is called Works Cited.",
    "This guide covers the citation forms you will use most and the details students most often get wrong, particularly the idea of a \"container.\"",
  ],
  sections: [
    {
      heading: "In-Text Citations",
      blocks: [
        {
          t: "p",
          v: "MLA uses author and page. When your source has no pagination — most webpages — use only the author, or the title if there is no author.",
        },
        {
          t: "table",
          head: ["Source situation", "MLA 9th edition form"],
          rows: [
            ["One author", "(Turing 440)"],
            ["Two authors", "(Ahmed and Bianchi 112)"],
            ["Three or more authors", "(Ahmed et al. 112)"],
            ["Two works by the same author", "(Turing 440, 442) or (440, 442)"],
            ["Two authors, same surname", "(A. Ahmed 112) and (B. Ahmed 44)"],
            ["No author, use title", "(\"Global Health Estimates\")"],
            ["No author and no page", "(\"Global Health Estimates\") — cite the whole source"],
            ["Corporate author", "(World Health Organization)"],
          ],
        },
        {
          t: "p",
          v: "Note that MLA uses \"and\" in parenthetical citations, not the ampersand that APA requires.",
        },
      ],
      links: [{ label: "How to cite sources in academic writing", slug: "how-to-cite-sources" }],
    },
    {
      heading: "Understanding Containers",
      blocks: [
        {
          t: "p",
          v: "This is the core concept in MLA 9th. A work is often contained inside a larger work — a quotation sits inside an article, the article sits inside a journal, the journal sits inside a database. MLA expects you to name each container.",
        },
        {
          t: "example",
          label: "Three containers",
          v: [
            "Quotation from a book → book → your source.",
            "Article → academic journal → database or library.",
            "Video → website → YouTube.",
          ],
        },
      ],
    },
    {
      heading: "Works Cited Entry: Book",
      blocks: [
        {
          t: "p",
          v: "Structure: Author Last, First. Title of Book in Title Case. Publisher, Year.",
        },
        {
          t: "example",
          label: "Example",
          v: [
            "Turing, Alan M. Computing Machinery and Intelligence. Mind, vol. LIX, no. 236, 1950, pp. 433–60. Oxford UP, 1951.",
          ],
        },
        {
          t: "ul",
          v: [
            "Titles in title case, italicised.",
            "A reprint shows both the original publication details and the reprint publisher and year.",
            "Three or more contributors are listed with \"et al.\"",
          ],
        },
      ],
    },
    {
      heading: "Works Cited Entry: Journal Article",
      blocks: [
        {
          t: "p",
          v: "Structure: Author Last, First. \"Title of Article.\" Title of Journal, vol. X, no. Y, Year, pp. ZZ–ZZ. Database or DOI.",
        },
        {
          t: "example",
          label: "Example",
          v: [
            "Ahmed, Nadia, and Luca Bianchi. \"Retrieval Practice and Student Retention: A Meta-Analysis.\" Journal of Educational Psychology, vol. 114, no. 3, 2022, pp. 412–29. doi:10.1037/edu0001234.",
          ],
        },
        {
          t: "p",
          v: "The article title is in quotation marks, not italics. The journal title is italicised. Volumes are abbreviated: vol. 114, no. 3.",
        },
      ],
    },
    {
      heading: "Works Cited Entry: Webpage",
      blocks: [
        {
          t: "example",
          label: "Example",
          v: [
            "\"Global Health Estimates.\" World Health Organization, 15 Mar. 2021, www.who.int/data/gho. Accessed 4 Oct. 2026.",
          ],
        },
        {
          t: "ul",
          v: [
            "The access date is optional for a stable source, and MLA recommends it for content likely to change without a date.",
            "The site name is usually the final container — include it unless it is the same as the author.",
            "Begin the entry with a descriptive title in quotation marks if there is no author.",
          ],
        },
      ],
    },
    {
      heading: "Titles and Capitalisation",
      blocks: [
        {
          t: "p",
          v: "MLA capitalises the first and last words of a title, every noun, pronoun, adjective, verb, and adverb, but not articles, coordinating conjunctions, or prepositions — unless they begin or end the title or follow a colon.",
        },
        {
          t: "example",
          label: "Examples",
          v: [
            "\"The Causal Structure of Adolescent Peer Influence\" — capitalise Causal, Structure, Adolescent, Peer, Influence.",
            "\"Writing at the Edge: A Study of Student Stress\" — capitalise Writing at the Edge because \"the\" follows the colon.",
            "\"A History of the Modern World\" — \"of\" and \"the\" are lowercase in the middle.",
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
            "Using an ampersand instead of \"and\" in parenthetical citations.",
            "Confusing a Works Cited entry with a footnote.",
            "Citing a container but not the author, or vice versa.",
            "Omitting page numbers for sources that have them.",
            "Using title case rules incorrectly on short prepositions like \"to\" and \"of\".",
            "Keeping URLs with \"https://\" when MLA prefers the clean form.",
          ],
        },
      ],
    },
    {
      heading: "MLA vs APA at a Glance",
      blocks: [
        {
          t: "table",
          head: ["", "MLA 9th", "APA 7th"],
          rows: [
            ["In-text", "(Turing 440)", "(Turing, 1950, p. 440)"],
            ["Two authors", "(Ahmed and Bianchi 112)", "(Ahmed & Bianchi, 2022)"],
            ["List title", "Works Cited", "References"],
            ["Title case", "Title case", "Sentence case"],
            ["Date", "Accessed date often included", "Publication date only"],
            ["Used in", "Humanities", "Social and natural sciences"],
          ],
        },
      ],
      links: [{ label: "APA citation guide", slug: "apa-citation-guide" }],
    },
  ],
  takeaways: [
    "MLA uses author and page in text, with \"and\" rather than an ampersand.",
    "Identify each container: work, then the larger work holding it.",
    "Titles use title case; article titles go in quotation marks.",
    "MLA is used mainly in the humanities, APA in the social and natural sciences.",
  ],
  checklist: [
    "My course specifies MLA 9th edition",
    "Parenthetical citations include page numbers where available",
    "Works Cited entries are in title case",
    "Article titles are in quotation marks, journal titles italicised",
    "Containers are named for online sources",
    "Authors with the same surname are disambiguated",
    "Access dates are included where content may change",
    "Works Cited is alphabetised and unnumbered",
  ],
  mistakes: [
    "Using \"&\" in parenthetical citations.",
    "Italicising article titles instead of container titles.",
    "Omitting page numbers for a paginated source.",
    "Using sentence case where MLA requires title case.",
    "Leaving out the container for a web or database source.",
    "Numbering the Works Cited entries.",
  ],
  related: [
    { slug: "apa-citation-guide", label: "APA Citation Guide" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
    { slug: "how-to-avoid-plagiarism", label: "How to Avoid Plagiarism in Academic Writing" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
  ],
  subjects: [
    { slug: "english-literature", label: "English Literature" },
    { slug: "history", label: "History" },
    { slug: "philosophy", label: "Philosophy" },
  ],
  service: {
    title: "Working on an MLA assignment?",
    body: "Find a helper to check your Works Cited entries and in-text citations against your style guide.",
    cta: "Find a Citation Helper",
    href: "/browse-helpers",
  },
};

export default guide;