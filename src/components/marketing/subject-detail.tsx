import Link from "next/link";
import { ChevronRight, ArrowRight, CheckCircle } from "lucide-react";
import type { SubjectContent } from "@/lib/subject-content";

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
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/subjects" className="hover:text-primary transition-colors">Subjects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">{subject.name}</span>
          </nav>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-4">
            {subject.h1}
          </h1>
          <p className="text-lg text-on-surface-variant max-w-4xl leading-relaxed mb-6">
            {subject.intro}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 text-sm text-on-surface-variant mb-6">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              Choose a specific helper
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              Discuss before you pay
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              Personalized proposal
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/browse-helpers?subject=${encodeURIComponent(subject.name)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm"
            >
              Find {subject.name} Helpers
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>

      <section className="py-12 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-8 text-center">
            {subject.name} Help by Topic
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subject.subtopics.map((t) => (
              <Link
                key={t.title}
                href={`/browse-helpers?subject=${encodeURIComponent(subject.name)}`}
                className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 hover:shadow-md hover:border-primary-container/40 transition-all"
              >
                <h3 className="font-display font-bold text-on-surface mb-1.5">{t.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{t.blurb}</p>
              </Link>
            ))}
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
            {STEPS.map((s) => (
              <div key={s.num} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-primary-container/10 rounded-full flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {s.num}
                  </div>
                  <h3 className="font-display font-bold text-on-surface text-sm sm:text-base">{s.title}</h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-8 text-center">
            {subject.name} Assignment Help FAQs
          </h2>
          <div className="space-y-4">
            {subject.faqs.map((f, i) => (
              <details key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 group">
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

      <section className="py-16 bg-surface-container-high border-t border-outline-variant/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-on-primary text-3xl">school</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-4">
            Ready to find your {subject.name} helper?
          </h2>
          <p className="text-on-surface-variant mb-8 max-w-xl mx-auto leading-relaxed">
            Browse relevant helpers, ask questions, and receive a personalized proposal before you pay.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/browse-helpers?subject=${encodeURIComponent(subject.name)}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm"
            >
              Find {subject.name} Helpers
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-lowest transition-colors"
            >
              Read free guides
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}