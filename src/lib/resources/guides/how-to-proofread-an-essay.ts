import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-proofread-an-essay",
  category: "writing",
  title: "How to Proofread an Essay Before Submission",
  h1: "How to Proofread an Essay Before Submission",
  seoTitle: "How to Proofread an Essay Before Submission | Acadibo",
  description:
    "A practical proofreading method for essays: how to proofread in separate passes, what to check at each stage, and how to catch errors that reading normally hides.",
  ogDescription:
    "Why proofreading works in separate passes, and the concrete checklist for structure, sentences, and mechanics.",
  readingMinutes: 3,
  intro: [
    "Proofreading is a distinct task from writing, and it fails when you try to do both at once. While you are focused on getting an argument onto the page, your brain skips over the errors it is not looking for.",
    "This guide sets out a multi-pass method, from checking structure down to commas, and explains the two changes that catch the most missed errors: changing format and reading aloud.",
  ],
  sections: [
    {
      heading: "Why One Read Is Not Enough",
      blocks: [
        {
          t: "p",
          v: "Reading your own writing, you remember what you meant and supply the missing words automatically. That is why a missing \"the\" or an entire dropped clause can survive three rereads.",
        },
        {
          t: "p",
          v: "The fix is to separate passes and know what each one is looking for. If a pass is only hunting commas, you will not see a structural problem — and that is fine, because a later pass handles it.",
        },
      ],
    },
    {
      heading: "Pass 1: Instructions and Structure",
      blocks: [
        {
          t: "checklist",
          v: [
            "Re-read the assignment question and rubric, side by side with your essay.",
            "Confirm every requirement is met — length, required sections, number of sources, citation style.",
            "Read only the first sentence of each paragraph in order. Do they sketch a coherent argument?",
            "Read only the last sentence of each paragraph. Do they connect to what follows?",
            "Check your thesis is still the essay's actual argument and not a stronger claim than you support.",
          ],
        },
      ],
    },
    {
      heading: "Pass 2: Paragraphs and Sentences",
      blocks: [
        {
          t: "ul",
          v: [
            "Does each paragraph have one clear job?",
            "Does each paragraph contain its own point, not just description?",
            "Are sentences varying in length? Three similar-length sentences in a row reads as monotonous.",
            "Are there fragments missing a verb, or run-ons with two independent clauses joined by a comma?",
            "Is the argument visible, or have you only summarised?",
          ],
        },
        {
          t: "p",
          v: "Vary sentence openings too. Beginning five consecutive sentences with \"This\" or \"The\" is a common and easily fixed problem.",
        },
      ],
      links: [{ label: "How to write an essay: a step-by-step guide", slug: "how-to-write-an-essay" }],
    },
    {
      heading: "Pass 3: References and Citations",
      blocks: [
        {
          t: "checklist",
          v: [
            "Every in-text citation appears in the reference list, and every reference is cited in the text.",
            "All entries follow the required style consistently.",
            "Author names, years, and titles are spelled correctly against the original source.",
            "Page numbers are included where the style requires them.",
            "Quotations are exact and marked as quotations.",
          ],
        },
      ],
      links: [{ label: "How to create an academic reference list", slug: "how-to-cite-sources" }],
    },
    {
      heading: "Pass 4: Sentences and Mechanics",
      blocks: [
        {
          t: "ul",
          v: [
            "Subject–verb agreement, especially with singular subjects and intervening phrases.",
            "Article errors (a / an / the) — a common and easily missed category in longer sentences.",
            "Tense consistency: present for literature and argument, past for methods and completed actions.",
            "Comma splices, which join two independent clauses with only a comma.",
            "Spelling, including proper nouns and subject-specific terminology.",
          ],
        },
      ],
    },
    {
      heading: "Two Tricks That Find More Errors",
      blocks: [
        {
          t: "ol",
          v: [
            "Change the format. Print it in a different font, at a different size, or with 1.5 line spacing. Familiar layout hides errors; unfamiliar layout exposes them.",
            "Read it aloud. Your ear catches run-ons, missing words, doubled words, and abrupt transitions that your eye slides over.",
          ],
        },
        {
          t: "p",
          v: "For dense technical prose, reading aloud also catches whether sentences are genuinely too long to follow.",
        },
      ],
    },
    {
      heading: "Final Pre-Submission Checklist",
      blocks: [
        {
          t: "checklist",
          v: [
            "File name and format are correct and openable on another device.",
            "Page numbers, margins, font, and line spacing match requirements.",
            "Word count is within range, measured accurately.",
            "Table of contents, figures, and tables are numbered and referenced in the text.",
            "Nothing is left as \"TODO\" or highlighted for attention.",
            "Citations and references cross-check in both directions.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Proofread in separate passes — structure, paragraphs, references, then mechanics.",
    "Change the format and read aloud; both reveal errors that normal rereading hides.",
    "Check citations in both directions: text to list, and list to text.",
  ],
  checklist: [
    "I re-read the assignment requirements and rubric last",
    "Every paragraph has one clear job",
    "My thesis matches what the body actually argues",
    "In-text citations and reference list match exactly",
    "Tense is consistent and purposeful",
    "I checked subject–verb agreement and articles",
    "I read it aloud",
    "File name, format, and word count are correct",
  ],
  mistakes: [
    "Proofreading in one pass while trying to fix everything at once.",
    "Only checking spelling and ignoring structure.",
    "Assuming the reference list matches the citations without checking both ways.",
    "Skipping the rubric because the essay \"feels\" complete.",
    "Leaving placeholder text in a file submitted at midnight.",
    "Editing on screen in a familiar layout until you stop seeing errors.",
  ],
  related: [
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
    { slug: "how-to-write-a-conclusion", label: "How to Write a Strong Essay Conclusion" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
    { slug: "apa-citation-guide", label: "APA Citation Guide" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "english-literature", label: "English Literature" },
  ],
  service: {
    title: "Want a proofreading review?",
    body: "Find a helper who can check grammar, flow, and structure before you hand your work in.",
    cta: "Find a Proofreading Helper",
    href: "/browse-helpers",
  },
};

export default guide;