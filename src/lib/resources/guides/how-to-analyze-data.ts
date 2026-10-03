import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-analyze-data",
  category: "technical",
  title: "How to Approach a Data Analysis Assignment",
  h1: "How to Approach a Data Analysis Assignment",
  seoTitle: "How to Approach a Data Analysis Assignment | Acadibo",
  description:
    "How to approach a data analysis assignment: checking your data, choosing appropriate tests, visualising results, and writing up what you found.",
  ogDescription:
    "A workflow for data analysis assignments: validate the dataset, choose methods that fit your data, visualise clearly, and report findings honestly.",
  readingMinutes: 4,
  intro: [
    "Data analysis assignments are usually assessed on method choice, correct execution, and interpretation. Most marks are lost by using a familiar test on data that does not suit it, or by reporting a p-value without saying what it means.",
    "This guide covers the workflow from raw data to written findings, including how to choose an analysis that fits your data and design.",
  ],
  sections: [
    {
      heading: "Understand the Question First",
      blocks: [
        {
          t: "p",
          v: "Write down what you are being asked to find before you touch the data. Most analysis tasks are one of a small number of types, and each implies a method:",
        },
        {
          t: "table",
          head: ["Question type", "Typical analysis"],
          rows: [
            ["Is there a difference between groups?", "t-test, ANOVA, or a non-parametric equivalent"],
            ["Are two variables related?", "Correlation, or regression if you want a prediction"],
            ["What predicts outcome Y?", "Multiple regression"],
            ["Does an intervention change outcomes?", "Paired designs, or comparison of change scores"],
            ["How do categories distribute across time?", "Frequency tables and charts"],
            ["What do open-text responses say?", "Thematic coding — a qualitative method"],
          ],
        },
        {
          t: "p",
          v: "If you cannot name the question type, ask your instructor before analysing. Guessing produces results you cannot justify.",
        },
      ],
    },
    {
      heading: "Clean and Validate the Data",
      blocks: [
        {
          t: "checklist",
          v: [
            "Check row count and column names against the expected structure.",
            "Check for missing values and know whether they are missing at random — this affects which methods are valid.",
            "Check data types: numbers stored as text are a common and easy-to-miss problem.",
            "Look at ranges and spot impossible values (a 200-year-old participant, a negative age).",
            "Check for duplicates.",
            "Look for impossible combinations, such as a recorded value outside the instrument's range.",
            "Decide how to handle missing data, and state your decision in your write-up.",
          ],
        },
        {
          t: "p",
          v: "Do not silently delete outliers to make a result appear. Investigate whether an outlier is an error or a genuine observation, and if you exclude data, say so and justify it.",
        },
      ],
      links: [{ label: "How to write a report", slug: "how-to-write-a-report" }],
    },
    {
      heading: "Choose Methods That Fit",
      blocks: [
        {
          t: "p",
          v: "Two questions decide most choices: are your variables measured or categorised, and is your design paired or independent?",
        },
        {
          t: "table",
          head: ["Variable types", "Design", "Suitable method"],
          rows: [
            ["Both categorical (counts)", "Independent groups", "Chi-square test of independence"],
            ["One categorical, one numeric", "Independent groups", "Independent samples t-test"],
            ["Both numeric, one outcome", "Independent groups", "Independent samples t-test"],
            ["Both numeric, one outcome", "Paired / within-subject", "Paired samples t-test"],
            ["One outcome, two or more groups", "Independent groups", "One-way ANOVA"],
            ["Two numeric variables", "—", "Pearson correlation if assumptions hold, Spearman if not"],
            ["Outcome predicted by several variables", "—", "Multiple regression"],
          ],
        },
        {
          t: "note",
          title: "Check assumptions, or say why you did not",
          v: "Normality and homogeneity assumptions matter for many parametric tests. Check them — with a plot, not only a test — or use a robust alternative and justify it. Reporting the assumption check is itself credited in most rubrics.",
        },
      ],
    },
    {
      heading: "Choose Effect Sizes Over P-Values Alone",
      blocks: [
        {
          t: "p",
          v: "A p-value tells you whether an effect is unlikely under the null hypothesis. It does not tell you whether the effect matters. Report effect sizes alongside:",
        },
        {
          t: "table",
          head: ["Test", "Effect size"],
          rows: [
            ["t-test", "Cohen's d (or Hedges' g for small samples)"],
            ["ANOVA", "Eta-squared or partial eta-squared"],
            ["Correlation", "r"],
            ["Regression", "R², plus standardised coefficients"],
            ["Chi-square", "Cramér's V or the phi coefficient"],
          ],
        },
        {
          t: "p",
          v: "With a large sample, a trivial difference can be statistically significant. Reporting only significance will make your analysis look naive to any marker who knows this.",
        },
      ],
      links: [{ label: "How to interpret statistical results", slug: "how-to-interpret-statistical-results" }],
    },
    {
      heading: "Visualise Clearly",
      blocks: [
        {
          t: "ul",
          v: [
            "Bar charts for categorical comparisons, not line charts.",
            "Line charts only for a genuinely continuous independent variable such as time.",
            "Scatter plots for relationships between two numeric variables, with a fitted line if you have modelled one.",
            "Box plots for comparing distributions across groups.",
            "Always label axes with units, and caption each figure with its takeaway.",
            "Do not use 3-D charts or pie charts with many slices; both distort the information.",
          ],
        },
      ],
    },
    {
      heading: "Write Up Your Findings",
      blocks: [
        {
          t: "example",
          label: "Reporting a result properly",
          v: [
            "Weak: \"The result was significant (p < .05).\"",
            "Strong: \"Mean satisfaction was higher in the treatment group (M = 4.2, SD = 0.9) than in control (M = 3.5, SD = 1.1); t(78) = 4.1, p < .001, d = 0.65. The effect is substantial relative to the 1–5 scale and unlikely to be attributable to chance.\"",
          ],
        },
        {
          t: "checklist",
          v: [
            "I stated n for each group.",
            "I reported the specific p-value, not just p < .05.",
            "I reported an effect size.",
            "I named the test and justified the choice.",
            "I described my missing-data handling.",
            "I showed a figure or table for every reported result.",
            "I said what the result means practically, not only statistically.",
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
            "Using a parametric test on clearly non-normal or ordinal data without justification.",
            "Reporting only the analyses that were significant.",
            "Claiming causation from a cross-sectional association.",
            "Post-hoc testing on every possible comparison without a plan.",
            "Presenting a table of raw data instead of analysis.",
            "Dropping outliers to obtain a cleaner result without reporting it.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Name the question type first; it determines the method.",
    "Clean and validate the data, and document every decision you make.",
    "Match the test to your variable types and design, and check assumptions.",
    "Report effect sizes and exact p-values, not significance alone.",
  ],
  checklist: [
    "I know what question I am answering",
    "I checked the dataset for missing values, duplicates, and impossible values",
    "I documented how I handled missing data",
    "I justified my choice of test",
    "I checked assumptions or explained why I did not",
    "I reported n, exact p-values, and effect sizes",
    "Every result has a figure or table",
    "I explained practical meaning, not only statistical significance",
    "I did not claim causation from a correlational design",
  ],
  mistakes: [
    "Choosing the test before understanding the variables.",
    "Reporting only significant results.",
    "Skipping effect sizes.",
    "Claiming causation from correlation.",
    "Deleting outliers without reporting it.",
    "Presenting raw data tables instead of analysis.",
  ],
  related: [
    { slug: "how-to-interpret-statistical-results", label: "How to Interpret Statistical Results" },
    { slug: "how-to-write-a-lab-report", label: "How to Write a Lab Report" },
    { slug: "how-to-approach-a-programming-assignment", label: "How to Approach a Programming Assignment" },
  ],
  subjects: [
    { slug: "statistics", label: "Statistics" },
    { slug: "mathematics", label: "Mathematics" },
    { slug: "psychology", label: "Psychology" },
    { slug: "nursing", label: "Nursing" },
  ],
  service: {
    title: "Working on an analysis?",
    body: "Find a helper to check your method choice, run your analysis, and interpret the output.",
    cta: "Find a Data Analysis Helper",
    href: "/services/statistics-help",
  },
};

export default guide;