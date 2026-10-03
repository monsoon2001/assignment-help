import type { Metadata } from "next";
import SubjectDetail from "@/components/marketing/subject-detail";
import { SUBJECT_CONTENT_BY_SLUG } from "@/lib/subject-content";

const subject = SUBJECT_CONTENT_BY_SLUG.get("business-studies")!;

export const metadata: Metadata = {
  title: subject.title,
  description: subject.description,
  alternates: { canonical: `https://acadibo.com/subjects/business-studies` },
  openGraph: {
    title: subject.title,
    description: subject.ogDescription,
    type: "website",
    url: `https://acadibo.com/subjects/business-studies`,
  },
};

export default function Page() {
  return <SubjectDetail subject={subject} />;
}
