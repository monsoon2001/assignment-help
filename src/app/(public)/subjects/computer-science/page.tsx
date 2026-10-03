import Link from "next/link"
import { ChevronRight, CheckCircle, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Computer Science Assignment Help & Tutoring | Acadibo",
  description: "Get expert computer science assignment help with programming, algorithms, data structures, Python, Java, C++, SQL, and more. Connect with verified CS tutors.",
  alternates: { canonical: "https://acadibo.com/subjects/computer-science" },
  openGraph: {
    title: "Computer Science Assignment Help & Tutoring | Acadibo",
    description: "Expert CS help with programming, algorithms, data structures, debugging, and projects from verified mentors.",
    type: "website",
    url: "https://acadibo.com/subjects/computer-science",
  },
}

const popularTopics = [
  "Python",
  "Java",
  "C++",
  "SQL",
  "Algorithms",
  "Data Structures",
  "Web Development",
  "Cybersecurity",
  "Database",
]

const steps = [
  { num: "1", title: "Request", desc: "Tell us about your CS assignment" },
  { num: "2", title: "Choose helper", desc: "Pick a verified CS mentor" },
  { num: "3", title: "Chat", desc: "Clarify scope before paying" },
  { num: "4", title: "Quote", desc: "Get a clear price proposal" },
  { num: "5", title: "Pay", desc: "Secure payment via Stripe" },
  { num: "6", title: "Collaborate", desc: "Get help until you're satisfied" },
]

const faqs = [
  {
    q: "Can I get help with debugging code?",
    a: "Yes. Our CS mentors help you understand errors, debug step by step, and learn the fix.",
  },
  {
    q: "What programming languages do you support?",
    a: "We cover Python, Java, JavaScript, C++, C, SQL, and more.",
  },
  {
    q: "Is this tutoring or just solutions?",
    a: "We focus on guiding you to understand concepts, not just handing over answers.",
  },
  {
    q: "Are helpers verified?",
    a: "Yes, all helpers go through a vetting process before they can accept requests.",
  },
]

export default function ComputerSciencePage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/subjects" className="hover:text-primary transition-colors">Subjects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Computer Science</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-3">
            Computer Science Assignment Help
          </h1>
          <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed">
            Need help with a computer science assignment? Get step-by-step guidance from verified CS mentors on
            programming, algorithms, data structures, databases, and more. Learn while you complete your work with
            confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/browse-helpers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm"
            >
              Find a Computer Science Helper
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
          <h2 className="font-display text-2xl font-bold text-on-surface mb-6 text-center">
            Popular Computer Science Help
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {popularTopics.map((t) => (
              <span
                key={t}
                className="px-4 py-2 rounded-full bg-surface-container-lowest border border-outline-variant text-sm font-medium text-on-surface-variant"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-4">How Acadibo works</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Simple, transparent process from request to completion.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-primary-container/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {s.num}
                  </div>
                  <h3 className="font-display font-bold text-on-surface">{s.title}</h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-4">Computer Science Mentors</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Connect with real, verified CS helpers who focus on helping you understand.
            </p>
          </div>
          <div className="text-center">
            <Link
              href="/browse-helpers"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm"
            >
              Browse CS Helpers
              <ArrowRight className="w-4 h-4" />
            </Link>
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
                <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/browse-helpers"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm"
            >
              Find a Computer Science Helper
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
