import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-paraphrase",
  category: "writing",
  title: "How to Paraphrase Without Changing the Meaning",
  h1: "How to Paraphrase Without Changing the Meaning",
  seoTitle: "How to Paraphrase Without Changing the Meaning | Acadibo",
  description:
    "Learn how to paraphrase accurately: why it differs from summarising and quoting, how to restructure sentences, and how to avoid accidentally changing the author's meaning.",
  ogDescription:
    "A practical method for paraphrasing that preserves accuracy, with examples showing the errors that change meaning.",
  readingMinutes: 3,
  intro: [
    "Paraphrasing means putting someone else's ideas into your own words and sentence structure while keeping the meaning accurate. It is one of the most-used academic skills and one of the most commonly done badly.",
    "The difficulty is that good paraphrasing is not really about swapping synonyms. It is about rebuilding the idea in a structure your reader finds easier to follow — without changing what the original actually claims.",
  ],
  sections: [
    {
      heading: "Paraphrasing vs Summarising vs Quoting",
      blocks: [
        {
          t: "table",
          head: ["", "Length", "Detail", "Use it when"],
          rows: [
            ["Paraphrase", "Similar to original", "All of it, restated", "You want your own voice and the original's wording will not fit your sentence"],
            ["Summarise", "Much shorter", "Main point only", "The detail is not needed for your argument"],
            ["Quote", "Short", "Exact wording", "You need precise wording, terminology, or wording you are analysing"],
          ],
        },
        {
          t: "p",
          v: "All three still require a citation. Restating an idea in your own words does not remove the obligation to acknowledge the source.",
        },
      ],
      links: [{ label: "How to cite sources in academic writing", slug: "how-to-cite-sources" }],
    },
    {
      heading: "The Two-Move Method",
      blocks: [
        {
          t: "ol",
          v: [
            "Read the original sentence closely and identify its parts: who asserts what, on what basis, with what conditions.",
            "Rebuild it around your own sentence structure — change the grammatical pattern first, then choose words.",
          ],
        },
        {
          t: "p",
          v: "Changing the structure before changing the words is what separates paraphrasing from thesaurus-based word replacement. If the sentence shape stays identical, synonym-swapping tends to produce writing that reads oddly and still resembles the original.",
        },
      ],
    },
    {
      heading: "Worked Example",
      blocks: [
        {
          t: "example",
          label: "Original",
          v: [
            "\"The scarcity of peer-reviewed replication studies means that published effect sizes are likely to be inflated.\"",
          ],
        },
        {
          t: "example",
          label: "Weak paraphrase (structure unchanged)",
          v: [
            "\"Because there are few peer-reviewed replication studies, published effect sizes are likely to be exaggerated.\"",
          ],
        },
        {
          t: "p",
          v: "That version swapped three words and kept the original sentence shape, so it still reads as the same sentence.",
        },
        {
          t: "example",
          label: "Strong paraphrase (restructured)",
          v: [
            "\"With so few peer-reviewed replication studies completed, effect sizes reported in the original publications should be treated as potentially inflated.\"",
          ],
        },
        {
          t: "p",
          v: "Here the subject has changed (effect sizes, not replication studies, lead), the causal link has been converted into a recommendation, and the register is neutral. The claim is preserved: published effect sizes are suspect because replication is rare.",
        },
      ],
    },
    {
      heading: "Watch for Meaning Drift",
      blocks: [
        {
          t: "p",
          v: "The most common error is not plagiarism but inaccuracy. These substitutions quietly change a claim:",
        },
        {
          t: "ul",
          v: [
            "\"may\" → \"will\", which turns a possibility into a certainty.",
            "\"is associated with\" → \"causes\", which claims a causal link the author never made.",
            "\"some\" → \"most\", or \"increases\" → \"increases significantly\", which quantifies without evidence.",
            "\"critics argue\" → \"it is widely believed\", which removes who is claiming it.",
            "\"in two studies\" → \"in studies\", which makes a limited finding sound general.",
          ],
        },
        {
          t: "p",
          v: "If the original hedges, your paraphrase must hedge. Hedges in academic writing are precise, not evasive.",
        },
      ],
    },
    {
      heading: "When to Quote Instead",
      blocks: [
        {
          t: "p",
          v: "Keep the quotation and cite it when:",
        },
        {
          t: "ul",
          v: [
            "You are analysing the wording itself.",
            "The phrasing is precise, distinctive, or technical.",
            "Any paraphrase would be longer and less clear.",
            "You are discussing a specific author's position and need their exact terms.",
          ],
        },
      ],
    },
    {
      heading: "Checklist",
      blocks: [
        {
          t: "checklist",
          v: [
            "I changed the sentence structure, not just the words.",
            "My version is no longer than the original and not more detailed.",
            "The strength of the claim (may / often / most) matches the original.",
            "Any causation in my version is present in the original.",
            "I still attribute the idea to its source.",
            "I have not relied on a thesaurus for whole phrases.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Paraphrase by restructuring the sentence first, then choosing words.",
    "Preserve hedging and causation — that is where paraphrase goes wrong.",
    "Quote when wording precision matters or you are analysing the phrasing.",
    "A paraphrase still needs a citation.",
  ],
  checklist: [
    "I identified the original's core claim before rewriting",
    "My sentence structure differs from the original",
    "I did not change certainty levels",
    "I did not add causation that was not there",
    "I kept attribution to the original author",
    "I checked whether a direct quote would be more appropriate",
  ],
  mistakes: [
    "Swapping synonyms while keeping the sentence shape identical.",
    "Turning \"is associated with\" into \"causes\".",
    "Removing hedging words and making a tentative claim sound certain.",
    "Paraphrasing a quotation and presenting it as the author's exact words.",
    "Forgetting the citation because the words are now different.",
    "Making the paraphrase longer and more detailed than the original.",
  ],
  related: [
    { slug: "how-to-avoid-plagiarism", label: "How to Avoid Plagiarism in Academic Writing" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
    { slug: "how-to-proofread-an-essay", label: "How to Proofread an Essay Before Submission" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "english-literature", label: "English Literature" },
    { slug: "sociology", label: "Sociology" },
  ],
  service: {
    title: "Want your paraphrasing checked?",
    body: "A helper can review whether your restatements stay accurate to the original sources.",
    cta: "Find a Paraphrasing Helper",
    href: "/services/essay-feedback",
  },
};

export default guide;