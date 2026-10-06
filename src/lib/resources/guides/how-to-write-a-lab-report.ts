import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-write-a-lab-report",
  category: "research",
  title: "How to Write a Lab Report: Step-by-Step Guide",
  h1: "How to Write a Lab Report: Step-by-Step Guide",
  seoTitle: "How to Write a Lab Report: Step-by-Step Guide | Acadivo",
  description:
    "How to write a lab report: the purpose, method, results, and discussion sections explained, with guidance on tables, figures, uncertainty, and common mistakes.",
  ogDescription:
    "The four sections of a lab report, what belongs in each, and how to write a discussion that earns marks rather than repeating results.",
  readingMinutes: 4,
  featured: true,
  intro: [
    "A lab report is a record of an experiment and, more importantly, an argument about what the results mean. Most marks are lost not in the method, where students are often over-detailed, but in the discussion, where students simply restate their numbers.",
    "This guide covers the purpose of each section, what to include and omit, and how to write a discussion that explains rather than repeats.",
  ],
  sections: [
    {
      heading: "The Purpose of a Lab Report",
      blocks: [
        {
          t: "p",
          v: "Your instructor can already see the method — they ran the session. The report exists so that someone who was not there can understand what you did, what you observed, and what you conclude. That framing decides a lot of choices: include enough detail to reproduce the work, and none of the detail that is not needed for that.",
        },
      ],
    },
    {
      heading: "Aim and Hypothesis",
      blocks: [
        {
          t: "p",
          v: "The aim states what the experiment tested, in one sentence, as a measurable question. The hypothesis states what you predicted before you ran it, and whether the result supported it.",
        },
        {
          t: "p",
          v: "Reporting the hypothesis honestly matters. Writing \"the hypothesis was disproved\" is a correct and expected scientific outcome. If no hypothesis was set, say so rather than inventing one after the fact.",
        },
      ],
    },
    {
      heading: "Method",
      blocks: [
        {
          t: "p",
          v: "Write it so a competent person could repeat the experiment. Write it in the past tense, in third or first person plural, and use the passive voice where you are describing procedure (\"the sample was heated to 60 °C\").",
        },
        {
          t: "ul",
          v: [
            "Apparatus and materials, with model numbers where relevant.",
            "Exact quantities, concentrations, and volumes.",
            "Conditions: temperature, duration, pH, instrument settings.",
            "How measurements were taken and how many times (repeats matter).",
            "Any deviations from the standard method, stated clearly — this is not a penalty, it is expected honesty.",
          ],
        },
        {
          t: "p",
          v: "Do not narrate the session. \"We walked to the bench and set up the clamp\" is not method; \"the burette was clamped at 150 mm\" is.",
        },
      ],
    },
    {
      heading: "Results",
      blocks: [
        {
          t: "p",
          v: "Present the data. Do not interpret it here. Results are usually the shortest section, because the analysis belongs in the discussion.",
        },
        {
          t: "checklist",
          v: [
            "Every table has a number, a title, and units in the headings.",
            "Averages are given with a measure of variability (standard deviation or range) and the number of repeats.",
            "Significant figures match the precision of the instrument.",
            "Figures have axis labels, units, and legends.",
            "Nothing is copied in by hand if a spreadsheet can produce it.",
          ],
        },
        {
          t: "note",
          title: "On uncertainty",
          v: "Always state the number of repeats. A mean without n tells the reader nothing about reliability, and it is the most common omission in student lab reports.",
        },
      ],
      links: [{ label: "How to approach a data analysis assignment", slug: "how-to-analyze-data" }],
    },
    {
      heading: "Discussion",
      blocks: [
        {
          t: "p",
          v: "This is where the marks are, and where most reports fail. The discussion has four jobs, in order:",
        },
        {
          t: "ol",
          v: [
            "State what the main findings were, briefly, referencing tables and figures.",
            "Explain them: why did you get this result? Link the mechanism to the observation.",
            "Compare with theory, published values, or literature values, and quantify any discrepancy.",
            "Evaluate: what were the limitations, sources of uncertainty, and errors? Would they change the conclusion?",
          ],
        },
        {
          t: "p",
          v: "Be specific about error. \"Errors were minimal\" is not analysis. \"The systematic offset of about 2 °C likely reflects the uncalibrated thermocouple, since the ice-point check drifted over the session\" is.",
        },
        {
          t: "example",
          label: "Weak vs strong",
          v: [
            "Weak: \"The results were as expected and the experiment was successful.\"",
            "Strong: \"The measured rate constant of 0.042 min⁻¹ sits 11% below the literature value of 0.047 min⁻¹. Given the thermometer's ±0.5 °C uncertainty across a 60 °C span, temperature alone accounts for roughly half that gap; the remainder is consistent with the sample being warmed during transfer.\"",
          ],
        },
      ],
      links: [
        { label: "How to interpret statistical results", slug: "how-to-interpret-statistical-results" },
        { label: "How to write a research methodology", slug: "how-to-write-a-research-paper" },
      ],
    },
    {
      heading: "Abstract, References, Appendices",
      blocks: [
        {
          t: "ul",
          v: [
            "Abstract: 150–250 words covering aim, method, key results with numbers, and conclusion. Written last.",
            "References: full details of every source you cited, in the required style.",
            "Appendices: raw data, full calculation steps, and graphs too large for the body.",
          ],
        },
      ],
      links: [{ label: "APA citation guide", slug: "apa-citation-guide" }],
    },
    {
      heading: "Common Mistakes",
      blocks: [
        {
          t: "ul",
          v: [
            "Giving a percentage error without explaining the source of the discrepancy.",
            "Reporting a mean with no repeat count or variability measure.",
            "Writing the discussion as a restatement of the results.",
            "Over-detailing the method with session narrative.",
            "Plotting categories on a line chart where the axis is not continuous.",
            "Drawing a causal conclusion from a single trial.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Results present data; discussion explains it. Mixing them loses marks.",
    "Always report n and a measure of variability with every mean.",
    "Explain discrepancies quantitatively rather than calling them \"small\".",
    "Include deviations from the standard method — that is honesty, not penalty.",
  ],
  checklist: [
    "My aim is a measurable question and my hypothesis is stated honestly",
    "Someone else could repeat my method from what I wrote",
    "Deviations from the standard procedure are stated",
    "Every table and figure is numbered, titled, and has units",
    "Means include n and a measure of variability",
    "Significant figures match instrument precision",
    "My discussion explains rather than restates",
    "Errors and limitations are specific and quantified",
    "Citations and references are complete",
  ],
  mistakes: [
    "Narrating the practical session in the method.",
    "Reporting means without repeat counts.",
    "Calling a result \"as expected\" without saying why you expected it.",
    "Quoting a percentage error and offering no explanation.",
    "Interpreting data inside the results section.",
    "Using line graphs for non-continuous categories.",
  ],
  related: [
    { slug: "how-to-write-a-report", label: "How to Write a Report: Structure, Format & Examples" },
    { slug: "how-to-analyze-data", label: "How to Approach a Data Analysis Assignment" },
    { slug: "how-to-interpret-statistical-results", label: "How to Interpret Statistical Results" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
  ],
  subjects: [
    { slug: "biology", label: "Biology" },
    { slug: "chemistry", label: "Chemistry" },
    { slug: "physics", label: "Physics" },
    { slug: "statistics", label: "Statistics" },
  ],
  service: {
    title: "Working on a lab report?",
    body: "Find a helper to work through your method, results, and discussion before you submit.",
    cta: "Find a Lab Report Helper",
    href: "/browse-helpers",
  },
};

export default guide;