import Link from "next/link";
import { CtaBand, PAGE_TONES, PageHeader } from "@/components/marketing/page-shell";
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
      <PageHeader
        tone="violet"
        icon="category"
        eyebrow="All Subjects"
        title="Assignment Help by Subject"
        subtitle="Pick a subject to see the topics we cover, find relevant helpers, and choose who you want to work with before you pay."
        crumbs={[{ label: "Home", href: "/" }, { label: "Subjects" }]}
      />

      <div className="bg-white wash-split">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {SUBJECT_GROUPS.map((group, gi) => {
          const groupTone = [PAGE_TONES.violet, PAGE_TONES.teal, PAGE_TONES.amber, PAGE_TONES.rose][gi % 4];
          return (
          <div key={group.category} className="mb-16 last:mb-0">
            <div className="flex items-center gap-3 mb-6">
              <span className={`h-1 w-10 rounded-full bg-gradient-to-r ${groupTone.hairline}`} aria-hidden="true" />
              <h2 className="font-display text-2xl font-bold text-on-surface">{group.category}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.subjects.map((s) => (
                <Link
                  key={s.slug}
                  href={`/subjects/${s.slug}`}
                  className={`relative overflow-hidden bg-white rounded-2xl p-6 border ${groupTone.card} shadow-sm ${groupTone.cardHover} transition-all group`}
                >
                  <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${groupTone.hairline}`} aria-hidden="true" />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${groupTone.iconTile}`}>
                    <span className={`material-symbols-outlined ${groupTone.icon}`}>{s.icon}</span>
                  </div>
                  <h3 className={`font-display font-bold text-on-surface mb-2 transition-colors ${groupTone.text}`}>{s.name}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{s.cardDesc}</p>
                  <p className={`text-xs font-semibold ${groupTone.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {s.subtopics.length} topics →
                  </p>
                </Link>
              ))}
            </div>
          </div>
          );
        })}
      </div>
      </div>

      <CtaBand
        eyebrow="travel_explore"
        title="Don't see your subject?"
        body="We're always expanding. Contact us and we'll do our best to find a helper for your specific subject."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: `Browse All ${SUBJECT_CONTENT.length} Subjects`, href: "/browse-helpers" }}
      />
    </>
  );
}