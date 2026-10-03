import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "Math Assignment Help & Tutoring | Acadibo",
  description: "Get expert math assignment help for algebra, calculus, geometry, statistics, and more with verified tutors.",
  alternates: { canonical: "https://acadibo.com/subjects/mathematics" },
  openGraph: {
    title: "Math Assignment Help & Tutoring | Acadibo",
    description: "Step-by-step math tutoring and assignment help for all levels.",
    type: "website",
    url: "https://acadibo.com/subjects/mathematics",
  },
}

export default function MathematicsPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/subjects" className="hover:text-primary transition-colors">Subjects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Mathematics</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">
            Math Assignment Help & Tutoring
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Understand equations step by step with clear explanations from verified math tutors.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
          Find a Math Helper
        </Link>
      </div>
    </>
  )
}
