import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-write-a-personal-statement",
  category: "presentations",
  title: "How to Write a Personal Statement",
  h1: "How to Write a Personal Statement",
  seoTitle: "How to Write a Personal Statement | Acadivo",
  description:
    "How to write a personal statement for university or job applications: selecting material, structuring it, showing motivation honestly, and proofreading.",
  ogDescription:
    "A method for writing personal statements that shows rather than tells, with structure guidance and common mistakes.",
  readingMinutes: 3,
  intro: [
    "A personal statement is a short piece of writing about why you want something and what you have done toward it. Admissions committees and employers read thousands, so the job is to be specific and memorable rather than broadly impressive.",
    "This guide covers what to include, how to structure it, how to show motivation without claiming more than is true, and how to proofread before submitting.",
  ],
  sections: [
    {
      heading: "What the Statement Is For",
      blocks: [
        {
          t: "p",
          v: "Check whether you actually need a personal statement. Many UK and Australian postgraduate applications use a set of specific questions rather than one open statement, and some programmes ask for a CV and references instead. Answer the questions you are given rather than assuming the format.",
        },
        {
          t: "p",
          v: "For undergraduate applications, it usually covers why you want to study the subject, what has led you there, and what you hope to do with it.",
        },
      ],
    },
    {
      heading: "What to Include",
      blocks: [
        {
          t: "ul",
          v: [
            "A concrete motivation tied to something real — a project, a problem, a work placement.",
            "Relevant experience, with what you actually did rather than what your role was called.",
            "One or two specific moments that shaped your direction.",
            "What you want to study and why, beyond the ranking of the course.",
            "What you hope the course will let you do afterwards.",
          ],
        },
        {
          t: "p",
          v: "Choose two or three threads, not everything you have ever done. Depth on a small number of examples beats a list.",
        },
      ],
    },
    {
      heading: "Show, Don't Tell",
      blocks: [
        {
          t: "table",
          head: ["Weak", "Strong"],
          rows: [
            ["\"I am highly motivated and determined.\"", "\"I rewrote our society's intake form after watching two committee members abandon it, which halved processing time.\""],
            ["\"I have excellent communication skills.\"", "\"I presented our findings to a 60-person audience and answered questions I had not anticipated.\""],
            ["\"I am passionate about engineering.\"", "\"I spent a summer rebuilding a community centre's booking system in Python because the paper process kept failing.\""],
            ["\"I am a team player.\"", "\"When our project fell apart in week three, I reassigned tasks and moved the deadline rather than escalate.\""],
          ],
        },
        {
          t: "p",
          v: "Advisors are reading hundreds of statements claiming diligence and teamwork. The statements that stand out contain a detail only you could write.",
        },
      ],
    },
    {
      heading: "Structure",
      blocks: [
        {
          t: "ol",
          v: [
            "Opening: the specific moment or idea that started it. Avoid \"Since I was five...\" unless you can make it interesting.",
            "Body: two or three examples that develop the motivation and show relevant experience.",
            "Your direction: what you want to study and the specific question or problem you want to work on.",
            "Closing: what you hope to do with it, briefly.",
          ],
        },
        {
          t: "note",
          title: "On openings",
          v: "The first line decides whether a tired reader continues. A specific, slightly unexpected opening outperforms \"In today's competitive world\" every time.",
        },
      ],
    },
    {
      heading: "Honesty About Weakness",
      blocks: [
        {
          t: "p",
          v: "Gaps and non-traditional backgrounds are worth addressing honestly and briefly: what happened, what you did, and what you learned. Avoid over-explaining, and never fabricate experience to fill space — admissions teams check, and so do employers.",
        },
        {
          t: "p",
          v: "If you are still deciding between two subjects, saying so honestly and explaining the reasoning is stronger than false certainty.",
        },
      ],
    },
    {
      heading: "Proofreading and Adaptation",
      blocks: [
        {
          t: "checklist",
          v: [
            "It answers the actual prompt and uses the required word count.",
            "Every example is specific and verifiable.",
            "Nothing is exaggerated or invented.",
            "No cliches that could appear in any application: \"eager to learn\", \"team player\", \"proven track record\".",
            "Opening and closing are strong enough to survive being read first and last.",
            "Spelling of the course name and the institution is correct.",
            "Read aloud for rhythm, and have someone else read it for comprehension.",
          ],
        },
        {
          t: "p",
          v: "Adapt it for each application. Recruiters can tell when a statement mentions a module that the course does not offer.",
        },
      ],
    },
  ],
  takeaways: [
    "Answer the prompt you are given; confirm the format before writing.",
    "Two or three specific examples beat a long list.",
    "Show evidence rather than claiming qualities.",
    "Never fabricate experience, and adapt the statement per application.",
  ],
  checklist: [
    "I confirmed the format and word limit",
    "My opening is specific and memorable",
    "Each example shows what I actually did",
    "Claims are accurate and verifiable",
    "I addressed motivation concretely",
    "My closing is forward-looking",
    "I removed generic adjectives and cliches",
    "The course and institution names are correct",
    "I proofread and had a second reader",
  ],
  mistakes: [
    "Rewriting the application question as the opening line.",
    "Listing every activity without depth.",
    "Claiming qualities without evidence.",
    "Fabricating or inflating experience.",
    "Sending the same statement to every programme.",
    "Exceeding the word limit because it felt too important to cut.",
  ],
  related: [
    { slug: "how-to-make-a-presentation", label: "How to Make an Effective Academic Presentation" },
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
  ],
  subjects: [
    { slug: "english-literature", label: "English Literature" },
    { slug: "history", label: "History" },
    { slug: "business-studies", label: "Business Studies" },
  ],
  service: {
    title: "Drafting an application?",
    body: "Find a helper to review your statement for specificity, structure, and whether it answers the prompt.",
    cta: "Find a Personal Statement Helper",
    href: "/browse-helpers",
  },
};

export default guide;