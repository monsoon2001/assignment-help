import type { Metadata } from "next";
import SubjectDetail from "@/components/marketing/subject-detail";
import { SUBJECT_CONTENT_BY_SLUG } from "@/lib/subject-content";

const subject = SUBJECT_CONTENT_BY_SLUG.get("sociology")!;

export const metadata: Metadata = {
  title: subject.title,
  description: subject.description,
  alternates: { canonical: `https://acadibo.com/subjects/sociology` },
  openGraph: {
    title: subject.title,
    description: subject.ogDescription,
    type: "website",
    url: `https://acadibo.com/subjects/sociology`,
  },
};

export default function Page() {
  return <SubjectDetail subject={subject} />;
}
