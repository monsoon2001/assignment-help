import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-write-a-research-paper",
  category: "projects",
  title: "How to Write a Research Paper",
  h1: "How to Write a Research Paper",
  seoTitle: "How to Write a Research Paper | Acadibo",
  description:
    "How to write a research paper: the standard IMRaD structure, how to turn a question into a paper, planning chapters, and writing a results section that supports your argument.",
  ogDescription:
    "The IMRaD structure for research papers, with guidance on research questions, methodology, results, and discussion.",
  readingMinutes: 4,
  intro: [
    "A research paper answers a question you have investigated, and shows the reader how you answered it. The format is highly standardised, which makes it easier than it looks: each section does a specific job.",
    "This guide covers the standard structure, how to define a workable research question, and how to write the parts students find hardest — methodology, results, and discussion.",
  ],
  sections: [
    {
      heading: "The Standard Structure (IMRaD)",
      blocks: [
        {
          t: "ol",
          v: [
            "Introduction — context, the problem, your question, and an overview of what you did.",
            "Literature review — what is already known, and the gap your work addresses.",
            "Methodology — design, participants or materials, procedure, analysis, and ethics.",
            "Results — findings, presented, without interpretation.",
            "Discussion — what the findings mean, and how they relate to the literature.",
            "Conclusion — direct answer to the question, plus implications and limitations.",
          ],
        },
        {
          t: "p",
          v: "Some fields use variations — a separate \"Results and Discussion\" section is common in psychology; science papers often use a combined methods/results style. Check your field's conventions and your module's guidance.",
        },
      ],
    },
    {
      heading: "Defining a Researchable Question",
      blocks: [
        {
          t: "p",
          v: "A good question is specific, answerable with the resources you have, and connected to a gap in the literature. Three levels:",
        },
        {
          t: "table",
          head: ["Level", "Example", "Problem"],
          rows: [
            ["Topic", "Social media", "Far too broad"],
            ["Researchable", "How does social media use relate to adolescent friendship quality?", "Workable but large"],
            ["Focused", "To what extent does nightly social media use relate to perceived friendship quality among 16–18 year olds?", "Specific enough to design and analyse"],
          ],
        },
      ],
    },
    {
      heading: "Introduction",
      blocks: [
        {
          t: "p",
          v: "Move from the broad problem down to your specific contribution. A useful sequence: the phenomenon, what is known, what remains unknown, your question, and a one- or two-sentence summary of what you did.",
        },
        {
          t: "p",
          v: "Do not give a full summary of every paper you read here. That belongs in the literature review.",
        },
      ],
    },
    {
      heading: "Methodology",
      blocks: [
        {
          t: "p",
          v: "This section exists so the work can be judged, repeated, and trusted. It should be specific enough that another researcher could repeat it.",
        },
        {
          t: "ul",
          v: [
            "Design — experimental, quasi-experimental, correlational, qualitative, or mixed methods, and why it fits the question.",
            "Participants or materials — sample size, recruitment, inclusion criteria, demographics, or the dataset and why it was chosen.",
            "Procedure — instruments, measures, steps, timeline, and anything administered.",
            "Analysis — statistical tests or coding approach, and what you decided in advance versus after.",
            "Ethics — approval reference, informed consent, and how you protected participants.",
          ],
        },
        {
          t: "p",
          v: "State your decisions honestly. \"We excluded outliers above 3 SD, as pre-specified in our analysis plan\" reads better than hiding an exclusion you decided on after seeing the data — and the second is a genuine integrity problem if undisclosed.",
        },
      ],
      links: [{ label: "How to interpret statistical results", slug: "how-to-interpret-statistical-results" }],
    },
    {
      heading: "Results",
      blocks: [
        {
          t: "p",
          v: "Report findings, in order of importance, with enough detail to reconstruct them. Interpretation belongs in the discussion.",
        },
        {
          t: "checklist",
          v: [
            "Report all planned analyses, including ones that did not reach significance.",
            "Give exact statistics, not just \"significant\".",
            "Include effect sizes and confidence intervals where relevant.",
            "Give n for every statistic.",
            "Use tables and figures for anything with more than about three numbers.",
            "Do not write \"we found that this was significant\" in the results — that is interpretation.",
          ],
        },
      ],
      links: [{ label: "How to approach a data analysis assignment", slug: "how-to-analyze-data" }],
    },
    {
      heading: "Discussion",
      blocks: [
        {
          t: "p",
          v: "Start with a direct answer to your research question, then explain the main finding, then place it in the context of the literature, then address limitations.",
        },
        {
          t: "ul",
          v: [
            "State the answer plainly in the first or second sentence.",
            "Explain the most important finding, not every finding.",
            "Compare with prior work: does it replicate, extend, or contradict?",
            "Offer a mechanism or explanation where the design permits.",
            "Discuss limitations honestly, and say whether they plausibly change your conclusions.",
            "Note what a follow-up study would need to establish.",
          ],
        },
      ],
      links: [{ label: "How to write a literature review", slug: "how-to-write-a-literature-review" }],
    },
    {
      heading: "Conclusion",
      blocks: [
        {
          t: "p",
          v: "Answer the question. State the practical or theoretical implication. Note the main limitation. Avoid adding new findings, and avoid claiming more than your design supports — a correlational study cannot establish causation, whatever you find.",
        },
      ],
    },
    {
      heading: "Common Mistakes",
      blocks: [
        {
          t: "ul",
          v: [
            "Causation claimed from correlational data.",
            "Reporting only significant results.",
            "Reporting \"p < .05\" without the exact value or effect size.",
            "Interpreting results in the results section.",
            "No ethics statement where human participants or data were involved.",
            "A literature review that is a sequence of summaries.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "IMRaD gives each section one job; results report, discussion interprets.",
    "Define a focused question your design can actually answer.",
    "Report exact statistics, effect sizes, and n — including non-significant results.",
    "Do not claim causation from a correlational design.",
  ],
  checklist: [
    "My research question is specific and answerable",
    "My introduction states the gap I address",
    "Methodology is detailed enough to be repeated",
    "Ethics approval is referenced where required",
    "Results report exact statistics with n and effect sizes",
    "All planned analyses are reported, including null results",
    "My discussion answers the question and links to prior work",
    "I have addressed limitations honestly",
    "My conclusion adds no new findings",
  ],
  mistakes: [
    "Claiming causation from a correlational design.",
    "Hiding analyses that did not work.",
    "Interpreting results in the results section.",
    "Omitting the ethics statement.",
    "Writing the literature review as a list of summaries.",
    "Over-generalising beyond the population studied.",
  ],
  related: [
    { slug: "how-to-write-a-literature-review", label: "How to Write a Literature Review" },
    { slug: "how-to-write-a-report", label: "How to Write a Report: Structure, Format & Examples" },
    { slug: "how-to-analyze-data", label: "How to Approach a Data Analysis Assignment" },
    { slug: "how-to-interpret-statistical-results", label: "How to Interpret Statistical Results" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "psychology", label: "Psychology" },
    { slug: "sociology", label: "Sociology" },
    { slug: "statistics", label: "Statistics" },
  ],
  service: {
    title: "Developing a research paper?",
    body: "Find a helper to work through your question, method, and discussion structure with you.",
    cta: "Find a Research Helper",
    href: "/services/thesis-help",
  },
};

export default guide;