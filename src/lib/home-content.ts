import { SERVICE_TYPES, SUBJECTS } from "./constants";

export type Step = {
  num: string;
  icon: string;
  title: string;
  desc: string;
  points: string[];
};

export const HOME_SERVICE_COUNT = SERVICE_TYPES.length;

export const STEPS: Step[] = [
  {
    num: "1",
    icon: "edit_note",
    title: "Tell us what you're stuck on",
    desc: "One short form. Subject, deadline and roughly how long it needs to be.",
    points: [
      "Pick the subject, help type and level",
      "Add the deadline and length you're working to",
      "Paste the brief or attach the rubric if you have it",
    ],
  },
  {
    num: "2",
    icon: "group_add",
    title: "A helper reads it and replies",
    desc: "Your request goes to a verified helper who works in that subject, not a bidding pool.",
    points: [
      "A real person who knows the subject",
      "They read your actual brief",
      "They answer you in the request thread",
    ],
  },
  {
    num: "3",
    icon: "receipt_long",
    title: "You agree the plan and the price",
    desc: "You get the scope, the timeline and the cost in writing. Nothing starts until you're happy with it.",
    points: [
      "Scope and deadline spelled out",
      "Ask anything before you commit",
      "You pay only once you approve",
    ],
  },
  {
    num: "4",
    icon: "task_alt",
    title: "Work together, then revise",
    desc: "Ask for changes in the same thread. Revisions inside the agreed scope are included.",
    points: [
      "Everything in one workspace",
      "Revise until it matches the brief",
      "Leave a review when you're done",
    ],
  },
];

export type Benefit = {
  icon: string;
  title: string;
  desc: string;
  points: string[];
};

export const BENEFITS: Benefit[] = [
  {
    icon: "request_quote",
    title: "You know the price before you pay",
    desc: "Your helper writes out what you'll get, when, and what it costs. No bidding, no hourly meter running, no invoice you didn't see coming.",
    points: [
      "One fixed quote per request",
      "Re-quoted if the brief changes",
      "Nothing charged until you accept",
    ],
  },
  {
    icon: "verified_user",
    title: "Helpers who actually know the subject",
    desc: "We check who a helper is before they can take requests, and they only cover the subjects they're genuinely good at.",
    points: [
      "Identity and credential checks",
      "Subject specialists, not generalists",
      "Reviews from finished orders only",
    ],
  },
  {
    icon: "menu_book",
    title: "Help you can learn from",
    desc: "Helpers explain and give feedback instead of handing you a finished file. You keep the thinking, and the work stays yours to stand behind.",
    points: [
      "Comments and reasoning, not rewrites",
      "Your draft stays your draft",
      "Built around your integrity policy",
    ],
  },
  {
    icon: "chat",
    title: "One thread, not a support queue",
    desc: "You talk to the person doing the work. Send files, ask the follow-up question, keep the whole history in one place.",
    points: [
      "A single thread per request",
      "Share files as you go",
      "See progress without chasing",
    ],
  },
  {
    icon: "replay",
    title: "Revisions until it's right",
    desc: "If it misses the scope you agreed, ask again — as many times as you need, at no extra cost. New work outside the scope gets its own quote.",
    points: ["No revision deadline", "No extra charge inside scope", "Scope agreed up front"],
  },
  {
    icon: "lock",
    title: "Your work stays between us",
    desc: "Briefs, files and messages live on the platform, and payment runs through Acadivo so your card is never handed to a helper.",
    points: ["Private threads and files", "Payment handled by us", "Helpers never see your card"],
  },
];

// The comparison table that used to live here read like every other generated
// landing page. A short, straight answer does the same job and sounds like a
// person wrote it.
export const TEAM_NOTE = {
  title: "A straight answer about what this is",
  paragraphs: [
    "Most assignment-help sites will not say this out loud, so we will: paying a stranger to write your essay is a bad deal. You learn nothing from it and you cannot defend it if you are asked about it.",
    "Acadivo is a tutoring and academic-support platform. Helpers explain, review and coach. You do the thinking, you keep the authorship, and you pay for clear guidance instead of a black box. Your institution's rules still apply to you, so use us the way you would use a tutor.",
  ],
};

