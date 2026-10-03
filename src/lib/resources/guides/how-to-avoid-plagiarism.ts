import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-avoid-plagiarism",
  category: "citations",
  title: "How to Avoid Plagiarism in Academic Writing",
  h1: "How to Avoid Plagiarism in Academic Writing",
  seoTitle: "How to Avoid Plagiarism in Academic Writing | Acadibo",
  description:
    "What plagiarism is, the difference from misattribution and poor paraphrasing, and a practical process for citing correctly and keeping track of sources while you write.",
  ogDescription:
    "How plagiarism is defined in academic settings, common forms of accidental plagiarism, and habits that keep your citations accurate.",
  readingMinutes: 4,
  intro: [
    "Plagiarism means presenting another person's work as your own. It is treated seriously because it is an academic integrity matter, and because accurate sourcing is part of the skill your course is assessing.",
    "Most plagiarism is accidental rather than intentional — sources read in a hurry, notes taken without detail, paraphrasing done by swapping words. This guide explains what counts, and the habits that prevent it.",
  ],
  sections: [
    {
      heading: "What Counts as Plagiarism",
      blocks: [
        {
          t: "table",
          head: ["Situation", "Is it plagiarism?", "Why"],
          rows: [
            ["Copying a source's wording without quotation marks or a citation", "Yes", "It presents another author's words as your own"],
            ["Restating an idea in your own words with no citation", "Yes", "The idea itself is still the author's"],
            ["Using a source's data, image, or table without credit", "Yes", "Creative and research output both require attribution"],
            ["Citing a source you did not read", "Yes", "This is misrepresentation, regardless of intent"],
            ["Citing a source found in a search snippet", "Yes", "You cannot vouch for what you have not read"],
            ["Citing an AI tool's output as a source", "Usually yes", "You cannot cite a tool as though it were a source; check your institution's rules on AI use"],
            ["Using your own earlier work without citing it", "Usually yes", "Self-plagiarism is still uncredited reuse"],
            ["Collusion with another student", "Yes", "Submitting joint work as individual work breaks most academic integrity rules"],
          ],
        },
        {
          t: "p",
          v: "Definitions vary by institution. Your module handbook and your university's academic integrity policy are authoritative — this guide is general guidance.",
        },
      ],
    },
    {
      heading: "Plagiarism and Misattribution Are Different",
      blocks: [
        {
          t: "p",
          v: "You have misattributed if your citation points to the wrong author, the wrong year, or a work that does not contain the claim you attribute to it. This happens when you copy a parenthetical reference without checking that the source actually says what you claim.",
        },
        {
          t: "p",
          v: "Both matter. Accurate attribution means the reader can find and verify the source.",
        },
      ],
      links: [{ label: "How to cite sources in academic writing", slug: "how-to-cite-sources" }],
    },
    {
      heading: "Habits That Prevent It",
      blocks: [
        {
          t: "ol",
          v: [
            "Record the source the moment you use it — author, year, title, and the page or paragraph. Recording it later is where errors come from.",
            "Take notes in your own words as you read, and keep direct quotations short and clearly marked as quotations.",
            "Separate your notes from the source's words so that when you draft, you are not copying from a transcription.",
            "Attach the citation while drafting, not in a final pass.",
            "Read back every sentence you did not write and ask: whose idea is this, and where did I get it?",
          ],
        },
        {
          t: "note",
          title: "Use a reference manager",
          v: "Tools like Zotero or Mendeley store the citation data at capture time and generate your in-text citations and bibliography. That eliminates the whole category of misattribution caused by transcribing references by hand.",
        },
      ],
    },
    {
      heading: "Paraphrasing Accurately",
      blocks: [
        {
          t: "p",
          v: "Poor paraphrasing is often treated as an academic integrity concern because it can misrepresent what a source actually says. The safe approach is to restructure the sentence first, preserve the original's certainty and causation, and always keep the citation.",
        },
        {
          t: "ul",
          v: [
            "Do not change \"is associated with\" into \"causes\".",
            "Do not remove hedging — \"may\" and \"suggests\" are part of the claim.",
            "Do not upgrade \"in two small studies\" into a general finding.",
          ],
        },
      ],
      links: [{ label: "How to paraphrase without changing the meaning", slug: "how-to-paraphrase" }],
    },
    {
      heading: "Quotations and Direct Copying",
      blocks: [
        {
          t: "ul",
          v: [
            "Use quotation marks and a citation for exact wording.",
            "Keep quotations short; if you need more than a paragraph, summarise instead and cite.",
            "Follow a quotation with your own analysis, or it looks like decoration.",
            "Check whether your module treats block quotations differently from short ones.",
          ],
        },
      ],
    },
    {
      heading: "On Detection Tools",
      blocks: [
        {
          t: "p",
          v: "Similarity checkers compare your text against other documents and flag overlapping passages. They can detect some uncredited reuse, and they also produce false positives — common phrasing, quotations from course materials, and reference lists all get flagged.",
        },
        {
          t: "p",
          v: "A similarity score is not a verdict on intent, and AI-detection tools in particular are known to misclassify writing by non-native English speakers. Treat any such flag as a prompt to check your citations properly, not as proof of anything. If you receive one, follow your institution's process and ask for the underlying matches.",
        },
        {
          t: "p",
          v: "The reliable fix is not to write differently so that a tool cannot recognise you. It is to cite accurately and to make sure every borrowed idea is credited.",
        },
      ],
    },
    {
      heading: "If You Are Unsure",
      blocks: [
        {
          t: "ul",
          v: [
            "Cite it. A citation for something you did not need to cite is a far smaller problem than an unattributed idea.",
            "Ask your instructor, before the deadline rather than after.",
            "Use your institution's academic integrity guidance as the standard, not general advice from online sources.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Ideas need attribution even in your own words; direct wording needs quotation marks too.",
    "Capture citation details at the moment you use them.",
    "Preserve the original's certainty, causation, and scope when paraphrasing.",
    "Similarity and AI-detection scores are indicators, not verdicts.",
  ],
  checklist: [
    "I recorded full source details as I used each source",
    "Every borrowed idea has a citation",
    "Direct quotations are in quotation marks and cited with a page number",
    "My paraphrases preserve the original's meaning, hedging, and scope",
    "I have cited my own previous work where reuse occurs",
    "I checked that each citation points to a source that actually makes the claim",
    "I know my institution's policy on AI-assisted writing",
    "My reference list contains only sources I cited",
  ],
  mistakes: [
    "Copying a sentence and changing two or three words.",
    "Citing a source found in a search snippet.",
    "Transcribing references by hand at the end.",
    "Leaving out a citation because a paraphrase \"sounds different\".",
    "Using a source's figure without credit.",
    "Attributing a claim to an author who did not make it.",
  ],
  related: [
    { slug: "how-to-paraphrase", label: "How to Paraphrase Without Changing the Meaning" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
    { slug: "apa-citation-guide", label: "APA Citation Guide" },
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "english-literature", label: "English Literature" },
    { slug: "sociology", label: "Sociology" },
  ],
  service: {
    title: "Want an originality review?",
    body: "Find a helper to review your sources and citations before you submit.",
    cta: "Find a Similarity Helper",
    href: "/services/research-help",
  },
};

export default guide;