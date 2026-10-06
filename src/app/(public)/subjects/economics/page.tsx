import type { Metadata } from "next";
import SubjectDetail from "@/components/marketing/subject-detail";
import { SUBJECT_CONTENT_BY_SLUG } from "@/lib/subject-content";

const subject = SUBJECT_CONTENT_BY_SLUG.get("economics")!;

export const metadata: Metadata = {
  title: subject.title,
  description: subject.description,
  alternates: { canonical: `https://acadivo.com/subjects/economics` },
  openGraph: {
    title: subject.title,
    description: subject.ogDescription,
    type: "website",
    url: `https://acadivo.com/subjects/economics`,
  },
};

export default function Page() {
  return <SubjectDetail subject={subject} />;
}
