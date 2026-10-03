import Link from "next/link"
import { ChevronRight, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Math Assignment Help & Tutoring | Acadibo",
  description: "Get expert math assignment help for algebra, calculus, geometry, statistics, and more with verified tutors.",
  alternates: { canonical: "https://acadibo.com/subjects/mathematics" },
  openGraph: {
    title: "Math Assignment Help & Tutoring | Acadibo",
    description: "Step-by-step math tutoring and assignment help for all levels from verified mentors.",
    type: "website",
    url: "https://acadibo.com/subjects/mathematics",
  },
}

const topics = ["Algebra", "Calculus", "Geometry", "Trigonometry", "Linear Algebra", "Statistics", "Discrete Math", "Precalculus"]

const steps = [
  { num: "1", title: "Request", desc: "Share your math problem" },
  { num: "2", title: "Choose helper", desc: "Pick a verified math tutor" },
  { num: "3", title: "Chat", desc: "Clarify before quote" },
  { num: "4", title: "Quote", desc: "Clear pricing" },
  { num: "5", title: "Pay", desc: "Secure via Stripe" },
  { num: "6", title: "Solve together", desc: "Understand step by step" },
]

const faqs = [
  { q: "Can you help with calculus problems?", a: "Yes, we cover limits, derivatives, integrals, and series." },
  { q: "Do you explain steps?", a: "Absolutely. We focus on teaching you the method, not just the answer." },
  { q: "What levels?", a: "High school, college, undergraduate, and graduate as needed." },
]

export default function MathematicsPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/subjects" className="hover:text-primary transition-colors">Subjects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Mathematics</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-3">Math Assignment Help & Tutoring</h1>
          <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed">
            Need help with a math assignment? Get clear, step-by-step explanations from verified math tutors.
          </p>
          <div className="mt-6">
            <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm">
              Find a Math Tutor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <section className="py-12 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-6 text-center">Popular Math Help</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {topics.map(t => <span key={t} className="px-4 py-2 rounded-full bg-surface-container-lowest border border-outline-variant text-sm font-medium text-on-surface-variant">{t}</span>)}
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-8 text-center">How Acadibo works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {steps.map(s => (
              <div key={s.num} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-primary-container/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">{s.num}</div>
                  <h3 className="font-display font-bold text-on-surface">{s.title}</h3>
                </div>
                <p className="text-sm text-on-surface-variant">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-8 text-center">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 group">
                <summary className="cursor-pointer list-none flex items-center justify-between text-on-surface font-medium">
                  {f.q}
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="mt-3 text-sm text-on-surface-variant">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm">
              Find a Math Tutor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
