import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { SUBJECT_GROUPS, SUBJECT_CONTENT } from "@/lib/subject-content";

export const metadata = {
  title: "Assignment Help by Subject | Browse All Subjects | Acadivo",
  description:
    "Explore assignment help by subject. Choose a specific helper for computer science, statistics, mathematics, business, academic writing, science, engineering, and more.",
  alternates: { canonical: "https://acadivo.com/subjects" },
  openGraph: {
    title: "Assignment Help by Subject | Acadivo",
    description:
      "Browse assignment help by subject, see topics covered, and choose a specific helper before you pay.",
    type: "website",
    url: "https://acadivo.com/subjects",
  },
};

export default function SubjectsPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Subjects</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">
            Assignment Help by Subject
          </h1>
          <p className="text-on-surface-variant max-w-3xl">
            Pick a subject to see the topics we cover, find relevant helpers, and choose who you want to work with
            before you pay.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {SUBJECT_GROUPS.map((group) => (
          <div key={group.category} className="mb-16 last:mb-0">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-6">{group.category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.subjects.map((s) => (
                <Link
                  key={s.slug}
                  href={`/subjects/${s.slug}`}
                  className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 hover:shadow-md hover:border-primary-container/40 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
                    <span className="material-symbols-outlined text-primary">{s.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-on-surface mb-2">{s.name}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{s.cardDesc}</p>
                  <p className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {s.subtopics.length} topics →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="bg-surface-container-high border-t border-outline-variant/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-3">
            Don&apos;t see your subject?
          </h2>
          <p className="text-on-surface-variant mb-6">
            We&apos;re always expanding. Contact us and we&apos;ll do our best to find a helper for your specific
            subject.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/browse-helpers"
              className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Browse All {SUBJECT_CONTENT.length} Subjects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}