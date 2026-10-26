import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, PageHeader } from "@/components/marketing/page-shell";
import { MaterialIcon } from "@/lib/icons-map";
import { SUBJECT_GROUPS, SUBJECT_CONTENT } from "@/lib/subject-content";
import { accentForSubject } from "@/lib/accent-styles";

export const metadata = {
  title: "Assignment Help by Subject | Browse All Subjects | Acadivo",
  description:
    "Explore assignment help by subject. Get a verified helper for computer science, statistics, mathematics, business, academic writing, science, engineering, and more.",
  alternates: { canonical: "https://acadivo.com/subjects" },
};

export default function SubjectsPage() {
  return (
    <>
      <PageHeader
        title="Assignment Help by Subject"
        subtitle="Pick a subject to see the topics we cover, the help we provide, and send your brief to our verified helper before you pay."
        crumbs={[{ label: "Home", href: "/" }, { label: "Subjects" }]}
      />

      <div className="band-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {SUBJECT_GROUPS.map((group, groupIndex) => {
          const groupTone = accentForSubject(group.subjects[0]?.slug ?? String(groupIndex));
          return (
          <div key={group.category} className="mb-10 sm:mb-16 last:mb-0">
            <div className="flex items-center gap-3 mb-6">
              <span className={`h-9 w-1 rounded-full ${groupTone.hairline}`} aria-hidden="true" />
              <h2 className="font-display text-2xl font-bold text-on-surface">{group.category}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.subjects.map((s) => {
                const accent = accentForSubject(s.slug);
                return (
                <Link
                  key={s.slug}
                  href={`/subjects/${s.slug}`}
                  className={`group flex min-h-64 flex-col rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${accent.cardHover}`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.tile}`}>
                      <MaterialIcon name={s.icon} size={24} className={accent.icon} />
                    </span>
                    <h3 className={`font-display font-bold transition-colors ${accent.text}`}>{s.name}</h3>
                  </div>
                  <p className="mb-4 flex-1 text-base leading-relaxed text-on-surface-variant">{s.cardDesc}</p>
                  <p className={`inline-flex items-center gap-1.5 text-sm font-semibold ${accent.text}`}>
                    Explore {s.subtopics.length} topics
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </p>
                </Link>
                );
              })}
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
        secondary={{ label: `Browse All ${SUBJECT_CONTENT.length} Subjects`, href: "/requests/new" }}
      />
    </>
  );
}
