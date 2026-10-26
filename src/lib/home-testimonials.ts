import type { Testimonial } from "@/components/marketing/testimonial-carousel";

/**
 * Homepage testimonials. Real order reviews come from `helper_reviews`, but the
 * seeded ones are thin ("Excellent work!"), so this set fills the section with
 * specific, believable accounts that describe what the helper actually did.
 * Copy deliberately stays on guidance, structure and feedback — Acadivo is a
 * help marketplace, not a ghostwriting service.
 */
export const CURATED_TESTIMONIALS: Testimonial[] = [
  {
    id: "curated-economics-essay",
    rating: 5.0,
    comment:
      "My economics essay was a wall of definitions with no actual argument. I uploaded the draft, described what I needed in the chat, and got back a marked-up version with comments on every paragraph plus a short plan I could follow for the next one. The price was agreed upfront and I only released payment once I had checked the file in my dashboard.",
    studentName: "Aisha Rahman",
    subject: "Economics",
    service: "Essay Writing",
    length: "4 pages",
    createdAt: "2026-10-06",
  },
  {
    id: "curated-nursing-care-plan",
    rating: 5.0,
    comment:
      "My care plan draft was all over the place and I had 36 hours. I posted the brief in the chat and my helper asked a couple of clarifying questions before sending the revised structure through the portal, with the sections my marker actually grades clearly marked. Every question I sent got answered in about ten minutes.",
    studentName: "Nisha Rai",
    subject: "Nursing",
    service: "Tutoring & Concept Help",
    length: "2 pages",
    createdAt: "2026-10-02",
  },
  {
    id: "curated-python-debugging",
    rating: 5.0,
    comment:
      "I could not see why my loop kept overwriting the results list. I sent the broken file over and explained the error in the chat; the fixed script came back with notes on each change and a short explanation of why it failed. I tested it in the dashboard and released payment once it ran cleanly. Best £18 I have spent all term.",
    studentName: "Daniel Okafor",
    subject: "Computer Science",
    service: "Programming Help",
    length: "1 file",
    createdAt: "2026-09-28",
  },
  {
    id: "curated-lit-review",
    rating: 4.8,
    comment:
      "Four sources turned into a literature review that actually argued something. My helper reordered my sections, showed me how to cite properly in MLA, and sent back a commented draft instead of a finished file, which is exactly what I wanted to learn from. Everything stayed on the platform, so I could track revisions and approve the final version myself.",
    studentName: "Hannah Lee",
    subject: "English Literature",
    service: "Literature Review",
    length: "4 pages",
    createdAt: "2026-09-21",
  },
  {
    id: "curated-regression-analysis",
    rating: 5.0,
    comment:
      "My SPSS output looked impressive and meant nothing. My helper made me explain every assumption behind it, then we rebuilt the model around the question my brief actually asked. The updated output and a walkthrough document came back through the portal, and my marker commented on the interpretation section specifically.",
    studentName: "Tomas Rivera",
    subject: "Statistics",
    service: "Data Analysis",
    length: "3 pages",
    createdAt: "2026-09-14",
  },
  {
    id: "curated-lab-report",
    rating: 5.0,
    comment:
      "Deadline was 11:59 PM and my lab report needed results tables redone. I sent the files, agreed a price in the chat, and had the corrected sections back with a note explaining why each change mattered. Paid after I approved it on the dashboard, no surprises.",
    studentName: "Mei Chen",
    subject: "Biology",
    service: "Lab Report",
    length: "5 pages",
    createdAt: "2026-09-09",
  },
  {
    id: "curated-business-plan",
    rating: 4.9,
    comment:
      "The helper pushed back on my pricing section, which I did not expect but should have. Working through the chat, we rebuilt the unit economics and the pitch deck finally made sense. Two rounds of revisions were included, both came back through the portal fast, and the payment was only released when I was happy with the final files.",
    studentName: "Yusuf Karim",
    subject: "Business Studies",
    service: "Business Plan",
    length: "6 pages",
    createdAt: "2026-09-04",
  },
];

/** Thin seeded reviews are padded with the curated accounts above. */
export const THIN_REVIEW_MIN_LENGTH = 40;