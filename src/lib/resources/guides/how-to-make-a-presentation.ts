import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-make-a-presentation",
  category: "presentations",
  title: "How to Make an Effective Academic Presentation",
  h1: "How to Make an Effective Academic Presentation",
  seoTitle: "How to Make an Effective Academic Presentation | Acadibo",
  description:
    "How to prepare an academic presentation: planning your argument, designing slides that support it, managing delivery, and handling questions.",
  ogDescription:
    "A process for building an academic presentation, from message hierarchy through slide design to delivery and questions.",
  readingMinutes: 3,
  intro: [
    "A presentation is not a document with the words removed. It is a structured argument delivered in real time, supported by visual material rather than text.",
    "This guide covers planning, slide design, delivery, and handling questions — the four things that separate a clear talk from a recited one.",
  ],
  sections: [
    {
      heading: "Start With Your Message",
      blocks: [
        {
          t: "p",
          v: "Before opening any software, write one sentence: \"When they leave, my audience will understand that ___\". If you cannot write that sentence, you are not ready to design slides.",
        },
        {
          t: "ol",
          v: [
            "Who is the audience? Their background decides how much you explain.",
            "What do they already know, and what can you assume?",
            "What do you want them to remember in a week? One to three points, not ten.",
            "How much time, and is there a Q&A?",
          ],
        },
      ],
    },
    {
      heading: "Build a Structure",
      blocks: [
        {
          t: "example",
          label: "A workable 12-minute structure",
          v: [
            "0:00–1:00 — Hook: the question or problem you are addressing.",
            "1:00–2:00 — Context: what is already known, and the gap.",
            "2:00–3:00 — Your question or objective.",
            "3:00–6:00 — Approach and evidence: two or three substantive points.",
            "6:00–8:00 — What the findings mean.",
            "8:00–9:00 — Implications and limitations.",
            "9:00–10:00 — Conclusion, stated plainly.",
            "Then Q&A.",
          ],
        },
        {
          t: "p",
          v: "One idea per slide, and roughly one to two minutes per slide is a reasonable planning target for a talk of moderate pace. Cut content rather than speeding up.",
        },
      ],
    },
    {
      heading: "Designing Slides",
      blocks: [
        {
          t: "ul",
          v: [
            "Put a full sentence as your slide title. \"Results\" tells the audience nothing; \"Falling wait times followed triage\" does.",
            "Six lines of text maximum. If a slide is dense, split it or move the detail to a handout.",
            "Use one visual that carries the point — a chart, diagram, or image. Not decoration.",
            "Charts need units, axis labels, and a takeaway caption.",
            "Consistent fonts and colours. Choose two and stick to them.",
            "High contrast. Projected text must be legible from the back of a room.",
          ],
        },
        {
          t: "note",
          title: "Contrast and accessibility",
          v: "Avoid red and green combinations for anything that carries meaning — a large proportion of your audience has some colour vision deficiency. Use labels and shapes as well as colour.",
        },
      ],
    },
    {
      heading: "Delivering",
      blocks: [
        {
          t: "ul",
          v: [
            "Talk to the audience, not the screen. If you must read, read the slide — do not read your notes.",
            "Slow down. Most presenters speak roughly 30% faster under nerves.",
            "Signpost: \"I'll cover three things...\" gives the audience a map.",
            "Pause after a key statement instead of rushing past it.",
            "Handle nerves physically: slow exhale, feet on the floor, arrive early.",
            "Rehearse aloud and time it. Rehearsing silently is much less accurate.",
          ],
        },
      ],
    },
    {
      heading: "Handling Questions",
      blocks: [
        {
          t: "ol",
          v: [
            "Listen to the whole question before answering, and repeat or rephrase it to buy thinking time.",
            "Answer the question asked. If it is not the question you prepared for, answer anyway.",
            "If you do not know, say \"I don't know — that's outside what I looked at, but here's what I'd check.\"",
            "If you disagree with a premise, disagree with the argument, not the person.",
            "Note follow-up questions and send answers afterwards if that helps.",
          ],
        },
      ],
    },
    {
      heading: "Before You Present",
      blocks: [
        {
          t: "checklist",
          v: [
            "My opening and closing sentences are written out.",
            "The deck is legible from the back of the room.",
            "I have a PDF backup in case the room's software differs.",
            "Font sizes are large enough for the room.",
            "File names and versions are correct — you have the right deck.",
            "I have rehearsed with a timer.",
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
            "Reading full sentences off slides.",
            "Using clip art and stock images that add nothing.",
            "Overrunning and rushing the conclusion.",
            "Building slides before deciding your message.",
            "Showing a chart without units or a takeaway point.",
            "Apologising at the start, which spends your first impression.",
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Write your one-sentence message before designing anything.",
    "Slide titles should be full sentences carrying the point.",
    "One idea per slide; cut content rather than speeding up.",
    "Rehearse aloud, time it, and back up your deck as a PDF.",
  ],
  checklist: [
    "My core message is one sentence",
    "I know my audience's background and assumed knowledge",
    "My slides have sentence-style titles",
    "Text density is low",
    "Charts have units and takeaway captions",
    "I have rehearsed aloud and timed it",
    "I have a PDF backup",
    "I have prepared for likely questions",
  ],
  mistakes: [
    "Reading slides verbatim.",
    "Designing slides before knowing the message.",
    "Using visuals that do not carry meaning.",
    "Overrunning time.",
    "Using low-contrast or too-small text.",
    "Relying on the room's laptop and having no backup.",
  ],
  related: [
    { slug: "how-to-write-a-personal-statement", label: "How to Write a Personal Statement" },
    { slug: "how-to-write-an-essay", label: "How to Write an Essay: A Step-by-Step Guide" },
  ],
  subjects: [
    { slug: "business-studies", label: "Business Studies" },
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "engineering", label: "Engineering" },
  ],
  service: {
    title: "Preparing a presentation?",
    body: "Find a helper to review your narrative, slide structure, and rehearsal before you present.",
    cta: "Find a Presentation Helper",
    href: "/services/research-help",
  },
};

export default guide;