import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-write-a-thesis-statement",
  category: "writing",
  title: "How to Write a Strong Thesis Statement",
  h1: "How to Write a Strong Thesis Statement",
  seoTitle: "How to Write a Strong Thesis Statement | Acadibo",
  description:
    "Learn what a thesis statement is, the four features of a strong one, and how to turn a research topic into an arguable claim with worked examples.",
  ogDescription:
    "What makes a thesis statement arguable, specific, and defensible — plus five examples of weak claims and how to fix them.",
  readingMinutes: 3,
  intro: [
    "A thesis statement is one or two sentences that tell a reader what your essay will argue. It is the most important sentence in the piece, because everything else has to support it.",
    "This guide covers what a thesis actually does, the four features that make one strong, and how to build one from a topic you have been given. It is useful whether you are writing a five-paragraph essay or the introduction to a research paper.",
  ],
  sections: [
    {
      heading: "What Is a Thesis Statement?",
      blocks: [
        {
          t: "p",
          v: "A thesis statement is a sentence that makes a claim about your topic which is arguable and specific. It sits near the end of your introduction and acts as a promise to the reader: this is the position I will defend, using this kind of evidence.",
        },
        {
          t: "p",
          v: "It is not the same as your topic, your conclusion sentence, or a summary of your essay. It is the argument you will spend the essay proving.",
        },
      ],
    },
    {
      heading: "Four Features of a Strong Thesis",
      blocks: [
        {
          t: "ul",
          v: [
            "Arguable. A reasonable person could disagree. If nobody could dispute it, it is a fact or an opinion, not a thesis.",
            "Specific. It says something concrete about your topic rather than \"I will discuss X\".",
            "Narrow enough to defend. It makes a claim you can actually support with the evidence you have or can find.",
            "Matched to the task verb. Argue, evaluate, and compare require different kinds of claim.",
          ],
        },
      ],
    },
    {
      heading: "Turn a Topic Into a Thesis",
      blocks: [
        {
          t: "p",
          v: "Start with the broad topic, add a qualifier, then add a reason. Topic + what you are claiming + why you believe it.",
        },
        {
          t: "example",
          label: "Worked example",
          v: [
            "Topic: renewable energy adoption.",
            "Qualifier: in rural communities.",
            "Claim: rural adoption is limited less by cost than by grid infrastructure.",
            "Reason: because transmission upgrades, not panel price, determine payback in those areas.",
            "Thesis: While panel costs have fallen sharply, rural renewable adoption in the UK is constrained primarily by limited grid capacity rather than by upfront price.",
          ],
        },
      ],
    },
    {
      heading: "Weak Statements and How to Fix Them",
      blocks: [
        {
          t: "table",
          head: ["Weak", "Problem", "Stronger version"],
          rows: [
            [
              "Social media has many effects on teenagers.",
              "Descriptive, not arguable, no scope.",
              "Excessive social media use displaces face-to-face interaction among teenagers aged 13–16.",
            ],
            [
              "In this essay I will discuss climate change.",
              "Announces the topic, claims nothing.",
              "National climate policy will fail to meet emissions targets without coordinated investment in grid storage.",
            ],
            [
              "There are two sides to every issue.",
              "Refuses to take a side.",
              "Although remote work improves flexibility, its effect on junior progression outweighs those benefits in most firms.",
            ],
            [
              "Technology is changing education.",
              "Vague and unfalsifiable.",
              "Lecture recording increases attendance among first-year students, but does not improve examination performance.",
            ],
          ],
        },
      ],
    },
    {
      heading: "Where to Place It",
      blocks: [
        {
          t: "ul",
          v: [
            "Most expository essays: the last sentence of the introduction.",
            "Longer research papers: either the end of the introduction or a clearly labelled standalone section.",
            "Never the whole first paragraph and never buried in the middle of your essay.",
          ],
        },
        {
          t: "p",
          v: "Once drafted, test it: does every body paragraph in your outline relate to this sentence? If a paragraph does not, either the paragraph is irrelevant or the thesis is too vague.",
        },
      ],
    },
    {
      heading: "Thesis Statements for Different Task Verbs",
      blocks: [
        {
          t: "table",
          head: ["Verb", "What the thesis should do", "Example shape"],
          rows: [
            ["Argue", "Take a definite position.", "Although X, Y should be prioritised because Z."],
            ["Discuss", "Present a position on a debate.", "The strongest argument for X rests on Y, while the evidence for Z is weaker."],
            ["Compare / contrast", "State what is importantly different or similar.", "X and Y share Z, but differ fundamentally in how they handle A."],
            ["Evaluate", "Judge weight of evidence and say why.", "X is more persuasive than Y because it accounts for evidence that Z ignores."],
            ["Explain", "Give a reasoned account, not just steps.", "X occurs because A and B interact, not because of A alone."],
          ],
        },
      ],
    },
  ],
  takeaways: [
    "A thesis is an arguable, specific claim your whole essay defends.",
    "Build one from topic + claim + reason.",
    "Place it at the end of the introduction, never mid-paragraph.",
    "Every body paragraph should relate to it — if not, the thesis is too vague.",
  ],
  checklist: [
    "My thesis makes a claim someone could disagree with",
    "It is specific, not a general statement about the topic",
    "It directly matches the task verb in the question",
    "It is in the introduction, clearly visible",
    "I can name the evidence I will use to support it",
    "My outline only contains paragraphs that serve it",
  ],
  mistakes: [
    "Writing a topic statement instead of a claim.",
    "Making a claim so broad you cannot defend it in the word count.",
    "Hiding the thesis in the middle of a paragraph.",
    "Using absolutes like \"always\" or \"never\" that you cannot support.",
    "Changing your position mid-essay without acknowledging the shift.",
    "Announcing the essay rather than arguing in it.",
  ],
  related: [
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
    { slug: "how-to-write-an-introduction", label: "How to Write an Effective Essay Introduction" },
    { slug: "how-to-write-a-conclusion", label: "How to Write a Strong Essay Conclusion" },
    { slug: "how-to-write-a-literature-review", label: "How to Write a Literature Review" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "philosophy", label: "Philosophy" },
    { slug: "english-literature", label: "English Literature" },
  ],
  service: {
    title: "Stuck on your thesis?",
    body: "A helper can help you narrow a topic into a defensible argument and check it against your rubric.",
    cta: "Find an Essay Helper",
    href: "/browse-helpers",
  },
};

export default guide;