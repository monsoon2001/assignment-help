import type { Resource } from "../types";

const guide: Resource = {
  slug: "apa-citation-guide",
  category: "citations",
  title: "APA Citation Guide: In-Text Citations & References",
  h1: "APA Citation Guide: In-Text Citations & References",
  seoTitle: "APA Citation Guide: In-Text Citations & References | Acadivo",
  description:
    "A practical APA 7th edition citation guide: in-text citation forms, journal, book, and webpage reference entries, and how to format author names and DOIs.",
  ogDescription:
    "APA 7th edition in-text citations and reference list entries for books, journals, chapters, and webpages, with the formatting rules that cause most mark deductions.",
  readingMinutes: 4,
  intro: [
    "APA 7th edition is used widely across the social sciences, psychology, education, and many science courses. It is an author–date system: your in-text citation gives the author and year, and the reference list gives the full details.",
    "This guide covers the citation forms you will use most, plus the formatting details students most often get wrong. Check whether your course requires APA 7th edition, as some still specify APA 6th.",
  ],
  sections: [
    {
      heading: "In-Text Citations",
      blocks: [
        {
          t: "p",
          v: "Narrative form places the author in your sentence. Parenthetical form places the citation in brackets. Both are acceptable; use one form consistently.",
        },
        {
          t: "table",
          head: ["Source situation", "APA 7th edition form"],
          rows: [
            ["One author, narrative", "Turing (1950) argued that machines can be described."],
            ["One author, parenthetical", "Machines can be described (Turing, 1950)."],
            ["Two authors", "(Ahmed & Bianchi, 2022) or Ahmed and Bianchi (2022)"],
            ["Three or more authors", "(Ahmed et al., 2022) — use et al. from the first citation"],
            ["Page number", "(Ahmed & Bianchi, 2022, p. 44)"],
            ["Direct quotation", "\"the text\" (Turing, 1950, p. 440)"],
            ["Group author", "(World Health Organization [WHO], 2021) first, then (WHO, 2021)"],
            ["Same author, same year", "(Ahmed, 2020a) and (Ahmed, 2020b)"],
            ["Two works, different authors", "(Ahmed, 2020; Bianchi, 2021)"],
          ],
        },
      ],
      links: [{ label: "How to cite sources in academic writing", slug: "how-to-cite-sources" }],
    },
    {
      heading: "Reference Entry: Journal Article",
      blocks: [
        {
          t: "p",
          v: "Structure: Author, A. A., & Author, B. B. (Year). Title of article in sentence case. Journal Name in Title Case, volume(issue), pages. https://doi.org/xxxxx",
        },
        {
          t: "example",
          label: "Example",
          v: [
            "Ahmed, N., & Bianchi, L. (2022). Retrieval practice and student retention: A meta-analysis. Journal of Educational Psychology, 114(3), 412–429. https://doi.org/10.1037/edu0001234",
          ],
        },
        {
          t: "ul",
          v: [
            "Sentence case for article titles; title case for journal names.",
            "Italicise the journal name and the volume number, not the issue number in parentheses.",
            "Include the DOI as a full https:// link if one exists.",
            "List up to 20 authors; with 21 or more, list the first 19, an ellipsis, and the final author.",
          ],
        },
      ],
    },
    {
      heading: "Reference Entry: Book",
      blocks: [
        {
          t: "p",
          v: "Structure: Author, A. A. (Year). Title of work in sentence case (italicised). Publisher.",
        },
        {
          t: "example",
          label: "Example",
          v: [
            "Turing, A. M. (1950). Computing machinery and intelligence. Mind, 59(236), 433–460.",
          ],
        },
        {
          t: "p",
          v: "APA 7th edition no longer requires the publisher's location, and you no longer add \"Retrieved from\" before a URL unless the content is designed to change over time.",
        },
      ],
    },
    {
      heading: "Reference Entry: Chapter in an Edited Book",
      blocks: [
        {
          t: "example",
          label: "Example",
          v: [
            "Chen, R. (2021). Writing the discussion section. In L. Fontaine (Ed.), Academic writing handbook (3rd ed., pp. 145–168). University Press.",
          ],
        },
        {
          t: "p",
          v: "Note the position of the editors: \"In\" comes before them, and the edition and page numbers sit inside the parentheses.",
        },
      ],
    },
    {
      heading: "Reference Entry: Webpage",
      blocks: [
        {
          t: "example",
          label: "Example",
          v: [
            "World Health Organization. (2021, March 15). Global health estimates. https://www.who.int/data/gho",
          ],
        },
        {
          t: "ul",
          v: [
            "Include the date only when the page shows one.",
            "Do not add \"Retrieved from\" unless the page content is designed to change.",
            "If the author is the same as the site owner, omit the site name.",
          ],
        },
      ],
    },
    {
      heading: "Reference Entry: 21 or More Authors",
      blocks: [
        {
          t: "example",
          label: "Example",
          v: [
            "Alvarez, B., Bhatt, C., Chen, D., Dubois, E., Eriksen, F., Fujioka, G., Gupta, H., Hansen, I., Ibrahim, J., Jonsson, K., Kowalski, L., Lindqvist, M., Mensah, N., Novak, O., Oyelaran, P., Park, Q., Rossi, R., Sanchez, T., Tanaka, U., & Vogel, W. (2021). A very large collaborative study of citation practices. Journal of Open Scholarship, 4(2), 55–79.",
          ],
        },
        {
          t: "p",
          v: "APA 7th edition changed this rule: list the first 19 authors, add an ellipsis with no ampersand, then the final author. APA 6th stopped at 7 with an ellipsis — do not use that version.",
        },
      ],
    },
    {
      heading: "Formatting Rules That Cost Marks",
      blocks: [
        {
          t: "checklist",
          v: [
            "Double spacing throughout, including in the reference list.",
            "Hanging indent of 0.5 inch (1.27 cm) on every reference entry.",
            "Alphabetical order by first author surname.",
            "Titles in sentence case; journal and book titles in title case.",
            "Italicised journal titles, volume numbers, and book titles — not article titles.",
            "A DOI or URL for anything online.",
          ],
        },
        {
          t: "p",
          v: "Capitalising correctly is a common source of lost marks. Capitalise the first word, the first word after a colon, and proper nouns only.",
        },
      ],
    },
    {
      heading: "Common Mistakes",
      blocks: [
        {
          t: "ul",
          v: [
            "Using APA 6th author-list rules.",
            "Including \"Retrieved from\" before every URL.",
            "Formatting titles in title case.",
            "Italicising article titles instead of journal titles.",
            "Adding a location for a publisher.",
            "Using the old \"Retrieved from https://doi.org\" form for DOIs.",
            "Citing a source you read only in an abstract.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "APA 7th is author–date; in-text gives author and year, the reference list gives full details.",
    "Use et al. from the first citation for three or more authors.",
    "Sentence case for article titles, title case for journal and book titles.",
    "Include a DOI as a full https:// link where one exists.",
  ],
  checklist: [
    "My course specifies APA 7th edition, not 6th",
    "In-text citations are consistent in form",
    "Journal names and volume numbers are italicised",
    "Article titles are in sentence case",
    "DOIs are included as https:// links",
    "Every reference is cited in the text and vice versa",
    "Hanging indent and double spacing applied",
    "Author lists follow the 19-plus-ellipsis rule where relevant",
  ],
  mistakes: [
    "Using APA 6th conventions for long author lists.",
    "Italicising the article title rather than the journal name.",
    "Writing \"Retrieved from\" before a DOI.",
    "Adding the publisher's city, which APA 7th dropped.",
    "Using title case for article titles.",
    "Citing secondary quotes as if you read the original.",
  ],
  related: [
    { slug: "mla-citation-guide", label: "MLA Citation Guide" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
    { slug: "how-to-avoid-plagiarism", label: "How to Avoid Plagiarism in Academic Writing" },
    { slug: "how-to-proofread-an-essay", label: "How to Proofread an Essay Before Submission" },
  ],
  subjects: [
    { slug: "psychology", label: "Psychology" },
    { slug: "sociology", label: "Sociology" },
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "nursing", label: "Nursing" },
  ],
  service: {
    title: "Need citations formatted correctly?",
    body: "Find a helper to format APA references and in-text citations consistently across your work.",
    cta: "Find a Citation Helper",
    href: "/browse-helpers",
  },
};

export default guide;