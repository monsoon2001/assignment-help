import Link from "next/link"
import { ChevronRight, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Psychology Assignment Help & Tutoring | Acadibo",
  description: "Get expert psychology assignment help with essays, research papers, case studies, and psychological concepts.",
  alternates: { canonical: "https://acadibo.com/subjects/psychology" },
  openGraph: {
    title: "Psychology Assignment Help & Tutoring | Acadibo",
    description: "Guidance for psychology essays, research, and concepts from verified mentors.",
    type: "website",
    url: "https://acadibo.com/subjects/psychology",
  },
}

const topics = ["Developmental", "Cognitive", "Social", "Clinical", "Research Methods", "Biopsychology", "Abnormal Psych"]
const steps = [
  { num: "1", title: "Request", desc: "Share your psychology assignment" },
  { num: "2", title: "Choose helper", desc: "Pick a verified tutor" },
  { num: "3", title: "Chat", desc: "Clarify scope" },
  { num: "4", title: "Quote", desc: "Clear pricing" },
  { num: "5", title: "Pay", desc: "Secure" },
  { num: "6", title: "Collaborate", desc: "Get structured guidance" },
]
const faqs = [
  { q: "Can you help with APA formatting?", a: "Yes, we help with APA 7 citations, references, and formatting." },
  { q: "Do you help with research papers?", a: "Yes, from literature review to methodology and structure." },
]

export default function PsychologyPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/subjects" className="hover:text-primary transition-colors">Subjects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Psychology</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-3">Psychology Assignment Help & Tutoring</h1>
          <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed">Need help with a psychology assignment? Get structured guidance on essays, research, and concepts.</p>
          <div className="mt-6">
            <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm">
              Find a Psychology Tutor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <section className="py-12 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-6 text-center">Popular Psychology Help</h2>
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
                <summary className="cursor-pointer list-none flex items-center justify-between text-on-surface font-medium">{f.q}<span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span></summary>
                <p className="mt-3 text-sm text-on-surface-variant">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm">
              Find a Psychology Tutor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
