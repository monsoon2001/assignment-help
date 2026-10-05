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
    title: "Describe your assignment",
    desc: "Share exactly what you need so helpers can judge the right fit.",
    points: [
      "Pick subject, help type and academic level",
      "Add deadline and expected length",
      "Upload brief, rubric or any reference files",
    ],
  },
  {
    num: "2",
    icon: "group_add",
    title: "Choose a helper",
    desc: "Compare verified helpers who cover your subject.",
    points: [
      "Check ratings, subjects and specialisms",
      "Review their written proposals",
      "Pick the one that fits your budget and timeline",
    ],
  },
  {
    num: "3",
    icon: "receipt_long",
    title: "Approve the proposal",
    desc: "Every quote gives scope, timeline and price in writing.",
    points: [
      "Know exactly what you'll get and when",
      "Request tweaks if anything isn't clear",
      "Pay only when the plan looks right for you",
    ],
  },
  {
    num: "4",
    icon: "task_alt",
    title: "Get it done — review and revise",
    desc: "Track progress and request revisions within the agreed scope.",
    points: [
      "Stay in touch in one secure workspace",
      "Ask for tweaks until it meets the brief",
      "Leave a review when you're satisfied",
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
    title: "You see the price before you pay",
    desc: "Helpers quote the scope, timeline and cost up front, so you can compare like for like instead of discovering a surprise invoice later.",
    points: ["Fixed quote per request", "No bidding wars", "Re-quote if the brief changes"],
  },
  {
    icon: "verified_user",
    title: "Vetted subject helpers",
    desc: "Every helper is reviewed before they can receive requests, and profiles show the subjects and help types they actually cover.",
    points: ["Credential and identity checks", "Subject specialisms listed", "Ratings from completed orders only"],
  },
  {
    icon: "menu_book",
    title: "Guidance, not ghostwriting",
    desc: "Helpers tutor, review and explain. You keep the thinking and the authorship, which keeps the work safe to submit and useful to learn from.",
    points: ["Feedback with reasoning", "Drafts stay yours", "Academic integrity built in"],
  },
  {
    icon: "chat",
    title: "Direct message thread",
    desc: "Talk to the person doing the work, not a support queue. Share files, ask follow-up questions and keep the whole history in one place.",
    points: ["One thread per request", "File sharing built in", "Progress status updates"],
  },
  {
    icon: "replay",
    title: "Unlimited revisions",
    desc: "If the agreed scope is not met, ask for changes as many times as needed at no extra cost. New work outside the scope is quoted separately.",
    points: ["No revision deadlines", "No extra fees in scope", "Scope agreed in the proposal"],
  },
  {
    icon: "lock",
    title: "Private by default",
    desc: "Briefs, files and messages stay inside the platform. Payment is handled by Acadibo so card details are never shared with helpers.",
    points: ["Secure payments", "Private threads and files", "No card details shared"],
  },
];

export type ComparisonRow = {
  criterion: string;
  acadibo: string;
  freelancer: string;
  aiTool: string;
};

export const COMPARISON: ComparisonRow[] = [
  {
    criterion: "Who does the work",
    acadibo: "A verified human helper in your subject",
    freelancer: "Any bidder, credentials often unverified",
    aiTool: "A model — no subject accountability",
  },
  {
    criterion: "Price visibility",
    acadibo: "Quoted in writing before you pay",
    freelancer: "Often negotiated privately, scope unclear",
    aiTool: "Subscription, with unclear limits",
  },
  {
    criterion: "Academic authorship",
    acadibo: "Guidance and feedback you build on",
    freelancer: "Often written for submission as-is",
    aiTool: "Generated text you own the risk of",
  },
  {
    criterion: "Revisions",
    acadibo: "Unlimited within the agreed scope",
    freelancer: "Depends on the individual",
    aiTool: "Re-prompting, no accountability",
  },
  {
    criterion: "Dispute handling",
    acadibo: "Mediated by our academic integrity team",
    freelancer: "Effectively none once paid",
    aiTool: "None",
  },
];

export type Faq = { q: string; a: string };

export const HOME_FAQS: Faq[] = [
  {
    q: "What is Acadibo and how is it different from a writing service?",
    a: `Acadibo is an assignment help marketplace where students choose a verified helper for guidance, feedback and tutoring. Helpers are not ghostwriters: they explain, review and coach, and you stay the author of the work. You choose the helper, agree the scope in a proposal and pay only after you approve it.`,
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
    q: "How do I choose a helper?",
    a: `Browse matched helpers and compare their subjects, specialisms, ratings and bios. Message them with your brief before you commit. Every helper profile lists what they cover, so you can pick someone for your subject and help type.`,
  },
  {
    q: "Is it allowed to use Acadibo for my assignment?",
    a: "Acadibo is a tutoring and academic support platform. Helpers coach, review and give feedback rather than writing your work for submission. Your institution's rules still apply to you, so check your academic integrity policy and use the platform the way you would use a tutor.",
  },
  {
    q: "What happens if I am not satisfied?",
    a: "Ask for revisions first — helpers are expected to keep working until the agreed scope is met. If that does not resolve it, our academic integrity team mediates between you and the helper.",
  },
];

