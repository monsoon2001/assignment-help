import type { Metadata } from "next";
import SubjectDetail from "@/components/marketing/subject-detail";
import { SUBJECT_CONTENT_BY_SLUG } from "@/lib/subject-content";

const subject = SUBJECT_CONTENT_BY_SLUG.get("biology")!;

export const metadata: Metadata = {
  title: subject.title,
  description: subject.description,
  alternates: { canonical: `https://acadivo.com/subjects/biology` },
};

export default function Page() {
  return <SubjectDetail subject={subject} />;
}
