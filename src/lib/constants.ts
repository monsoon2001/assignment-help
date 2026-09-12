export const SUBJECTS = [
  "English Literature",
  "History",
  "Philosophy",
  "Sociology",
  "Political Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Statistics",
  "Computer Science",
  "Engineering",
  "Economics",
  "Business Studies",
  "Psychology",
  "Nursing",
] as const;

// Every "type of help" a student can request. This list is the union of the
// headline services and every item shown in the homepage services marquee, so
// the request form offers all of them.
export const SERVICE_TYPES = [
  "Essay Writing",
  "Report Writing",
  "Homework Help",
  "Project Guidance",
  "Tutoring & Concept Help",
  "Editing & Proofreading",
  // Homepage services marquee
  "Proofreading",
  "Editing",
  "Plagiarism Check",
  "AI Detector",
  "Similarity Check",
  "Paraphrasing",
  "MLA & APA Formatting",
  "Citation & Referencing",
  "Thesis & Dissertation",
  "Case Study",
  "Literature Review",
  "Research Proposal",
  "Lab Report",
  "Math & Statistics Help",
  "Programming Help",
  "Data Analysis",
  "Business Plan",
  "Personal Statement",
  "Presentation & Slides",
] as const;

export const ACADEMIC_LEVELS = [
  "High School",
  "Undergraduate",
  "Graduate",
  "Postgraduate",
] as const;

export const OTHER_OPTION = "Other";

export const OTHER_PREFIX = "Other: ";

export function withCustom(selection: string): {
  isOther: boolean;
  value: string;
  raw: string;
} {
  if (selection.startsWith(OTHER_PREFIX)) {
    return { isOther: true, value: OTHER_OPTION, raw: selection.slice(OTHER_PREFIX.length).trim() };
  }
  return { isOther: false, value: selection, raw: selection };
}

export function composeSelection(label: string, isOther: boolean, custom: string): string {
  if (isOther) return `${OTHER_PREFIX}${custom.trim()}`;
  return label;
}