export type Faq = { q: string; a: string };

export const HOME_FAQS: Faq[] = [
  {
    q: "What is Acadivo and how is it different from a writing service?",
    a: `Acadivo is an assignment help service where your request goes to a verified helper for guidance, feedback and tutoring. Helpers are not ghostwriters: they explain, review and coach, and you stay the author of the work. You agree the scope in a proposal and pay only after you approve it.`,
  },
  {
    q: `How many subjects and types of assignment help do you cover?`,
    a: `Helpers cover ${SUBJECTS.length} subject areas from English Literature, History and Philosophy through Mathematics, Statistics, Biology, Chemistry, Physics, Computer Science, Engineering and Nursing, plus Business Studies, Economics, Psychology, Sociology and Political Science. There are ${SERVICE_TYPES.length} help types, from essay writing, report writing and tutoring to lab reports, citations, programming help, data analysis and presentations.`,
  },
  {
    q: "How does pricing work?",
    a: "You describe the assignment and the helper returns a proposal with the scope, deliverables, timeline and price. Nothing is charged until you accept it. If your brief changes, ask for a re-quote before accepting.",
  },
  {
    q: "How quickly will I get a proposal?",
    a: "Most requests receive a first response within a few hours, and usually the same day. Larger research projects take longer because the helper needs to read your brief and assess the scope properly.",
  },
  {
    q: "Can I request revisions?",
    a: "Yes. Revisions are unlimited within the agreed scope, at no extra cost and with no deadline. Work that falls outside the original scope is quoted separately before it starts.",
  },
  {
    q: "Who works on my request?",
    a: "Your request goes straight to our verified academic helper, who reviews your brief and responds with a personalized proposal. You discuss the scope in the request chat before you commit, so nothing starts without your approval.",
  },
  {
    q: "Is it allowed to use Acadivo for my assignment?",
    a: "Acadivo is a tutoring and academic support platform. Helpers coach, review and give feedback rather than writing your work for submission. Your institution's rules still apply to you, so check your academic integrity policy and use the platform the way you would use a tutor.",
  },
  {
    q: "What happens if I am not satisfied?",
    a: "Ask for revisions first — helpers are expected to keep working until the agreed scope is met. If that does not resolve it, our academic integrity team mediates between you and the helper.",
  },
];

// A second line of homepage-only detail for the subject cards, keyed by the
// subject page slug. The shorter `cardDesc` from subject-content.ts still leads.
export const HOMEPAGE_SUBJECT_DETAIL: Record<string, string> = {
  "english-literature":
    "Close reading, comparative argument and structure, shaped into a response that holds up to critical marking.",
  mathematics:
    "Step-by-step working, exam technique, and clear presentation of proofs and derivations.",
  statistics:
    "Choosing the right test, running it in SPSS or R, and explaining p-values and confidence intervals clearly.",
  biology:
    "Support with method sections, results tables, and explaining pathways and processes accurately.",
  chemistry:
    "Reaction mechanisms, calculation walkthroughs, and lab methodology written up properly.",
  physics: "Worked through clearly, with modelling assumptions and error analysis explained.",
  "computer-science":
    "Code walkthroughs, debugging, testing strategy, and database queries explained as you go.",
  engineering:
    "Problem sets, design work and technical drawings, with clear method write-ups for reports.",
  "academic-writing":
    "Structuring arguments, paraphrasing, referencing, and polishing drafts until they read like your own work.",
};

// Extra detail for the guide category cards, which carry a one-line summary in
// resources/index.ts. Individual guide cards already use their full description.
export const HOMEPAGE_GUIDE_DETAIL: Record<string, string> = {
  writing: "Introductions, conclusions and checklists you can reuse in your next draft.",
  research: "How to structure each section, present findings, and reference sources correctly.",
  citations:
    "MLA, APA, Harvard and IEEE, in-text versus footnote, and staying clear of accidental plagiarism.",
  projects: "Scoping a question, working with a supervisor, timelines, and drafting a proposal.",
  technical: "Presenting results, documenting code, and explaining your method clearly.",
  presentations: "Talk tracks, and how to cut a long draft into a deck that actually persuades.",
};
