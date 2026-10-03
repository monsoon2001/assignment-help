import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "Business Assignment Help & Tutoring | Acadibo",
  description: "Get expert business assignment help for marketing, finance, management, strategy, and case studies.",
  alternates: { canonical: "https://acadibo.com/subjects/business" },
  openGraph: {
    title: "Business Assignment Help & Tutoring | Acadibo",
    description: "Expert help for business essays, reports, and case studies.",
    type: "website",
    url: "https://acadibo.com/subjects/business",
  },
}

export default function BusinessPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/subjects" className="hover:text-primary transition-colors">Subjects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Business</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">
            Business Assignment Help & Tutoring
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Get guidance on business strategy, finance, marketing, and management assignments.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
          Find a Business Helper
        </Link>
      </div>
    </>
  )
}
