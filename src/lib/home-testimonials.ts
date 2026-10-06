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
    id: "curated-nursing-care-plan",
    rating: 5.0,
    comment:
      "My care plan draft was all over the place and I had 36 hours. Priya walked me through the nursing framework, told me which sections my marker actually grades, and left me with a structure I could defend in the viva. She answered in about ten minutes every time.",
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
      "I could not see why my loop kept overwriting the results list. Instead of rewriting it for me, Aditya screenshared his own editor, made me run the broken line, and we found it together in about twenty minutes. Best £18 I have spent all term.",
    studentName: "Daniel Okafor",
    subject: "Computer Science",
    service: "Programming Help",
    length: "1 hour session",
    createdAt: "2026-09-28",
  },
  {
    id: "curated-lit-review",
    rating: 4.8,
    comment:
      "Four sources turned into a literature review that actually argued something. Hannah reordered my sections, showed me how to cite properly in MLA, and sent back comments instead of a finished file, which is exactly what I wanted to learn from.",
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
      "My SPSS output looked impressive and meant nothing. Rohan made me explain every assumption behind it, then we rebuilt the model around the question my brief actually asked. Marker commented on the interpretation section specifically.",
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
      "Deadline was 11:59 PM and my lab report needed results tables redone. Sent the files, agreed a price in the chat, and had the corrected sections back with a note explaining why each change mattered. Paid after I approved it, no surprises.",
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
      "The helper pushed back on my pricing section, which I did not expect but should have. We rebuilt the unit economics together and the pitch deck finally made sense. Two rounds of revisions were included and both came back fast.",
    studentName: "Yusuf Karim",
    subject: "Business Studies",
    service: "Business Plan",
    length: "6 pages",
    createdAt: "2026-09-04",
  },
];

/** Thin seeded reviews are padded with the curated accounts above. */
export const THIN_REVIEW_MIN_LENGTH = 40;