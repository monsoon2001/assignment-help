import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-interpret-statistical-results",
  category: "technical",
  title: "How to Interpret Statistical Results in Academic Work",
  h1: "How to Interpret Statistical Results in Academic Work",
  seoTitle: "How to Interpret Statistical Results in Academic Work | Acadibo",
  description:
    "How to interpret statistical results for academic writing: what p-values, confidence intervals, effect sizes, and correlation coefficients actually tell you.",
  ogDescription:
    "What p-values, confidence intervals, effect sizes, and correlation coefficients mean in practice, and how to write conclusions that do not overstate them.",
  readingMinutes: 4,
  intro: [
    "Statistical output is easy to obtain and easy to over-interpret. A p-value of 0.03 does not mean there is a 3% chance your result is wrong, and a strong correlation does not tell you which variable caused which.",
    "This guide explains what the common outputs actually mean, and how to write about them without overstating.",
  ],
  sections: [
    {
      heading: "The P-Value, Precisely",
      blocks: [
        {
          t: "p",
          v: "A p-value is the probability of observing data at least as extreme as yours, assuming the null hypothesis is true. It is a property of your data and your model — not a probability that your conclusion is correct.",
        },
        {
          t: "ul",
          v: [
            "It does not tell you the probability that the null hypothesis is true.",
            "It does not measure effect size. With a large enough sample, a trivial effect produces a tiny p-value.",
            "A non-significant result does not prove there is no effect; it means the study did not detect one, often because it was underpowered.",
          ],
        },
        {
          t: "example",
          label: "Why sample size matters",
          v: [
            "Two studies report \"significant\" effects on wellbeing.",
            "Study A: n = 40, p = .049, d = 0.30 (small effect).",
            "Study B: n = 4,000, p < .001, d = 0.08 (negligible effect).",
            "Study B is more statistically significant and far less practically important.",
          ],
        },
      ],
    },
    {
      heading: "Confidence Intervals",
      blocks: [
        {
          t: "p",
          v: "A 95% confidence interval gives a range of plausible values for your effect. It is usually more informative than a p-value, and you should report it when your field allows.",
        },
        {
          t: "p",
          v: "Interpret by looking at what the interval excludes, not at whether it includes zero. An interval of 0.2 to 1.1 excludes zero and tells you the effect is at least small. An interval of −0.4 to 0.9 includes zero and the data cannot rule out no effect.",
        },
      ],
    },
    {
      heading: "Effect Sizes",
      blocks: [
        {
          t: "p",
          v: "Effect sizes describe magnitude. Most rubrics expect at least one, and Cohen's conventional thresholds — 0.2 small, 0.5 medium, 0.8 large — are crude defaults rather than universal cut-offs, so interpret them in context.",
        },
        {
          t: "note",
          title: "Statistical versus practical significance",
          v: "Practical significance asks whether the effect matters in the real context. A treatment that improves scores by 0.4% may be statistically significant and practically useless. Say which one you are discussing.",
        },
      ],
      links: [{ label: "How to approach a data analysis assignment", slug: "how-to-analyze-data" }],
    },
    {
      heading: "Correlation",
      blocks: [
        {
          t: "p",
          v: "The correlation coefficient r runs from −1 to +1 and measures the strength and direction of a linear association. Three cautions:",
        },
        {
          t: "ul",
          v: [
            "Correlation is not causation. A relationship can arise from a third variable, or from reverse causation.",
            "r is sensitive to outliers. Always plot the data before reporting r.",
            "r = 0.3 can represent a weak linear relationship, a strong non-linear one, or two clusters — the scatter plot tells you which.",
          ],
        },
      ],
    },
    {
      heading: "Interpreting a Null Result",
      blocks: [
        {
          t: "p",
          v: "\"Not statistically significant\" means the study did not find sufficient evidence to reject the null hypothesis. It does not mean there is no effect.",
        },
        {
          t: "p",
          v: "Before concluding there is no effect, consider: was the sample large enough to detect the effect you care about, and was the measure sensitive enough to detect it? A null result from an underpowered study is uninformative.",
        },
      ],
    },
    {
      heading: "Writing About Results",
      blocks: [
        {
          t: "table",
          head: ["Weak phrasing", "Stronger phrasing"],
          rows: [
            ["\"The result was significant\"", "\"The effect was statistically significant and practically substantial (d = 0.65)\""],
            ["\"There was no significant difference\"", "\"The study did not detect a difference; the interval (−0.3 to 0.6) cannot rule out a small effect\""],
            ["\"The variables are related\"", "\"Higher X was associated with higher Y (r = .42, p < .01), though the study design cannot establish causation\""],
            ["\"p = 0.000\"", "\"p < .001\" — p is never exactly zero"],
          ],
        },
        {
          t: "checklist",
          v: [
            "I reported the specific p-value, not just p < .05.",
            "I reported an effect size or confidence interval.",
            "I stated n for each group.",
            "I used non-significant rather than \"no difference\" for null results.",
            "I did not claim causation from a correlational design.",
            "I explained practical significance where relevant.",
            "I reported the analyses I planned, including null findings.",
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
            "Reading p = 0.03 as \"3% chance this is wrong\".",
            "Treating a non-significant result as proof of no effect.",
            "Reporting significance without any effect size.",
            "Claiming causation from a correlation.",
            "Reporting p = 0.000.",
            "Only reporting significant analyses.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "A p-value is not the probability that your conclusion is wrong.",
    "Always pair significance with an effect size or confidence interval.",
    "Correlation does not establish causation.",
    "A non-significant result means not detected, not absent.",
  ],
  checklist: [
    "I reported exact p-values",
    "I reported an effect size or confidence interval",
    "I stated n for each group",
    "I used \"did not detect\" language for null results",
    "I avoided causal claims from correlational data",
    "I discussed practical significance",
    "I reported planned analyses including non-significant ones",
  ],
  mistakes: [
    "Misinterpreting p-values as probabilities of error.",
    "Reporting only p < .05.",
    "Writing \"proves\" instead of \"is associated with\".",
    "Claiming no effect from a null result.",
    "Writing p = 0.000.",
    "Reporting correlation coefficients without checking the scatter plot.",
  ],
  related: [
    { slug: "how-to-analyze-data", label: "How to Approach a Data Analysis Assignment" },
    { slug: "how-to-write-a-lab-report", label: "How to Write a Lab Report" },
    { slug: "how-to-write-a-research-paper", label: "How to Write a Research Paper" },
  ],
  subjects: [
    { slug: "statistics", label: "Statistics" },
    { slug: "psychology", label: "Psychology" },
    { slug: "mathematics", label: "Mathematics" },
    { slug: "nursing", label: "Nursing" },
  ],
  service: {
    title: "Need help interpreting output?",
    body: "Find a helper to work through your statistical output and what it actually supports.",
    cta: "Find a Statistics Helper",
    href: "/browse-helpers",
  },
};

export default guide;