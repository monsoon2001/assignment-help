import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { MaterialIcon } from "@/lib/icons-map";
import type { SubjectContent } from "@/lib/subject-content";
import { accentForSubject } from "@/lib/accent-styles";
import { faqJsonLd, jsonLdScript } from "@/lib/seo";
import { CtaBand, PageHeader } from "./page-shell";

const STEPS = [
  {
    num: "1",
    title: "Tell us what you're working on",
    desc: "Share your assignment topic, details, and requirements.",
  },
  {
    num: "2",
    title: "Get matched with a helper",
    desc: "Your brief goes straight to our verified academic helper.",
  },
  {
    num: "3",
    title: "Discuss your requirements",
    desc: "Chat to clarify scope, deadline, and expectations before paying.",
  },
  {
    num: "4",
    title: "Get a personalized proposal",
    desc: "Receive a clear quote with scope and delivery details.",
  },
  {
    num: "5",
    title: "Pay and manage your order",
    desc: "Pay only after accepting, then track everything in one workspace.",
  },
];

export default function SubjectDetail({ subject }: { subject: SubjectContent }) {
  const accent = accentForSubject(subject.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(subject.faqs))}
      />
      <PageHeader
        title={subject.h1}
        subtitle={subject.intro}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Subjects", href: "/subjects" },
          { label: subject.name },
        ]}
      />

      <div className="bg-white border-b border-outline-variant/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-7">
          <div className="flex flex-col sm:flex-row gap-3 text-sm text-on-surface-variant mb-6">
            {["Verified subject helper", "Discuss before you pay", "Personalized proposal"].map(
              (item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 bg-white rounded-full px-3.5 py-1.5 ring-1 ring-primary-container/40"
                >
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </span>
              ),
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity shadow-md shadow-primary-container/30"
            >
              Request {subject.name} Help
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant bg-white rounded-xl font-semibold text-sm text-on-surface hover:bg-white transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>

      <section className="py-12 sm:py-16 bg-white band-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.tile}`}
            >
              <MaterialIcon name={subject.icon} size={20} className={accent.icon} />
            </span>
            <h2 className="font-display text-2xl font-bold text-on-surface">
              {subject.name} Help by Topic
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subject.subtopics.map((t) => {
              return (
                <Link
                  key={t.title}
                  href="/requests/new"
                  className={`bg-white rounded-2xl p-5 border border-outline-variant/40 shadow-sm ${accent.cardHover} transition-all hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <h3 className="font-display font-bold mb-1.5 text-on-surface">
                    {t.title}
                  </h3>
                  <p className="text-base text-on-surface-variant leading-relaxed">{t.blurb}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-4">
              How Acadivo Works
            </h2>
            <p className="text-on-surface-variant max-w-3xl mx-auto">
              Send your brief to our verified helper, communicate before paying, receive a
              personalized proposal, and manage your order in one workspace.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {STEPS.map((s) => {
              return (
                <div
                  key={s.num}
                  className={`bg-white rounded-2xl p-6 border border-outline-variant/40 shadow-sm ${accent.cardHover} transition-all`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-9 h-9 ${accent.tile} rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${accent.icon}`}
                    >
                      {s.num}
                    </div>
                    <h3 className="font-display font-bold text-on-surface text-sm sm:text-base">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-base text-on-surface-variant leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 band-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-8 text-center">
            {subject.name} Assignment Help FAQs
          </h2>
          <div className="space-y-4">
            {subject.faqs.map((f, i) => (
              <details
                key={i}
                className={`bg-white rounded-xl border border-outline-variant/30 p-6 group ${accent.cardHover} transition-colors`}
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-on-surface font-medium">
                  {f.q}
                  <MaterialIcon
                    name="expand_more"
                    size={20}
                    className="transition-transform shrink-0 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-base text-on-surface-variant leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="school"
        title={`Ready to get ${subject.name} help?`}
        body="Send your brief, ask questions, and receive a personalized proposal before you pay."
        primary={{
          label: `Request ${subject.name} Help`,
          href: "/requests/new",
        }}
        secondary={{ label: "Read free guides", href: "/resources" }}
      />
    </>
  );
}
