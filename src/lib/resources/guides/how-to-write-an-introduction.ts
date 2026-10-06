import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-write-an-introduction",
  category: "writing",
  title: "How to Write an Effective Essay Introduction",
  h1: "How to Write an Effective Essay Introduction",
  seoTitle: "How to Write an Effective Essay Introduction | Acadivo",
  description:
    "Learn how to write an essay introduction that hooks the reader, narrows to your topic, and ends with a clear thesis statement. Includes the funnel structure and common mistakes.",
  ogDescription:
    "The funnel structure for essay introductions, what belongs in each paragraph, and how to avoid generic opening lines.",
  readingMinutes: 3,
  intro: [
    "An introduction has three jobs: give the reader a reason to keep reading, set the scene for a specific question, and tell them plainly what you will argue.",
    "This guide breaks the introduction into its parts, shows what to cut, and explains why the most common opening sentences make essays weaker.",
  ],
  sections: [
    {
      heading: "What the Introduction Must Do",
      blocks: [
        {
          t: "ul",
          v: [
            "Move from the general to the specific.",
            "Establish the debate or context your question belongs to.",
            "End with a clear thesis statement.",
          ],
        },
        {
          t: "p",
          v: "The length depends on your task. A five-paragraph essay usually needs one paragraph or one and a half. A research paper introduction may run 400–600 words and include definitions, scope, and a roadmap.",
        },
      ],
    },
    {
      heading: "The Funnel Structure",
      blocks: [
        {
          t: "ol",
          v: [
            "Hook: something specific, surprising, or concrete that gives the reader a stake in the question.",
            "Context: the broader issue or debate, narrowed over one or two sentences.",
            "Problem or gap: what is unresolved, contested, or unaddressed — this is what makes your essay necessary.",
            "Approach: how you will tackle it (briefly, and only if the essay is long enough to need a roadmap).",
            "Thesis: your position in one or two clear sentences.",
          ],
        },
        {
          t: "p",
          v: "The funnel shape matters: broad first, narrow last. Introductions that start narrow and widen, or that stay broad to the end, leave the reader unsure what you are arguing.",
        },
      ],
    },
    {
      heading: "Openings That Work",
      blocks: [
        {
          t: "ul",
          v: [
            "A striking statistic, clearly attributed.",
            "A concrete example or scenario that the question turns on.",
            "A short quotation from a credible source, used as evidence rather than decoration.",
            "A genuine disagreement between two positions in the literature.",
          ],
        },
        {
          t: "example",
          label: "Weak vs strong",
          v: [
            "Weak: \"Since the dawn of human civilisation, writing has been essential.\"",
            "Why it fails: no reader needed the statement, and it delays the topic.",
            "Strong: \"Every university that has moved to online submission has faced the same problem: students submit drafts they have not read.\"",
            "Why it works: specific, arguable-adjacent, immediately relevant.",
          ],
        },
      ],
    },
    {
      heading: "Openings to Avoid",
      blocks: [
        {
          t: "ul",
          v: [
            "Dictionary definitions (\"Webster's dictionary defines...\").",
            "Sweeping claims about society, technology, or \"today's students\".",
            "Asking the reader to think about a question, then answering nothing until the end.",
            "Quotations used for decoration rather than evidence.",
          ],
        },
        {
          t: "p",
          v: "None of these are forbidden by your instructor, but they spend words without earning them, and in a tight word count that is a real cost.",
        },
      ],
    },
    {
      heading: "The Thesis Sentence",
      blocks: [
        {
          t: "p",
          v: "The last sentence or two of the introduction should be your thesis. It should be arguable, specific, and capable of being supported by the evidence you actually have.",
        },
        {
          t: "p",
          v: "In a longer piece you can add a roadmap sentence — \"This essay first examines X, then argues Y, and finally considers Z\" — but only if your essay genuinely follows that order.",
        },
      ],
      links: [{ label: "How to write a strong thesis statement", slug: "how-to-write-a-thesis-statement" }],
    },
    {
      heading: "Checklist",
      blocks: [
        {
          t: "checklist",
          v: [
            "The opening is specific enough to interest someone who does not care about the topic.",
            "Within 100 words I have named the actual question or debate.",
            "I have explained why the question is worth asking.",
            "My thesis is in a sentence a reader could quote back to me.",
            "I have not used any sentence that could open an essay on a different topic.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Funnel structure: hook, context, gap, approach, thesis.",
    "End with an arguable, specific thesis statement.",
    "Avoid dictionary definitions and claims about society in general.",
    "In short essays, every sentence of the introduction must earn its place.",
  ],
  checklist: [
    "I opened with something specific, not a general claim",
    "I named the exact question or debate",
    "I showed why it matters",
    "My thesis appears in the final sentence or two",
    "My introduction matches what my essay actually does",
    "It fits within my word count",
  ],
  mistakes: [
    "Starting with a definition instead of a point.",
    "Making claims about \"modern society\" that you cannot support.",
    "Writing a hook so long it becomes a second introduction.",
    "Delaying the thesis until the second paragraph.",
    "Including a roadmap that does not match the real structure.",
    "Using the essay question as the thesis statement.",
  ],
  related: [
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
    { slug: "how-to-write-a-thesis-statement", label: "How to Write a Strong Thesis Statement" },
    { slug: "how-to-write-a-conclusion", label: "How to Write a Strong Essay Conclusion" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "english-literature", label: "English Literature" },
  ],
  service: {
    title: "Want a second pair of eyes?",
    body: "A helper can review your introduction for clarity, focus, and whether the thesis actually answers the question.",
    cta: "Find an Essay Helper",
    href: "/browse-helpers",
  },
};

export default guide;