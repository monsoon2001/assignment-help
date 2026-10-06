import Link from "next/link";
import { ChevronRight, ArrowRight, CheckCircle } from "lucide-react";
import type { SubjectContent } from "@/lib/subject-content";
import { CtaBand, PAGE_TONES } from "./page-shell";

const SUBJECT_TONES = [
  PAGE_TONES.violet,
  PAGE_TONES.teal,
  PAGE_TONES.amber,
  PAGE_TONES.rose,
];

const STEPS = [
  { num: "1", title: "Tell us what you're working on", desc: "Share your assignment topic, details, and requirements." },
  { num: "2", title: "Browse relevant helpers", desc: "See helpers relevant to your subject and topic." },
  { num: "3", title: "Choose who you want to work with", desc: "Pick a specific helper based on their expertise and track record." },
  { num: "4", title: "Discuss your requirements", desc: "Chat to clarify scope, deadline, and expectations before paying." },
  { num: "5", title: "Get a personalized proposal", desc: "Receive a clear quote with scope and delivery details." },
  { num: "6", title: "Pay and manage your order", desc: "Pay only after accepting, then track everything in one workspace." },
];

export default function SubjectDetail({ subject }: { subject: SubjectContent }) {
  return (
    <>
      <div className="bg-gradient-to-r from-accent-violet-container/90 via-surface-container-high to-surface-container-low border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-accent-violet transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/subjects" className="hover:text-accent-violet transition-colors">Subjects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">{subject.name}</span>
          </nav>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-4">
            {subject.h1}
          </h1>
          <p className="text-lg text-on-surface-variant max-w-4xl leading-relaxed mb-6">
            {subject.intro}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 text-sm text-on-surface-variant mb-6">
            {["Choose a specific helper", "Discuss before you pay", "Personalized proposal"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 bg-white/70 rounded-full px-3.5 py-1.5 ring-1 ring-accent-violet/20">
                <CheckCircle className="w-4 h-4 text-accent-teal shrink-0" />
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/browse-helpers?subject=${encodeURIComponent(subject.name)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-container to-accent-violet text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity shadow-md shadow-primary-container/30"
            >
              Find {subject.name} Helpers
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant bg-white/80 rounded-xl font-semibold text-sm text-on-surface hover:bg-white transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>

      <section className="py-12 bg-white wash-split">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-1 w-10 rounded-full bg-gradient-to-r from-accent-violet to-accent-violet-container" aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold text-on-surface">
              {subject.name} Help by Topic
            </h2>
            <span className="h-1 w-10 rounded-full bg-gradient-to-r from-accent-violet-container to-accent-violet" aria-hidden="true" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subject.subtopics.map((t, i) => {
              const tone = SUBJECT_TONES[i % SUBJECT_TONES.length];
              return (
              <Link
                key={t.title}
                href={`/browse-helpers?subject=${encodeURIComponent(subject.name)}`}
                className={`relative overflow-hidden bg-white rounded-2xl p-5 pt-6 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}
              >
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.hairline}`} aria-hidden="true" />
                <h3 className={`font-display font-bold text-on-surface mb-1.5 transition-colors ${tone.text}`}>{t.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{t.blurb}</p>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-4">How Acadivo Works</h2>
            <p className="text-on-surface-variant max-w-3xl mx-auto">
              Choose a specific helper, communicate before paying, receive a personalized proposal, and manage
              your order in one workspace.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {STEPS.map((s, i) => {
              const tone = SUBJECT_TONES[i % SUBJECT_TONES.length];
              return (
              <div key={s.num} className={`bg-white rounded-2xl p-6 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 ${tone.iconTile} rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${tone.icon}`}>
                    {s.num}
                  </div>
                  <h3 className="font-display font-bold text-on-surface text-sm sm:text-base">{s.title}</h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white wash-violet">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-8 text-center">
            {subject.name} Assignment Help FAQs
          </h2>
          <div className="space-y-4">
            {subject.faqs.map((f, i) => (
              <details key={i} className="bg-white rounded-xl border border-outline-variant/30 p-6 group hover:border-accent-violet/40 transition-colors">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-on-surface font-medium">
                  {f.q}
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform shrink-0">
                    expand_more
                  </span>
                </summary>
                <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="school"
        title={`Ready to find your ${subject.name} helper?`}
        body="Browse relevant helpers, ask questions, and receive a personalized proposal before you pay."
        primary={{
          label: `Find ${subject.name} Helpers`,
          href: `/browse-helpers?subject=${encodeURIComponent(subject.name)}`,
        }}
        secondary={{ label: "Read free guides", href: "/resources" }}
      />
    </>
  );
}