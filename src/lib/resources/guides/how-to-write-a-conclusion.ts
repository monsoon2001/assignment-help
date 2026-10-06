import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-write-a-conclusion",
  category: "writing",
  title: "How to Write a Strong Essay Conclusion",
  h1: "How to Write a Strong Essay Conclusion",
  seoTitle: "How to Write a Strong Essay Conclusion | Acadivo",
  description:
    "How to write an essay conclusion that returns to your thesis, shows significance, and avoids introducing new arguments. With examples and a checklist.",
  ogDescription:
    "What a conclusion should and should not do, how to avoid restating your introduction, and a five-sentence structure you can reuse.",
  readingMinutes: 3,
  intro: [
    "The conclusion is the part students treat as an afterthought, and it is the part readers remember. It should not introduce anything new — but it should do more than summarise.",
    "This guide gives you a repeatable structure, shows the difference between a weak and a strong conclusion, and explains how to end without padding.",
  ],
  sections: [
    {
      heading: "What a Conclusion Should Do",
      blocks: [
        {
          t: "ol",
          v: [
            "Return to the argument in new wording — not a copy of your thesis sentence.",
            "Pull together the reasoning that got you there, briefly.",
            "Show significance: what follows if your position is right.",
            "Optionally close with a recommendation or a remaining question.",
          ],
        },
        {
          t: "p",
          v: "Three to five sentences is usually right for a standard essay. Longer conclusions are common in dissertations, where you may summarise findings chapter by chapter.",
        },
      ],
    },
    {
      heading: "Restate, Do Not Repeat",
      blocks: [
        {
          t: "p",
          v: "Restating your thesis word for word tells the reader nothing. Change the wording and sharpen the claim as you close — you have now earned the right to state it more precisely than you could at the start.",
        },
        {
          t: "example",
          label: "Example",
          v: [
            "Introduction: \"This essay argues that remote work improves junior progression.\"",
            "Weak conclusion: \"To conclude, this essay has argued that remote work improves junior progression.\"",
            "Strong conclusion: \"The evidence therefore points in the opposite direction from common assumption: flexibility gains do not translate into progression, because visibility, not hours, drives early promotion.\"",
          ],
        },
      ],
    },
    {
      heading: "Showing Significance",
      blocks: [
        {
          t: "p",
          v: "The most common weakness is a conclusion that stops at summary. One sentence on why the argument matters lifts the whole essay.",
        },
        {
          t: "ul",
          v: [
            "Policy or practice: \"Universities adopting this approach should pair it with X, or the effect will be uneven.\"",
            "Practical consequence: \"For institutions, this means capacity planning must anticipate Y.\"",
            "Limits of your own argument: \"This does not explain Z, which remains open.\"",
          ],
        },
      ],
    },
    {
      heading: "What to Leave Out",
      blocks: [
        {
          t: "ul",
          v: [
            "New evidence or sources introduced here.",
            "New counter-arguments you have not developed.",
            "New topics (\"this essay has also explored...\").",
            "Generic grand statements, rhetorical questions, and \"in conclusion\" openings.",
            "Apologies (\"I know this is not perfect, but...\").",
          ],
        },
      ],
    },
    {
      heading: "A Structure You Can Reuse",
      blocks: [
        {
          t: "example",
          label: "Five-sentence conclusion",
          v: [
            "1. Restate the argument, sharpened. (Not identical to your thesis.)",
            "2. Name the strongest reason that supports it.",
            "3. Acknowledge the main counter-argument and why it does not change your position.",
            "4. State the significance or implication.",
            "5. Optional closing line: a recommendation, or the question that remains.",
          ],
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
            "My opening sentence is a reworded, sharper version of my thesis.",
            "I have not introduced any new evidence or topics.",
            "I have said why the argument matters.",
            "I have acknowledged the strongest opposing view somewhere in the essay.",
            "The last sentence is not a question I have not answered.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Restate your argument in new words, sharpened by what the essay proved.",
    "Add one sentence of significance — the difference between summary and a conclusion.",
    "Never introduce new evidence, topics, or counter-arguments at the end.",
  ],
  checklist: [
    "I return to the thesis in fresh wording",
    "I briefly pull together the main reasoning",
    "I explain why the argument matters",
    "I added no new evidence",
    "My final sentence is decisive, not an unanswered question",
    "It is an appropriate length for the assignment",
  ],
  mistakes: [
    "Copying the introduction word for word.",
    "Adding a new argument in the last paragraph.",
    "Opening with \"In conclusion\" — just start the paragraph.",
    "Ending with a rhetorical question.",
    "Introducing a topic the essay has not covered.",
    "Writing a summary so long it repeats the whole body.",
  ],
  related: [
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
    { slug: "how-to-write-a-thesis-statement", label: "How to Write a Strong Thesis Statement" },
    { slug: "how-to-write-an-introduction", label: "How to Write an Effective Essay Introduction" },
    { slug: "how-to-proofread-an-essay", label: "How to Proofread an Essay Before Submission" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "english-literature", label: "English Literature" },
    { slug: "history", label: "History" },
  ],
  service: {
    title: "Want your conclusion checked?",
    body: "A helper can review whether your closing paragraph genuinely closes the argument or just repeats it.",
    cta: "Find an Essay Helper",
    href: "/browse-helpers",
  },
};

export default guide;