const SUBJECT_HINTS: { match: RegExp; label: string; focus: string }[] = [
  { match: /nursing|anatomy|physiology|biomedical|clinical/i, label: "Clinical & biomedical", focus: "care plans, clinical write-ups, referencing and APA or Harvard style" },
  { match: /computer|python|java|sql|algorithm|data structure|program/i, label: "Programming", focus: "debugging, algorithms, database queries and project walkthroughs" },
  { match: /math|calculus|algebra|statistic|probability|quantitative/i, label: "Quantitative", focus: "derivations, problem sets, hypothesis testing and result interpretation" },
  { match: /physics|mechanics|thermo|electro|quantum|chemistry|organic|inorganic|engineering/i, label: "Physical sciences", focus: "methodology, lab write-ups, modelling assumptions and technical explanations" },
  { match: /psycholog|cognitive|clinical|developmental/i, label: "Psychology", focus: "study design, ethics applications, results interpretation and referencing" },
  { match: /literature|poetry|prose|essay|academic writing|citation|proofread|editing/i, label: "Writing & analysis", focus: "close reading, argument structure, citations and revision strategy" },
  { match: /history|philosophy|politic|sociolog|ethic/i, label: "Humanities & social science", focus: "source analysis, competing arguments and evidence-based essays" },
  { match: /business|econom|management|market|finance/i, label: "Business & economics", focus: "applied analysis, frameworks, data and structured recommendations" },
];

export type HelperFocus = { label: string; focus: string };

// Derives a distinct specialty line per helper from the subjects they actually
// list, so every card reads differently without inventing new credentials.
export function helperFocus(subjects: string[]): HelperFocus {
  const haystack = subjects.join(" ");
  const hit = SUBJECT_HINTS.find((h) => h.match.test(haystack));
  const fallback: HelperFocus = {
    label: "Assignment support",
    focus: "structured guidance, clear feedback and on-time delivery",
  };
  return hit ?? fallback;
}

// A second line of homepage-only detail for the subject cards, keyed by the
// subject page slug. The shorter `cardDesc` from subject-content.ts still leads.
export const HOMEPAGE_SUBJECT_DETAIL: Record<string, string> = {
  "english-literature":
    "Close reading help, poetry and prose interpretation, comparative essays and argument structure for literary analysis and critical responses.",
  mathematics:
    "Step-by-step working for algebra, calculus, geometry and number theory, plus exam technique and how to present a proof or derivation clearly.",
  statistics:
    "Choosing the right test, running analysis in SPSS or R, reading p-values and confidence intervals, and writing up results that hold up to scrutiny.",
  biology:
    "Cell biology, genetics, ecology and anatomy support, including lab report method sections, results tables and how to explain a pathway or process.",
  chemistry:
    "Organic, inorganic and physical chemistry problem sets, reaction mechanisms, calculation walkthroughs and lab methodology written up properly.",
  physics:
    "Mechanics, thermodynamics, electromagnetism and quantum theory worked through clearly, with modelling assumptions and error analysis explained.",
  "computer-science":
    "Programming assignments, algorithm design, data structures, database queries and code walkthroughs with debugging help and testing strategy.",
  engineering:
    "Mechanical, civil and electrical engineering problem sets, design work, technical drawings and clear method write-ups for reports.",
  "academic-writing":
    "Structuring research papers, building arguments, paraphrasing, referencing and proofreading so drafts read like your own work, only sharper.",
};

// Extra detail for the guide category cards, which carry a one-line summary in
// resources/index.ts. Individual guide cards already use their full description.
export const HOMEPAGE_GUIDE_DETAIL: Record<string, string> = {
  writing:
    "Essays, paragraphs, paraphrasing, introductions, conclusions and proofreading — worked through with checklists you can reuse in your next draft.",
  research:
    "Reports, lab write-ups, literature reviews and case studies, including how to structure sections, present findings and reference sources correctly.",
  citations:
    "MLA, APA, Harvard and IEEE style, in-text versus footnote citations, building a reference list and staying clear of accidental plagiarism.",
  projects:
    "Longer research projects and formal academic writing: scoping a question, working with a supervisor, timelines and drafting a proposal.",
  technical:
    "Programming assignments, data analysis and statistics writing, with guidance on presenting results, documenting code and explaining your method.",
  presentations:
    "Slide structure, talk tracks and application essays, including how to cut a long draft into a deck that actually persuades.",
};